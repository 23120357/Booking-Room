const aiRepository = require('../../repositories/guest/aiRepository');
const AppError = require('../../utils/AppError');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to handle AI Room Recommendations using Google Gemini.
 * Hỗ trợ History để nhớ ngữ cảnh chat.
 */
async function getRecommendations(message, history = []) {
  if (!message || message.trim() === '') {
    throw new AppError('BAD_REQUEST', 'Vui lòng cung cấp nội dung tin nhắn (message).', 400);
  }

  // Lấy dữ liệu phòng từ Database (chỉ lấy các phòng đang AVAILABLE)
  const rooms = await aiRepository.getAvailableRoomsForAI();

  // Kiểm tra Gemini API Key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    // Fallback: Khi chưa cài API Key thì trả về mock response để dev test frontend trước
    return mockRecommendationFallback(message, rooms);
  }

  // Khởi tạo Gemini Client
  const genAI = new GoogleGenerativeAI(apiKey);

  // Chuyển đổi list phòng thành chuỗi văn bản JSON hoặc danh sách dễ đọc cho AI
  const roomContext = rooms.map((r, i) => {
    return `${i + 1}. [ID: ${r.room_id}] Tên: ${r.title} | Loại: ${r.room_type} | Giá thuê: ${r.monthly_rent} VND/tháng | Tiền cọc: ${r.deposit_amount} VND | Điện: ${r.electricity_cost} VND | Nước: ${r.water_cost} VND | Internet: ${r.internet_cost} VND | Phí dịch vụ: ${r.service_fee} VND | Địa chỉ: ${r.detailed_address} | Đánh giá: ${r.average_rating || 'Chưa có'} sao.`;
  }).join('\n');

  // Xây dựng System Prompt
  const systemPrompt = `
Bạn là một trợ lý ảo thông minh chuyên tư vấn thuê phòng trọ trên nền tảng BookingRoom. 
Nhiệm vụ của bạn là tư vấn cho khách hàng dựa trên DANH SÁCH PHÒNG TRỌ THẬT DƯỚI ĐÂY.
LUẬT TỐI THƯỢNG:
1. TUYỆT ĐỐI KHÔNG ĐƯỢC BỊA ĐẶT (hallucinate) ra bất kỳ phòng nào không có trong danh sách. Nếu khách hỏi loại phòng không có, hãy lịch sự thông báo là hệ thống hiện không có phòng phù hợp và gợi ý các phòng gần giống nhất.
2. Trả lời bằng tiếng Việt, thân thiện, lịch sự và súc tích như một chuyên viên tư vấn.
Ví dụ:
Tên phòng: ...
Giá thuê: ...
Địa chỉ: ...
Mã phòng (ID) để đặt cọc: ...

DANH SÁCH PHÒNG TRỌ HIỆN CÓ:
${roomContext}
`;

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt
  });

  try {
    const chat = model.startChat({
      history: Array.isArray(history) ? history : []
    });
    
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiReply = response.text();

    return {
      reply: aiReply
    };
  } catch (error) {
    console.error('Gemini Error:', error);
    throw new AppError('INTERNAL_SERVER_ERROR', 'Lỗi kết nối với máy chủ AI (Gemini). Vui lòng thử lại sau.', 500);
  }
}

/**
 * Mock function to return a fake AI response if no API key is provided.
 * Useful for development and testing.
 */
function mockRecommendationFallback(message, rooms) {
  let mockReply = 'Đây là tin nhắn tự động từ hệ thống vì bạn chưa cấu hình GEMINI_API_KEY trong file .env. \n';
  mockReply += `Hệ thống hiện tại đang có ${rooms.length} phòng trống. \n`;
  if (rooms.length > 0) {
    mockReply += `Phòng nổi bật nhất hiện nay là: ${rooms[0].title} với giá thuê ${rooms[0].monthly_rent} VND/tháng.`;
  } else {
    mockReply += 'Hiện tại không có phòng nào trống.';
  }

  return {
    reply: mockReply
  };
}

module.exports = {
  getRecommendations
};
