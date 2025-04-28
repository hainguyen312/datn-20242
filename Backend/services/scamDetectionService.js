const axios = require('axios');

class ScamDetectionService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    async analyzeMessage(message) {
        try {
            if (!this.apiKey) {
                throw new Error('GEMINI_API_KEY is not configured');
            }

            console.log('Sending request to Gemini API...');
            const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, {
                contents: [{
                    parts: [{
                        text: `Bạn là một chuyên gia phát hiện tin nhắn có dấu hiệu lừa đảo, có thể chứa các từ nhạy cảm như "chuyển khoản", "số tài khoản",... hoặc link giả mạo để lấy thông tin người dùng, thông tin cá nhân người dùng như số điện thoại, email, tên người dùng, địa chỉ, số căn cước,... Hãy phân tích tin nhắn sau và trả về kết quả dưới dạng JSON với cấu trúc chính xác như sau:
{
    "is_scam": true/false,
    "confidence": 0.0-1.0,
    "reason": "lý do phát hiện lừa đảo"
}
Chỉ trả về JSON, không thêm bất kỳ text nào khác. Tin nhắn cần phân tích: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Received response from Gemini API:', response.status);

            if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                console.error('Invalid response structure:', response.data);
                throw new Error('Invalid response from Gemini API');
            }

            const resultText = response.data.candidates[0].content.parts[0].text;
            console.log('Raw response from Gemini:', resultText);

            // Làm sạch response text trước khi parse
            const cleanedText = resultText.trim()
                .replace(/^```json\s*/, '') // Loại bỏ ```json nếu có
                .replace(/```$/, '') // Loại bỏ ``` ở cuối nếu có
                .trim();

            let result;
            try {
                result = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                console.error('Cleaned text that failed to parse:', cleanedText);
                throw new Error('Failed to parse Gemini API response');
            }

            if (!result || typeof result.is_scam !== 'boolean' || typeof result.confidence !== 'number' || typeof result.reason !== 'string') {
                console.error('Invalid result format:', result);
                throw new Error('Invalid result format from Gemini API');
            }
            
            return {
                isScam: result.is_scam,
                confidence: result.confidence,
                reason: result.reason
            };
        } catch (error) {
            console.error('Error analyzing message:', error);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
            throw error;
        }
    }
}

module.exports = new ScamDetectionService(); 