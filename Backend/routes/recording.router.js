const express = require('express');
const recordingController = require('../controllers/recording.controller');

const router = express.Router();

// Gửi bản ghi
router.post('/send', recordingController.handleSendRecording);

// Lấy danh sách bản ghi
router.get('/:channelId', recordingController.getRecordings);

module.exports = router;