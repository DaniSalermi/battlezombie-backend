const API_BASE = "/api";
const db = require("../db/index");

module.exports = app => {
  app.get(`${API_BASE}/partidas`, async (request, response) => {
    response.json({ data: "probando api" });
  });

  app.post(`${API_BASE}/select-board`, async (request, response) => {
    let res = await checkGame(request.body);
    response.json(res);
  });

  app.get(
    `${API_BASE}/get-game/:idGame/:idPlayer/:playerNumber`,
    async (request, response) => {
      let res = await db.getGame(
        parseInt(request.params.idGame),
        parseInt(request.params.idPlayer),
        parseInt(request.params.playerNumber)
      );
      if (res.length > 0) {
        response.json(
          formatGame(res[0], parseInt(request.params.playerNumber))
        );
      } else {
        response.json({ error: "No estan correctos los datos" });
      }
    }
  );

  app.post(`${API_BASE}/shot`, async (request, response) => {
    let res = await db.getGame(
      request.body.idGame,
      request.body.idPlayer,
      request.body.playerNumber
    );

    let newData = makeShot(
      request.body.xPosition,
      request.body.yPosition,
      res[0],
      request.body.idPlayer
    );
    await db.shot(request.body.idGame, newData);
    response.json({ hola: "mundo" });
  });
};

function makeShot(x, y, game, idPlayer) {
  if (game.player1.id === idPlayer && game.player1.turn) {
    if (game.player1.playBoard[x][y] === 0) {
      game.player1.playBoard[x][y] = 1;
      if (game.player2.selectedBoard[x][y] === 1) {
        game.player1.playBoard[x][y] = 2;
        game.player2.selectedBoard[x][y] = 2;
        game.player1.score = game.player1.score * game.player1.turnNumber;
        game.player1.turnNumber++;
      } else {
        game.player2.selectedBoard[x][y] = -1;
        game.player1.turnNumber = 1;
        game.player1.turn = false;
        game.player2.turn = true;
      }
    } else {
    }
    if (!lastZombie(game.player2.selectedBoard)) {
      game.endGame = true;
    }
  } else if (game.player2.id === idPlayer && game.player2.turn) {
    if (game.player2.playBoard[x][y] === 0) {
      game.player2.playBoard[x][y] = 1;
      if (game.player1.selectedBoard[x][y] === 1) {
        game.player2.playBoard[x][y] = 2;
        game.player1.selectedBoard[x][y] = 2;
        game.player2.score = game.player2.score * game.player2.turnNumber;
        game.player2.turnNumber++;
      } else {
        game.player1.selectedBoard[x][y] = -1;
        game.player2.turnNumber = 1;
        game.player2.turn = false;
        game.player1.turn = true;
      }
    } else {
    }
    if (!lastZombie(game.player1.selectedBoard)) {
      game.endGame = true;
    }
  }
  return game;
}

// Función para verificar si el disparo se hace al último zombie del tablero
function lastZombie(arrBoard) {
  let arrEndGame = [];
  arrBoard.forEach(element => {
    arrEndGame = arrEndGame.concat(element);
  });
  return arrEndGame.includes(1);
}

function formatGame(game, playerNumber) {
  output = {};
  let rival = playerNumber === 1 ? game.player2 : game.player1;
  output.endGame = game.endGame;
  output.player = playerNumber === 1 ? game.player1 : game.player2;
  output.rival = {
    name: rival.name,
    score: rival.score
  };
  return output;
}

async function checkGame(data) {
  let games = await db.getGameWaitingPlayerTwo();
  if (games.length === 0) {
    let game = await newGame(data.playerName, data.board);
    return { id: game.id, playerId: game.player1.id, player: 1 };
  } else {
    let player2 = games[0].player2;
    player2.name = data.playerName;
    player2.selectedBoard = data.board;
    await db.assingPlayer2(games[0].id, player2);
    return { id: games[0].id, playerId: player2.id, player: 2 };
  }
}

async function newGame(name, selectedBoard, rows = 10, columns = 10) {
  let game = {
    id: getRandomId(),
    rows,
    columns,
    endGame: false,
    player1: {
      id: getRandomId(),
      name: name,
      score: 2,
      turnNumber: 1,
      ready: false,
      selectedBoard: selectedBoard,
      turn: true,
      playBoard: generateBoard(rows, columns)
    },
    player2: {
      id: getRandomId(),
      name: null,
      score: 2,
      turnNumber: 1,
      ready: false,
      selectedBoard: [],
      turn: false,
      playBoard: generateBoard(rows, columns)
    }
  };

  await db.newGame(game);
  return game;
}

function getRandomId() {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
}

function generateBoard(rows, columns) {
  let board = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    board.push(row);
    for (let j = 0; j < columns; j++) {
      board[i].push(0);
    }
  }
  return board;
}
