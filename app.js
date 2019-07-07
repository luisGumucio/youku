var express = require("express");
var config = require("./static/assets/js/common/config.env");
var bodyParser = require("body-parser");
var http = require("http");
var socket = require("./static/assets/js/common/socket.manager");
var app = express();
var routes = require("./static/assets/js/routes");
var cron = require('node-cron');
var server = http.Server(app);
socket.connect(server);

var mongoose = require("mongoose");
var dev_db_url = "mongodb://mongo/youku";
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(bodyParser.json());
app.use(express.static(__dirname + "/static"));
app.use("/ticket", routes.ticketRouter);
app.use("/user", routes.userRouter);
app.get("/player", function(req, res) {
  res.sendFile(__dirname + "/player.html");
});

app.get("/admin", function(req, res) {
  res.sendFile(__dirname + "/admin.html");
});
app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/client", function(req, res) {
    res.sendFile(__dirname + "/client.html");
  });

cron.schedule('0 0 * * *', function() {
  config.currentCont = 0;
  config.currentDate = new Date();
});

server.listen(3000, function() {
  console.log("listening on *:3000");
});