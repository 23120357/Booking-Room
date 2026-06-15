# Guideline Viết Code & Test (Reviews, Favorites, Chat)

## 1. Guideline Test Review Bằng Postman
Truy cập vào: http://localhost:5000/api/rooms/:roomId/reviews (GET) để lấy danh sách review của phòng đó. và http://localhost:5000/api/reviews (POST) để tạo review.

1. Phải đăng nhập bằng tài khoản thuộc nhóm **TENANT**.
{
   "identifier": "tenant2",
   "password": "Password@123"
}
2. Lấy `accessToken` nhét vào tab **Authorization > Bearer Token**.
3. Body:
{
    "deposit_id": "e2000000-0000-0000-0000-000000000002",
    "rating": 3,
    "comment": "Phòng dơ!"
}
4. Xem average_rating của phòng đó sẽ được update trong table room.

## 2. Guideline Test Favorites Bằng Postman
Truy cập: http://localhost:5000/api/favorites/toggle (POST) để thêm hoặc xóa phòng khỏi danh sách yêu thích và http://localhost:5000/api/favorites (GET) để xem danh sách yêu thích.

1. Đăng nhập bằng tài khoản **TENANT**.
{
   "identifier": "tenant1",
   "password": "Password@123"
}
2. Lấy `accessToken` nhét vào tab **Authorization > Bearer Token**.
3. Body: Nếu GET thì không cần body
    Nếu POST thì Body: 
    {
    "room_id": "d0000000-0000-0000-0000-000000000001"
    }
4. Nếu là POST thì Gửi lần 1: Trả về `action: "ADDED"` (Đã thêm). Gửi lần 2: Trả về `action: "REMOVED"` (Đã gỡ).
   Nếu là GET thì trả về 1 danh sách các phòng yêu thích của tenant đó.

## 3. Guideline Test Chat (Conversations & Messages) Bằng Postman
Truy cập: http://localhost:5000/api/conversations (POST) để khởi tạo phòng chat, http://localhost:5000/api/conversations/:id/messages (POST) để gửi tin nhắn, và http://localhost:5000/api/conversations/:id/read (PATCH) để đánh dấu đã đọc.

**Bước 1: Khởi tạo phòng chat và gửi tin nhắn (Đứng từ góc độ Tenant)**
1. Đăng nhập bằng tài khoản thuộc nhóm **TENANT**.
{
   "identifier": "tenant2",
   "password": "Password@123"
}
2. Lấy `accessToken` nhét vào tab **Authorization > Bearer Token**.
3. Body: Khởi tạo chat - POST `http://localhost:5000/api/conversations`
{
   "peer_user_id": "c0000000-0000-0000-0000-000000000002"
}
4. Gửi tin nhắn - Lấy `conversation_id` vừa trả về, gọi POST `http://localhost:5000/api/conversations/<conversation_id>/messages` với Body:
{
   "content": "Chào chủ nhà, phòng này còn không ạ?"
}
 và tin nhắn này đang ở trạng thái SENT.
**Bước 2: Xem và đánh dấu đã đọc tin nhắn (Đứng từ góc độ Landlord)**
1. Đăng nhập bằng tài khoản thuộc nhóm **LANDLORD**.
{
   "identifier": "landlord1",
   "password": "Password@123"
}
2. Lấy `accessToken` mới nhét vào tab **Authorization > Bearer Token**.
3. Xem danh sách chat - GET `http://localhost:5000/api/conversations`. Không cần body. Lúc này trang thái tin nhắn sẽ chuyển sang DELIVERED
4. Đánh dấu đã đọc - PATCH `http://localhost:5000/api/conversations/<conversation_id>/read`. Không cần body.
   Nếu là GET thì trả về danh sách các phòng chat và `unread_count` = 1.
   Nếu là PATCH thì gọi xong, quay lại gọi GET danh sách sẽ thấy `unread_count` = 0.
5. Lấy tin nhắn của 1 conversation: `http://localhost:5000/api/conversations/<conversation_id>/messages` theo pagination 

## 4. Guideline Test Notifications Bằng Postman
Truy cập: http://localhost:5000/api/notifications (GET) để xem danh sách thông báo, và http://localhost:5000/api/notifications/read-all (PATCH) để đánh dấu đã xem tất cả.

**Bước 1: Kích hoạt tạo thông báo (Vì API POST bị cấm)**
- Dùng tài khoản `tenant1` gọi API gửi tin nhắn (POST) cho `landlord1` (Làm theo Bước 1 của mục Test Chat ở trên).
- Hành động này sẽ khiến Backend tự động sinh ra một thông báo `"Tin nhắn mới"` nhét vào giỏ của ông `landlord1`.

**Bước 2: Đọc thông báo (Bằng tài khoản người nhận)**
1. Đăng nhập bằng tài khoản **LANDLORD** (`landlord1`).
{
   "identifier": "landlord1",
   "password": "Password@123"
}
2. Lấy `accessToken` mới nhét vào tab **Authorization > Bearer Token**.
3. Xem danh sách thông báo - GET `http://localhost:5000/api/notifications`. Không cần body.
   Bạn sẽ thấy thông báo vừa được tạo với `status = 'UNREAD'`.
4. Đánh dấu đã xem TẤT CẢ - PATCH `http://localhost:5000/api/notifications/read-all`. Không cần body.
5. Đánh dấu đã xem TỪNG CÁI (Riêng biệt) - PATCH `http://localhost:5000/api/notifications/<notification_id>/read`. Không cần body.
   *(Lấy cái `notification_id` ở bước 3 bỏ vào link API là xong)*
   
   - Sau đó gọi lại lệnh GET, bạn sẽ thấy `status` của (những) thông báo vừa gọi đã chuyển thành `'READ'`.
6. Các thông báo khác làm tương tự flow trên.

## 5. Guideline Test Support Tickets Bằng Postman
Truy cập: `http://localhost:5000/api/support-tickets`

**Bước 1: Tạo yêu cầu hỗ trợ (POST)**
1. Đăng nhập bằng tài khoản `tenant1` hoặc `landlord1`. Lấy `accessToken` nhét vào tab Auth.
2. Tạo Ticket - Gọi POST `http://localhost:5000/api/support-tickets` với Body (JSON):
```json
{
   "category": "APP_FAULT",
   "title": "Ứng dụng bị đơ khi tải hình ảnh",
   "detailed_description": "Tôi bấm vào xem ảnh phòng thì app xoay vòng vòng không load được.",
   "evidence_image_url": "https://fptshop.com.vn/tin-tuc/tin-moi/zalo-dang-bi-loi-khong-tai-duoc-hinh-anh-92197"
}
```
*(Bạn có thể test đổi `category` thành `OTHER` để check xem Enum mới đã nhận chưa nhé)*

**Bước 2: Xem danh sách và chi tiết yêu cầu (GET)**
1. Xem danh sách - Gọi GET `http://localhost:5000/api/support-tickets`. Không cần body.
   - Bạn sẽ thấy ticket vừa tạo với trạng thái `"status": "OPEN"`.
   - Copy cái mã `ticket_id` của nó.
2. Xem chi tiết - Gọi GET `http://localhost:5000/api/support-tickets/<ticket_id>`. Không cần body.

**Bước 3: Hủy yêu cầu (PATCH)**
1. Gọi PATCH `http://localhost:5000/api/support-tickets/<ticket_id>/cancel`. Không cần body.
2. Gọi lại hàm GET xem chi tiết, bạn sẽ thấy `"status": "CLOSED"`.
*(Nếu muốn test bảo mật, bạn thử lấy tài khoản khác gọi hàm GET detail hoặc Cancel cái ticket này xem có bị chửi lỗi 404 không nhé!)*

## 6. Guideline Test Violation Reports Bằng Postman
Truy cập: `http://localhost:5000/api/violation-reports`

**Bước 1: Tạo báo cáo vi phạm (POST)**
1. Đăng nhập bằng tài khoản **TENANT** (Ví dụ `tenant1`). Lấy `accessToken` nhét vào tab Auth. *(Nếu bạn dùng tài khoản Landlord thì hệ thống sẽ văng lỗi 403)*.
2. Lấy 1 cái `room_id` hoặc `landlord_id` có sẵn trong Database.
3. Tạo Report - Gọi POST `http://localhost:5000/api/violation-reports` với Body (JSON):
```json
{
   "landlord_id": "d0000000-0000-0000-0000-000000000002",
   "reason": "Chủ phòng này quỵt tiền cọc của tôi. Đề nghị admin kiểm tra.",
   "evidence_image_url": "https://example.com/thucte.png"
}
```
*(Bạn có thể thử xóa trường `room_id` đi mà không truyền `landlord_id` xem hệ thống có báo lỗi 400 không nhé)*

**Bước 2: Xem danh sách và chi tiết báo cáo (GET)**
1. Xem danh sách - Gọi GET `http://localhost:5000/api/violation-reports`. Không cần body.
   - Bạn sẽ thấy báo cáo vừa tạo với `"resolution_status": "PENDING"`.
2. Xem chi tiết - Gọi GET `http://localhost:5000/api/violation-reports/<report_id>`. Không cần body.

## 7. Guideline Test AI Room Recommendations Bằng Postman
Truy cập: `http://localhost:5000/api/ai/room-recommendations`

**Bước 1: Thiết lập API Key (Tùy chọn)**
- Nếu bạn có tài khoản Google AI Studio và có API Key, hãy thêm vào file `.env` `GEMINI_API_KEY="AIza..."`
- Nếu không có, bạn vẫn có thể test bình thường. Hệ thống sẽ trả về câu trả lời tự động (Mock Response) kèm theo danh sách dữ liệu phòng để bạn kiểm tra luồng API.

**Bước 2: Gửi câu hỏi cho AI Chatbot (POST)**
1. Không cần đăng nhập (API Public).
2. Gọi POST `http://localhost:5000/api/ai/room-recommendations` với Body (JSON):
```json
{
   "message": "Nó được đánh giá bao nhiêu sao?",
   "history": [
       {
          "role": "user",
          "parts": [{ "text": "Có phòng nào ở quận 10 không?" }]
       },
       {
          "role": "model",
          "parts": [{ "text": "Chào bạn, hiện tại BookingRoom có 1 phòng ở Quận 10 là Phòng trọ gần Đại học Bách Khoa..." }]
       }
   ]
}
```
*(Nếu không cần Memory, bạn có thể bỏ qua trường `history`, chỉ cần truyền `message`)*
3. Xem kết quả trả về:
   - Nếu bạn đã gắn Key: AI sẽ ghi nhớ cuộc đối thoại trong `history` để trả lời câu hỏi `message` của bạn cực kỳ thông minh với giao diện có Emoji rõ ràng.
   - Nếu bạn chưa gắn Key: Sẽ hiển thị câu "Đây là tin nhắn tự động...".