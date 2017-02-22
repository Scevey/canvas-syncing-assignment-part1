const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
// get the PORT for the server
// Remember we use process.env.PORT or process.env.NODE_PORT to check if we are running on a server
// that already has set ports in the environment configuration
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
const drawList = {};
const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);
io.on('connection', (socket) => {
  socket.join('room1');

  socket.on('draw', (data) => {
    drawList[data.time] = data.coords;

    io.sockets.in('room1').emit('draw', drawList);
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
});

console.log(`listening on port ${PORT}`);
