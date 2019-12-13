const mongo = require("./connect");
const db_Name = "test";
module.exports = {
  getGames: () => {
    const db = mongo.instance().db(db_Name);
    const partidas = db
      .collection("partidas")
      .find({})
      .toArray();
    return partidas;
  },
  getGameWaitingPlayerTwo: () => {
    const db = mongo.instance().db(db_Name);
    const partidas = db
      .collection("partidas")
      .find({ "player2.name": null, "player1.name": { $ne: null } })
      .toArray();
    return partidas;
  },
  newGame: data => {
    const db = mongo.instance().db(db_Name);
    const partidas = db.collection("partidas").insertOne(data);
    return partidas;
  },
  assingPlayer2: (idGame, player2) => {
    const db = mongo.instance().db(db_Name);
    const partida = db.collection("partidas").updateOne(
      { id: { $eq: idGame } },
      {
        $set: {
          player2: player2
        }
      }
    );
    return partida;
  },
  getGame: (idGame, idPlayer, playerNumber) => {
    const db = mongo.instance().db(db_Name);
    const game = db
      .collection("partidas")
      .find({
        id: { $eq: idGame },
        [playerNumber === 1 ? "player1.id" : "player2.id"]: { $eq: idPlayer }
      })
      .toArray();

    return game;
  },
  shot: (idGame, data) => {
    const db = mongo.instance().db(db_Name);
    const partida = db.collection("partidas").updateOne(
      { id: { $eq: idGame } },
      {
        $set: data
      }
    );
    return partida;
  }
};
