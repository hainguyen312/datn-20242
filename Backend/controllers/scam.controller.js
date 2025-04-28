const scamDetectionService = require('../services/scamDetectionService');
const ScamWarning = require('../models/scam.model');

class ScamDetectionController {
    async analyzeMessage(req, res) {
        try {
            const { message, senderId } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!message || !senderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: message and senderId'
                });
            }

            // Phân tích tin nhắn
            let analysisResult;
            try {
                analysisResult = await scamDetectionService.analyzeMessage(message);
            } catch (error) {
                console.error('Error from scamDetectionService:', error);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to analyze message'
                });
            }
            
            if (!analysisResult) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to analyze message'
                });
            }

            console.log('Analysis result:', analysisResult);

            // Lưu cảnh báo vào database
            try {
                const scamWarning = new ScamWarning({
                    message,
                    sender: senderId,
                    isScam: analysisResult.isScam,
                    confidence: analysisResult.confidence,
                    reason: analysisResult.reason
                });

                await scamWarning.save();
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Vẫn trả về kết quả phân tích nếu lưu database thất bại
            }

            res.json({
                success: true,
                data: analysisResult
            });
        } catch (error) {
            console.error('Error in analyzeMessage:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getWarningHistory(req, res) {
        try {
            const { userId } = req.params;
            
            const warnings = await ScamWarning.find({
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ]
            })
            .sort({ timestamp: -1 })
            .limit(50);

            res.json({
                success: true,
                data: warnings
            });
        } catch (error) {
            console.error('Error in getWarningHistory:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new ScamDetectionController(); 