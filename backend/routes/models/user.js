const { default: mongoose, Schema } = require("mongoose");

var userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
})



module.exports = mongoose.model('users', userSchema);