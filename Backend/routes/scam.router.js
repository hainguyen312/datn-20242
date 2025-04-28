const express = require('express');
const router = express.Router();
const scamDetectionController = require('../controllers/scam.controller');

// Phân tích tin nhắn
router.post('/analyze', scamDetectionController.analyzeMessage);

// Lấy lịch sử cảnh báo
router.get('/history/:userId', scamDetectionController.getWarningHistory);

module.exports = router; 