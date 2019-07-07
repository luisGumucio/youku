var config = require("./config.env");
var Ticket = require("../model/ticket.model");

var socketManager = {
    initServer: initServer
}

async function initServer() {
    const ticket = await Ticket.find({dateTicket: {$lte: new Date()}});
    if(ticket.length == 0) {
        config.currentCont = 0;
    } else {
        config.currentCont = ticket.length;
    }
    config.currentDate = new Date();
}

module.exports = socketManager;