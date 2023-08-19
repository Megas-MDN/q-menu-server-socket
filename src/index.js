require('dotenv/config');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;
app.use(cors());
app.use(express.json());

// app.use(routes) // routes

app.get('/', (_req, res) =>
  res.status(200).send({ message: `Server Up ${port}` })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  const { restaurant } = socket.handshake.query;
  console.log('Socket id :: %s :: Restaurant :: % ::', socket.id, restaurant);

  if (!restaurant) return;

  socket.join(restaurant);

  socket.on('send-command', (data) => {
    // enviar a comanda
    io.in(restaurant).emit('recive-command', data);
  });

  socket.on('ready-to-get', (data) => {
    // enviar a status pronto para pegar
    io.in(restaurant).emit('go-get', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnect :: %s :: Reason :: %s ::', socket.id, reason);
    socket.leave(restaurant);
  });
});

server.listen(port, () => console.log('Server Up na porta %s', port));
