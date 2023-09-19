const cors = require("cors");
const routes = require("./infrastructure/routes");
const express = require("express");
const server = express();
const path = require("path");
server.use(cors());
server.use(express.json());

// Indica que la carpeta "public" contendrá archivos estáticos
server.use(express.static(path.join(__dirname, "../public")));

// Ruta principal, devuelve el archivo "index.html"
server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});
server.use(`/`, routes);

module.exports = server;
