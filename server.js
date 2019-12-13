const express = require("express");
const app = express();
const mongo = require("./db/connect");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require("./routes/api")(app);

async function initDB() {
  const db = await mongo.connect();
  if (db) initExpres();
}
function initExpres() {
  console.log("iniciando instancia de Express...");
  app.listen(4000, () => {
    console.log("el servidor Express está activo");
  });

  process.on("SIGINT", closeApp);
  process.on("SIGTERM", closeApp);
}
function closeApp() {
  mongo.disconnect().then(() => process.exit(0));
}
initDB();
