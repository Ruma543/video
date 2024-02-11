const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');
// socket io connection server side
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
const { ExpressPeerServer } = require('peer');
const opinions = {
  debug: true,
};

app.use('/peerjs', ExpressPeerServer(server, opinions));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});
// connection
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    console.log(roomId, userId, userName);
    setTimeout(() => {
      // socket.to(roomId).broadcast.emit('user-connected', userId);
      socket.broadcast.to(roomId).emit('user-connected', userId);
    }, 1000);
    // message
    socket.on('message', message => {
      console.log(message);
      io.to(roomId).emit('createMessage', message, userName);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
