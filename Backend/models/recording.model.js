const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
    channelId: {
        type: String,
        required: true,
        index: true // Tạo index để tìm kiếm nhanh hơn
    },
    callId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recording', recordingSchema); 