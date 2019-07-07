var io = require("socket.io")();
var Ticket = require("../model/ticket.model");

var socketManager = {
  ioSocket: null,
  connect: connect,
  getSocket: () => {
    return socketManager.ioSocket;
  },
  setIOSocket: socket => {
    socketManager.ioSocket = socket;
  }
};

function connect(htpp) {
  io.listen(htpp);
  var playList = [];
  io.on("connection", socket => {
    socketManager.setIOSocket(socket);
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on('play', () => {
      io.emit('play');
    });

    socket.on('pause', () => {
      io.emit('pause');
    });

    socket.on('stop', () => {
      io.emit('stop');
    });

    socket.on('playLoad', (data) => {
      io.emit('playLoad', data);
    });

    socket.on('last', () => {
      io.emit('last');
    })
    socket.on('endedMusic', (data) => {
      Ticket.update({ "_id": data.ticketId, "playList._id": data._id}, {$set: { "playList.$.state": true}}, function(err, doc) {
        if(err) {
          console.log("failed");
        }
        console.log(doc);
      });
      data.state = true;
      io.emit("endedMusic", data);
    });
  });
}

module.exports = socketManager;
