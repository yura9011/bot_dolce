const { productos } = require("./data/productos.js");

// ─── MAPEO DE SINÓNIMOS Y LENGUAJE COLOQUIAL ─────────────────────────────────

const SINONIMOS = {
  // Lenguaje coloquial común
  "cositos": ["decoración", "adornos", "accesorios"],
  "cositas": ["decoración", "adornos", "accesorios"],
  "cosa": ["decoración", "adorno", "accesorio"],
  "cosas": ["decoración", "adornos", "accesorios"],
  
  // Para colgar / decoración colgante
  "colgar": ["guirnalda", "banderín", "colgante", "decoración", "flecos", "cortina"],
  "colgante": ["guirnalda", "banderín", "decoración", "flecos", "cortina"],
  "colgantes": ["guirnaldas", "banderines", "decoración", "flecos", "cortinas"],
  
  // Flecos y cortinas
  "flecos": ["cortina", "guirnalda", "decoración", "colgante", "lluvia"],
  "fleco": ["cortina", "guirnalda", "decoración", "colgante"],
  "lluvia": ["cortina", "flecos", "decoración", "colgante"],
  
  // Pared
  "pared": ["guirnalda", "banderín", "decoración", "cortina", "flecos"],
  
  // Brillante
  "brillante": ["metálico", "dorado", "plateado", "lentejuela", "brillantina"],
  "brillantes": ["metálicos", "dorados", "plateados", "lentejuelas", "brillantina"],
  "brillo": ["metálico", "dorado", "plateado", "lentejuela", "brillantina"],
  "brillos": ["metálicos", "dorados", "plateados", "lentejuelas", "brillantina"],
  
  // Diminutivos
  "globitos": ["globos"],
  "globito": ["globo"],
  "platitos": ["platos"],
  "platito": ["plato"],
  "vasitos": ["vasos"],
  "vasito": ["vaso"],
  "servilletitas": ["servilletas"],
  "servilletita": ["servilleta"],
  "banderitas": ["banderines", "banderín"],
  "banderita": ["banderín"],
  
  // Luces
  "lucecitas": ["luces", "led", "luminoso"],
  "lucecita": ["luz", "led", "luminoso"],
  "luces": ["led", "luminoso", "decoración"],
  
  // Tela/textil
  "tela": ["mantel", "cortina", "decoración"],
  "telita": ["mantel", "cortina", "decoración"],
  
  // Colores comunes
  "doradito": ["dorado"],
  "plateadito": ["plateado"],
  "rosadito": ["rosa", "rosado"],
  "azulito": ["azul"],
  "rojito": ["rojo"],
  "verdecito": ["verde"],
};

/**
 * Expande una consulta con sinónimos y lenguaje coloquial
 * @param {string} query - Consulta original
 * @returns {Array} Array de términos expandidos
 */
function expandirConsulta(query) {
  const queryLower = query.toLowerCase().trim();
  const palabrasOriginales = queryLower.split(/\s+/);
  const terminosExpandidos = new Set(palabrasOriginales);
  
  // Agregar sinónimos para cada palabra
  palabrasOriginales.forEach(palabra => {
    if (SINONIMOS[palabra]) {
      SINONIMOS[palabra].forEach(sinonimo => {
        terminosExpandidos.add(sinonimo);
      });
    }
  });
  
  return Array.from(terminosExpandidos);
}

// ─── BÚSQUEDA DE PRODUCTOS ───────────────────────────────────────────────────

/**
 * Busca productos en el catálogo usando búsqueda fuzzy simple con sinónimos
 * @param {string} query - Texto de búsqueda del usuario
 * @param {number} limit - Cantidad máxima de resultados (default: 5)
 * @returns {Array} Array de productos encontrados
 */
function buscarProductos(query, limit = 5) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  
  // Expandir consulta con sinónimos
  const terminosExpandidos = expandirConsulta(queryLower);
  const palabrasClave = [...new Set([...queryLower.split(/\s+/), ...terminosExpandidos])];

  // Calcular score de relevancia para cada producto
  const productosConScore = productos.map((producto) => {
    let score = 0;
    const nombreLower = producto.nombre.toLowerCase();
    const categoriaLower = producto.categoria.toLowerCase();
    const descripcionLower = (producto.descripcion || "").toLowerCase();
    const textoCompleto = `${nombreLower} ${categoriaLower} ${descripcionLower}`;

    // Búsqueda exacta en nombre (mayor peso)
    if (nombreLower.includes(queryLower)) {
      score += 100;
    }

    // Búsqueda por palabras individuales (incluyendo sinónimos)
    palabrasClave.forEach((palabra) => {
      if (nombreLower.includes(palabra)) {
        score += 50;
      }
      if (categoriaLower.includes(palabra)) {
        score += 30;
      }
      if (descripcionLower.includes(palabra)) {
        score += 10;
      }
    });

    // Bonus si la categoría coincide exactamente
    if (categoriaLower === queryLower) {
      score += 80;
    }
    
    // Bonus para coincidencias múltiples
    const coincidencias = palabrasClave.filter(palabra => textoCompleto.includes(palabra)).length;
    if (coincidencias > 1) {
      score += coincidencias * 5;
    }

    return { ...producto, score };
  });

  // Filtrar productos con score > 0 y ordenar por relevancia
  const resultados = productosConScore
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return resultados;
}

/**
 * Formatea los productos encontrados para incluir en el contexto de Gemini
 * @param {Array} productos - Array de productos
 * @returns {string} Texto formateado con la información de productos
 */
function formatearProductosParaContexto(productos) {
  if (productos.length === 0) {
    return "No se encontraron productos relacionados en el catálogo.";
  }

  let texto = `\n📦 PRODUCTOS ENCONTRADOS EN CATÁLOGO (${productos.length}):\n\n`;

  productos.forEach((p, index) => {
    texto += `${index + 1}. ${p.nombre}\n`;
    texto += `   • Código: ${p.codigo}\n`;
    texto += `   • Categoría: ${p.categoria}`;
    if (p.subcategoria) {
      texto += ` > ${p.subcategoria}`;
    }
    texto += `\n`;

    if (p.precio) {
      texto += `   • Precio: $${p.precio.toLocaleString("es-AR")}\n`;
    } else {
      texto += `   • Precio: Consultar disponibilidad\n`;
    }

    if (p.stock) {
      texto += `   • Stock: ${p.stock}\n`;
    }

    if (p.descripcion && !p.descripcion.includes("Consultar")) {
      texto += `   • Descripción: ${p.descripcion}\n`;
    }

    texto += `\n`;
  });

  return texto;
}

/**
 * Obtiene estadísticas del catálogo
 * @returns {Object} Objeto con estadísticas
 */
function obtenerEstadisticasCatalogo() {
  const totalProductos = productos.length;
  const categorias = [...new Set(productos.map((p) => p.categoria))];
  const productosConPrecio = productos.filter((p) => p.precio !== null).length;

  return {
    totalProductos,
    totalCategorias: categorias.length,
    categorias: categorias.sort(),
    productosConPrecio,
    productosConsultar: totalProductos - productosConPrecio,
  };
}

module.exports = {
  buscarProductos,
  formatearProductosParaContexto,
  obtenerEstadisticasCatalogo,
};
