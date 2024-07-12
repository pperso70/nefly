const { WebSocketServer } = require('ws');

let wss;

exports.handler = async (event, context) => {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws) => {
      console.log('Nouvelle connexion établie');

      ws.on('message', (message) => {
        if (message.length < 100) {
          console.log("Message texte reçu: taille:", message.length, "bytes");
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(message.toString());
            }
          });
        } else {
          console.log("Image reçue, taille:", message.length, "bytes");
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(message);
            }
          });
        }
      });

      ws.on('close', () => console.log('Client déconnecté'));
    });
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: 'WebSocket server is running'
    };
  } else if (event.headers.upgrade === 'websocket') {
    const connection = await context.clientContext.websocket;
    wss.handleUpgrade(event, connection.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, event);
    });
    return {
      statusCode: 101
    };
  } else {
    return {
      statusCode: 400,
      body: 'Bad Request'
    };
  }
};