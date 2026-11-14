/**
 * GOOGLE APPS SCRIPT - statistiques anonymes du jeu
 * 1) Créez un projet Apps Script.
 * 2) Collez ce code dans Code.gs.
 * 3) Déployez > Nouvelle deployment > Application Web.
 *    Exécuter en tant que : Moi
 *    Qui a accès : Tout le monde
 * 4) Copiez l'URL /exec dans le jeu.
 *
 * Les données enregistrées sont uniquement des compteurs agrégés.
 * Pour remettre les résultats à zéro, exécutez resetResults() depuis l'éditeur.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || "stats";
  var props = PropertiesService.getScriptProperties();

  if (action === "vote") {
    var id = String(p.id || "");
    if (!id || id.length > 100) return output({ok:false, error:"missing id"}, p.callback);
    var seen = props.getProperty("seen_" + id);
    if (seen) return output({ok:true, duplicate:true}, p.callback);

    var a = Math.max(0, Math.min(10, parseInt(p.a, 10) || 0));
    var b = Math.max(0, Math.min(10, parseInt(p.b, 10) || 0));
    if (a + b !== 10) return output({ok:false, error:"invalid answers"}, p.callback);

    var total = Number(props.getProperty("total") || 0);
    var sumA = Number(props.getProperty("a") || 0);
    var sumB = Number(props.getProperty("b") || 0);
    props.setProperties({
      total: String(total + 1),
      a: String(sumA + (a > b ? 1 : 0)),
      b: String(sumB + (b >= a ? 1 : 0)),
      ["seen_" + id]: "1"
    });
    return output({ok:true}, p.callback);
  }

  return output({
    total: Number(props.getProperty("total") || 0),
    a: Number(props.getProperty("a") || 0),
    b: Number(props.getProperty("b") || 0)
  }, p.callback);
}
function output(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback && /^[a-zA-Z0-9_]+$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function resetResults() {
  var p = PropertiesService.getScriptProperties();
  p.deleteAllProperties();
}
