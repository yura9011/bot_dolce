const { productos } = require("./data/productos.js");

// ─── BÚSQUEDA DE PRODUCTOS ───────────────────────────────────────────────────

/**
 * Busca productos en el catálogo usando búsqueda fuzzy simple
 * @param {string} query - Texto de búsqueda del usuario
 * @param {number} limit - Cantidad máxima de resultados (default: 5)
 * @returns {Array} Array de productos encontrados
 */
function buscarProductos(query, limit = 5) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const palabrasClave = queryLower.split(/\s+/);

  // Calcular score de relevancia para cada producto
  const productosConScore = productos.map((producto) => {
    let score = 0;
    const nombreLower = producto.nombre.toLowerCase();
    const categoriaLower = producto.categoria.toLowerCase();
    const descripcionLower = (producto.descripcion || "").toLowerCase();

    // Búsqueda exacta en nombre (mayor peso)
    if (nombreLower.includes(queryLower)) {
      score += 100;
    }

    // Búsqueda por palabras individuales en nombre
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
