const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let UserSchema = new Schema({
    name: { type: String},
    username : { type: String },
    password: { type: String },
    isLogged: { type: Boolean},
});

module.exports = mongoose.model('User', UserSchema);