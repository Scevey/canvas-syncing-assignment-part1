const http = require('http');
const socketio = require('socket.io');
const xxh = require('xxhashjs');

const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (req, res) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
      // if err, throw it for now
    if (err) {
      throw err;
    }
    res.writeHead(200);
    res.end(data);
  });
};

const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);

io.on('connection', (sock) => {
  const socket = sock;
  socket.join('room1');

  socket.user = {
    hash: xxh.h32(`${socket.id}${Date.now()}`, 0xCAFEBABE).toString(16),
    lastUpdate: new Date().getTime(),
    score: 0,
  };

  socket.emit('joined', socket.user);

  socket.on('scoreUpdate', (data) => {
    socket.user = data;
    socket.user.lastUpdate = Date.now();
    socket.user.score += 10;
    socket.emit('updateScore', socket.user);
    socket.broadcast.to('room1').emit('updateScore', socket.user);
  });

  socket.on('disconnect', () => {
    io.sockets.in('room1').emit('left', socket.user.hash);

    socket.leave('room1');
  });
});

console.log(`listening on port ${PORT}`);
