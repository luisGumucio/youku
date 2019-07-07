const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let TicketSchema = new Schema({
    number: { type: Number, required: true},
    dateTicket : { type: Date, required: true },
    isCompleted: { type: Boolean},
    isRunning: {type: Boolean},
    isDeleted: { type: Boolean},
    playList: [{
        urlVideo: { type: String, required: true},
        name : { type: String },
        state: { type: Boolean},
        ticketId: {type: String }
    }]
});

module.exports = mongoose.model('Ticket', TicketSchema);