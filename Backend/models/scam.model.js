const mongoose = require('mongoose');

const scamWarningSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isScam: {
        type: Boolean,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ScamWarning', scamWarningSchema); 