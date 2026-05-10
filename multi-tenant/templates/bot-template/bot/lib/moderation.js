// ─── MODERACIÓN DE CONTENIDO ─────────────────────────────────────────────────

// Tópicos prohibidos (política, religión, deportes, etc.)
const TOPICOS_PROHIBIDOS = [
  'hitler', 'nazi', 'fascis', 'comunis', 'socialist', 'capitalis',
  'trump', 'biden', 'macri', 'cristina', 'milei', 'massa', 'kirchner',
  'peronismo', 'dictadura', 'palestine', 'israel', 'gaza',
  'dios', 'jesús', 'alá', 'buda', 'religión', 'iglesia', 'biblia', 'corán',
  'aborto', 'drogas', 'armas', 'guerra', 'terroris',
  'messi', 'ronaldo', 'mundial', 'netflix', 'película',
  'fútbol', 'boca', 'river', 'matemática', 'física', 'universidad',
];

// Lenguaje ofensivo (para registrar, no bloquear)
const LENGUAJE_OFENSIVO = [
  'puta', 'puto', 'hijo de puta', 'hija de puta', 'hdp',
  'concha de tu madre', 'pelotudo', 'pelotuda', 'boludo',
  'forro', 'idiota', 'imbécil', 'tarado', 'estúpido',
  'la puta madre', 'me cago en', 'andate a la mierda',
];

function contieneTemaProhibido(texto) {
  const textoLower = texto.toLowerCase();
  for (const palabra of TOPICOS_PROHIBIDOS) {
    if (textoLower.includes(palabra)) {
      return palabra;
    }
  }
  return null;
}

function contieneInsulto(texto) {
  const textoLower = texto.toLowerCase();
  for (const palabra of LENGUAJE_OFENSIVO) {
    if (textoLower.includes(palabra)) {
      return palabra;
    }
  }
  return null;
}

module.exports = {
  contieneTemaProhibido,
  contieneInsulto
};