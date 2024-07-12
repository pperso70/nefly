const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
  res.send("Serveur WebSocket actif");
});

wss.on("connection", (ws) => {
  console.log("Nouvelle connexion établie");

  ws.on("message", (message) => {
    //console.log("Reçu :", message.toString());
    //console.log(typeof message.toString());

    //if (typeof message.toString() === "string") {
    if (message.length < 100) {
      console.log("Message texte reçu: taille:", message.length, "bytes");
      //console.log("Message texte reçu:", message);
      // Diffuser le message à tous les clients connectés
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(message.toString());
        }
      });

      // Traitement des données de capteurs
    } else {
      console.log("Image reçue, taille:", message.length, "bytes");
      // Traitement de l'image (par exemple, sauvegarde ou transmission)

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          //client.send(message.toString());
          client.send(message);
        }
      });
    }
    // Diffusion aux autres clients si nécessaire
  });

  ws.on("close", () => console.log("Client déconnecté"));
});

const listener = server.listen(process.env.PORT, () => {
  console.log("Votre app écoute sur le port " + listener.address().port);
});
