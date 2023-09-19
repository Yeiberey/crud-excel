const server = require("./src/app.js");
const { conn } = require("./src/db.js");

const PORT = process.env.PORT || 3001;
conn.sync(
  { force: false },
  server.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
  })
);
