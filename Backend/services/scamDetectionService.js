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
                        text: `
                        Bạn là một chuyên gia an ninh mạng, có nhiệm vụ phát hiện tin nhắn có dấu hiệu lừa đảo.
                        
                        Hãy phân tích tin nhắn đầu vào và đánh giá xem liệu nội dung đó có khả năng lừa đảo hay không, dựa trên các yếu tố sau:
                        1. Yêu cầu cung cấp thông tin nhạy cảm: mã OTP, số tài khoản, CCCD, mật khẩu, địa chỉ, số điện thoại, email, v.v.
                        2. Chứa các link nghi ngờ giả mạo ngân hàng, thương mại điện tử, hoặc cơ quan chính phủ.
                        3. Giao tiếp mang tính khẩn cấp hoặc gây hoang mang (ví dụ: dọa kiện, dọa bị khóa tài khoản).
                        4. Cam kết lợi nhuận cao, mời đầu tư tiền ảo hoặc đa cấp tài chính.
                        5. Mời gọi tham gia việc nhẹ lương cao, tuyển cộng tác viên với yêu cầu chuyển tiền trước.
                        6. Giả mạo người quen, người nổi tiếng, hoặc nhân viên cơ quan pháp luật.
                        7. Nội dung khuyến mãi, trúng thưởng bất ngờ yêu cầu chuyển tiền hoặc truy cập link.
                        
                        Hãy trả về kết quả dưới dạng JSON, giữ đúng cấu trúc sau (không thêm văn bản nào ngoài JSON):
                        {
                          "is_scam": true | false,
                          "confidence": 0.0-1.0,
                          "reason": "Lý do phát hiện lừa đảo (ví dụ: chứa từ khóa 'chuyển khoản', có link nghi ngờ, yêu cầu OTP, cam kết lãi cao,...)"
                        }
                        
                        Tin nhắn cần phân tích: ${message}
                        `
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