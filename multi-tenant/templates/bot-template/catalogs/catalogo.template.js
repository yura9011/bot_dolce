// Catálogo de productos para {{CLIENT_NAME}}
module.exports = {
  categorias: [
    {
      nombre: "Categoría 1",
      productos: [
        { nombre: "Producto 1", precio: 100 }
      ]
    }
  ],
  buscarProductos: (query, limit) => {
    // Implementación básica de búsqueda
    return [];
  },
  formatearProductosParaContexto: (productos) => {
    return "";
  }
};
