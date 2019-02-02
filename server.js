const express = require("express");
const http = require('http');
const path = require('path');

const app = express();

const server = http.createServer(app);
const io = require('socket.io').listen(server);


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods',
   'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});


app.use('/', express.static(path.join(__dirname, 'angular')));

const users = [];

io.on('connection', (socket) => {
  users.push(socket.id);
  console.log('array', users);
  socket.broadcast.to(socket.id).emit('connect');
  socket.on('disconnect', () => {
    console.log('disconnect', users);
    const index = users.findIndex( id => id === socket.id);
    users.splice(index, 1);
  });
  socket.on('message1', (msg) => {
    console.log('msg', users);
    socket.broadcast.to(msg.id).emit('reply', msg.value);
  });
});

app.get('/:id', (req, res, next) => {
  const index = users.findIndex( id => id === req.params.id);
  if (index === -1) return res.status(200).json({status: 'Not connected'});

  res.status(200).json({status: 'Connected'});
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'angular', 'index.html'));
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log("listening on port ", port));
