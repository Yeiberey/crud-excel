const express = require("express");
const path = require("path");

const app = express();

// Indica que la carpeta "public" contendrá archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal, devuelve el archivo "index.html"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
