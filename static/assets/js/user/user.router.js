var express = require("express");
var User = require("../model/user.model");
var socket = require("../common/socket.manager");
var config = require("../common/config.env");

var router = express.Router();

router.post("/", (req, res) => {
    User.find({ isLogged: true }, function (err, docs) {
        if (docs.length != 0) {
            res.send(docs[0]);
        } else {
            res.sendStatus(500);
        }
    })
});

router.post("/login", (req, res) => {
    User.findOne({ username: req.body.username, password: req.body.password }, function (err, doc) {
        if (doc != undefined) {
            doc.isLogged = true;
            doc.save();
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    })
});

router.post("/logout", (req, res) => {
    User.findOne({ username: req.body.username, password: req.body.password }, function (err, doc) {
        if (doc != undefined) {
            doc.isLogged = false;
            doc.save();
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    })
});

router.post("/create", (req, res) => {
    let user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        isLogged: false
    })
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send(user);
    });
});

module.exports = router;