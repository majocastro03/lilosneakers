// server.js
const app = require('./src/app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`✅ Endpoints: /api/categorias, /api/productos, /api/perfiles`);
});