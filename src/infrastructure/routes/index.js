const { readdirSync } = require("fs");
const { Router } = require("express");
const router = Router();

const PATH_ROUTES = __dirname;

function removeExtension(fileName) {
  const cleanFileName = fileName.split(".").shift();
  return cleanFileName;
}
function loadRouter(file) {
  const name = removeExtension(file);
  if (name !== "index") {
    import(`./${file}`).then((routerModule) => {
      console.log("cargado", name);
      router.use(`/${name}`, routerModule.router);
    });
  }
}

readdirSync(PATH_ROUTES).filter((file) => loadRouter(file));

module.exports = router;
