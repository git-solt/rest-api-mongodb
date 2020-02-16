const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
    paragraph: {
        type: String,
        required: true,
    },
    image: {
        type: mongoose.Schema.Types.ObjectID,
        required: true
    }
});

const Description = mongoose.model('Description', descriptionSchema);

module.exports = Description;