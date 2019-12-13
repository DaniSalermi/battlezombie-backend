const mongoClient = require("mongodb").MongoClient;
const dbHost = "localhost";
const dbPort = 27017;
const dbName = "test";
const connection_URL =
  "mongodb+srv://battlezombiedn:F0jHMGyV1YMLBZcK@cluster0-xtama.mongodb.net/test?retryWrites=true&w=majority";

module.exports = (() => {
  let instance = null;
  let isDisconnecting = false;

  function connect() {
    return new Promise((resolve, reject) => {
      mongoClient.connect(
        connection_URL,
        { useNewUrlParser: true },
        (error, client) => {
          if (error) {
            reject(error);
          }
          console.log("conectando bien al servidor de mongo");
          instance = client;
          console.log(error);
          resolve(client.db(dbName));
        }
      );
    });
  }

  function disconnect() {
    if (instance && !isDisconnecting) {
      isDisconnecting = true;
      console.log("Desconectando instancia de mongo");
      return new Promise((resolve, reject) => {
        instance.close((error, result) => {
          if (error) {
            reject(error);
            isDisconnecting = false;
          }
          console.log("desconectando satisfactorimente del servidor de mongo");
          resolve();
        });
      });
    }
  }
  return { connect, disconnect, instance: () => instance };
})();
