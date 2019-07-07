var express = require("express");
var Ticket = require("../model/ticket.model");
var socket = require("../common/socket.manager");
var config = require("../common/config.env");

var router = express.Router();

router.post("/", (req, res) => {
  config.currentCont++;
  let actual = new Ticket({
    number: config.currentCont,
    dateTicket: config.currentDate,
    playList: [],
    isCompleted: false,
    isRunning: false,
    isDeleted: false
  });
  actual.save(function (err) {
    if (err) {
      return next(err);
    }
    res.send(actual);
  });
});

router.post("/plays", (req, res) => {
  console.log(req.body);
  var io = socket.getSocket();
  io.emit("play", req.body);
  res.sendStatus(200);
});

router.post("/musicdelete", (req, res) => {
  Ticket.findById({ _id: req.body.ticketId }, function (err, data) {
    data.playList.splice(data.playList.findIndex(r => r._id === req.body._id), 1);
    data.save();
    res.sendStatus(200);
  });
});

router.post("/date", (req, res) => {
  var now = new Date(req.body.date);
  now.setHours(24,0,0,0);
  var final = new Date(now.getFullYear(), now.getMonth(), now.getDate() +1 );
final.setHours(0,0,0,0);
  // console.log(startOfToday);
  Ticket.find({ dateTicket: { "$gte" : now, "$lte" : final} }, function (err, docs1) {
    res.send(docs1);
  });
});

router.post("/:id", (req, res) => {
  var ticketId = req.params.id;
  Ticket.findById({ _id: ticketId }, function (err, data) {
    if (data.playList.length < 3) {
      data.playList.push(req.body);
      data.save();

      res.send(data.playList[data.playList.length - 1]);
    } else {
      res.sendStatus(400);
    }
  });
});

router.get("/day", (req, res) => {
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(startOfToday);
  Ticket.find({ dateTicket: { $gte: startOfToday } }, function (err, docs) {
    if (docs.length != 0) {
      config.currentCont = docs.length;
    }
  });
  Ticket.find({ dateTicket: { $gte: startOfToday }, isCompleted: false, isDeleted: false }, function (err, docs) {
    config.currentDate = new Date();
    res.send(docs);
  });
});


router.get("/today", (req, res) => {
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(startOfToday);
  Ticket.find({ dateTicket: { $gte: startOfToday } }, function (err, docs) {
    res.send(docs);
  });
});



router.get("/", (req, res) => {
  Ticket.find(function (err, docs) {
    res.send(docs);
  });
});

router.put("/playing/:ticketId", (req, res) => {
  Ticket.findOne({ _id: req.params.ticketId }, function (err, doc) {
    if (doc !== undefined) {
      doc.isRunning = true;
      doc.save();
      res.send(doc);
    }
  });
});


router.delete("/:ticketId", (req, res) => {
  Ticket.findById({ _id: req.params.ticketId }, function (err, data) {
    var list = undefined;
    if (data.playList.length != 0) {
      list = data.playList.find(b => b.state === false);
    }

    if (data.playList.length == 0) {
      data.isDeleted = true;
      data.save();
      res.send(data);
    } else if(list === undefined && data.isRunning === false) {
      data.isDeleted = true;
      data.save();
      res.send(data);
    } 
    else if (list === undefined && data.isRunning) {
      data.isDeleted = true;
      data.save();
      res.send(data);
    }
    else if(data.isRunning) {
      res.sendStatus(500);
    } else {
      data.isDeleted = true;
      data.save();
      res.send(data);
    }
  });
});



module.exports = router;
