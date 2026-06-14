# Kế Hoạch Triển Khai (Phần Vinh Đảm Nhận)
**Base URL:** `http://localhost:5000/api`

---

## Module 1: Reviews (Đánh giá phòng)

### 1.1 Mục Tiêu
Cho phép Khách thuê (Tenant) đánh giá (từ 1-5 sao) và bình luận về phòng.
**Điều kiện tiên quyết:** Khách thuê phải có đơn đặt cọc (`deposit`) cho phòng đó ở trạng thái `CONFIRMED`.

### 1.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/rooms/:roomId/reviews` | Public | Lấy danh sách đánh giá của một phòng (có phân trang). |
| `POST` | `/reviews` | Tenant | Tạo một đánh giá mới. Bắt buộc truyền `deposit_id`, `rating`, `comment`. |

*(Lưu ý: API Update và Delete đánh giá tạm thời bị loại bỏ)*

### 1.3 Cấu Trúc File & Logic
- **`reviewRepository.js`**: `findConfirmedDeposit` (kiểm tra cọc), `create` (tạo mới), `recalcAverageRating` (tính trung bình sao).
- **`reviewService.js`**: Chứa luật kinh doanh. Đảm bảo 1 deposit chỉ được review 1 lần. Kích hoạt trigger tính lại `average_rating` trên bảng `rooms`.
- **`reviewController.js`**: Xử lý request, bắt các lỗi HTTP 400, 403.
- **`reviewRoutes.js`**: Định tuyến, gắn middleware bảo vệ.

---

## Module 2: Favorites (Yêu thích phòng)

### 2.1 Mục Tiêu
Cho phép Tenant "thả tim" lưu các phòng yêu thích để xem lại sau.
**Điều kiện tiên quyết:** Phòng trọ đó phải đang ở trạng thái `APPROVED`.

### 2.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/favorites` | Tenant | Lấy danh sách toàn bộ phòng yêu thích của Tenant. |
| `POST` | `/favorites/toggle` | Tenant | Thêm phòng vào mục yêu thích (nếu chưa có) hoặc Gỡ bỏ (nếu đã có). |

### 2.3 Cấu Trúc File & Logic
- **`favoriteRepository.js`**: Truy vấn và Join bảng `rooms` để lấy chi tiết phòng.
- **`favoriteService.js`**: Tự động nhận diện (nếu tồn tại thì xóa, nếu chưa có thì thêm), trả về `action: ADDED` hoặc `action: REMOVED`.
- **`favoriteController.js` & `favoriteRoutes.js`**: Xử lý I/O cơ bản và gắn router.

---

## Module 3: Chat (Conversations & Messages)

### 3.1 Mục Tiêu
Cung cấp hệ thống nhắn tin RESTful giữa Khách Thuê (Tenant) và Chủ Trọ (Landlord). Hỗ trợ theo dõi các trạng thái của tin nhắn (`SENT`, `DELIVERED`, `READ`).

### 3.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/conversations` | Tenant / Landlord | Khởi tạo phòng chat (hoặc trả về phòng hiện tại) giữa 2 bên. |
| `GET` | `/conversations` | Tenant / Landlord | Lấy danh sách đoạn chat, kèm tin nhắn mới nhất và `unread_count`. **Tự động update trạng thái thành `DELIVERED`.** |
| `GET` | `/conversations/:id/messages`| Tenant / Landlord | Lấy chi tiết lịch sử tin nhắn trong 1 phòng. **Tự động update `DELIVERED`.** |
| `POST` | `/conversations/:id/messages`| Tenant / Landlord | Gửi tin nhắn mới. Trạng thái mặc định tạo ra là `SENT`. |
| `PATCH` | `/conversations/:id/read` | Tenant / Landlord | Đánh dấu tất cả tin nhắn do đối phương gửi thành trạng thái `READ`. |

### 3.3 Cấu Trúc File & Logic
- **`conversationRepository.js`**: Chứa các câu query nâng cao (vd: Subquery lấy `unread_count` và `last_message`). Hàm `markDeliveredForConversations` chuyên dụng để đổi trạng thái tin nhắn.
- **`conversationService.js`**: Tự động trích xuất đúng role (Tenant hoặc Landlord) từ token. Chặn hành vi tự nhắn cho chính mình. Kích hoạt cập nhật `DELIVERED` mỗi khi user load danh sách chat.
- **`conversationController.js` & `conversationRoutes.js`**: Lắp ráp endpoints.
---

## 📦 Module 4: Notifications (Hệ thống thông báo)

### 4.1 Mục Tiêu
Cung cấp hệ thống thông báo cho toàn bộ người dùng. Quản lý trạng thái thông báo (`UNREAD`, `READ`). Ngăn chặn người dùng chủ động tạo thông báo ảo bằng cách chặn API `POST`. Thông báo sẽ được tự động tạo ngầm bởi Backend (ví dụ: Tạo thông báo khi có tin nhắn mới).

### 4.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Tenant / Landlord | Lấy danh sách thông báo của người dùng (có phân trang). |
| `PATCH` | `/notifications/read-all` | Tenant / Landlord | Đánh dấu TẤT CẢ thông báo của người dùng thành trạng thái `READ`. |
| `PATCH` | `/notifications/:id/read` | Tenant / Landlord | Đánh dấu 1 thông báo cụ thể thành trạng thái `READ`. |

### 4.3 Cấu Trúc File & Logic
- **`notificationRepository.js`**: Hàm `findNotificationsByUser`, `markAsRead`, `markAllAsRead`, và `insertNotification`.
- **`notificationService.js`**: Định nghĩa hàm nội bộ `createNotification()` (dùng chung cho các module khác gọi, ví dụ: Module Chat gọi khi gửi tin nhắn).
- **`notificationController.js` & `notificationRoutes.js`**: Lắp ráp endpoints (GET list, PATCH read, PATCH read-all).

---

## 📦 Module 5: Support Tickets (Hệ thống Hỗ trợ)

### 5.1 Mục Tiêu
Cung cấp kênh liên lạc giữa Khách thuê/Chủ nhà với Admin. Người dùng có thể báo lỗi ứng dụng, báo cáo vấn đề tài khoản, thanh toán, hoặc các vấn đề khác (`OTHER`). Hỗ trợ đính kèm hình ảnh bằng chứng, và cho phép người dùng tự **Hủy yêu cầu (Cancel)** nếu lỗi đã được khắc phục.

### 5.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/support-tickets` | Tenant / Landlord | Tạo mới 1 ticket. Bắt buộc: `category`, `title`, `detailed_description`. |
| `GET` | `/support-tickets` | Tenant / Landlord | Lấy danh sách lịch sử tạo ticket của người dùng (kèm phân trang). |
| `GET` | `/support-tickets/:id` | Tenant / Landlord | Xem chi tiết 1 ticket của bản thân. (Không cho phép xem của người khác). |
| `PATCH` | `/support-tickets/:id/cancel` | Tenant / Landlord | Hủy yêu cầu (Chuyển sang `CLOSED`). Chỉ áp dụng khi ticket đang `OPEN` hoặc `IN_PROGRESS`. |

### 5.3 Cấu Trúc File & Logic
- **`supportTicketRepository.js`**: Hàm `createTicket`, `findTicketsByUser`, `findTicketById`, và `cancelTicket`.
- **`supportTicketService.js`**: Validate trường thông tin, kiểm tra logic chỉ người tạo mới được quyền xem/hủy.
- **`supportTicketController.js` & `supportTicketRoutes.js`**: Lắp ráp endpoints (POST create, GET list, GET detail, PATCH cancel).

---

## 📦 Module 6: Violation Reports (Báo Cáo Vi Phạm)

### 6.1 Mục Tiêu
Cho phép **Khách Thuê (Tenant)** báo cáo các phòng trọ có dấu hiệu lừa đảo, không giống hình ảnh, hoặc báo cáo Chủ Nhà (Landlord) có hành vi xấu. Đây là luồng khiếu nại một chiều từ Tenant gửi lên Admin để bảo vệ quyền lợi của người thuê.

### 6.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/violation-reports` | Tenant | Tạo báo cáo vi phạm. Bắt buộc: `reason` và chọn 1 trong 2 mục tiêu (`room_id` hoặc `landlord_id`). |
| `GET` | `/violation-reports` | Tenant | Lấy danh sách báo cáo do Tenant đã tạo (kèm phân trang). |
| `GET` | `/violation-reports/:id` | Tenant | Xem chi tiết tiến độ xử lý của 1 báo cáo. |

### 6.3 Cấu Trúc File & Logic
- **`violationReportRepository.js`**: Thao tác bảng `violation_reports`. Các hàm helper check tồn tại của `rooms` và `landlords`.
- **`violationReportService.js`**: Bắt buộc người gọi API phải có role `TENANT`. Kiểm tra logic đầu vào (có `reason`, có mục tiêu). Tự động bắn thông báo khi tạo thành công.
- **`violationReportController.js` & `violationReportRoutes.js`**: Lắp ráp endpoints.

---

## 🤖 Module 7: AI Room Recommendations (Gợi Ý Phòng Thông Minh)

### 7.1 Mục Tiêu
Cung cấp tính năng trợ lý ảo (Chatbot) để tư vấn phòng cho người dùng bằng ngôn ngữ tự nhiên. AI **BẮT BUỘC** chỉ được dựa vào danh sách phòng thật đang có trong Database, không được bịa đặt. Tích hợp tính năng Memory (Ghi nhớ ngữ cảnh) để duy trì luồng hội thoại trôi chảy. API được mở Public cho cả khách vãng lai (Guest).

### 7.2 Danh Sách API
| Method | Endpoint | Quyền (Auth) | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/ai/room-recommendations` | Public | Gửi câu hỏi cho AI. Hỗ trợ truyền mảng `history` để ghi nhớ cuộc trò chuyện trước đó. Trả về câu trả lời của AI với định dạng dễ đọc (emoji). |

### 7.3 Cấu Trúc File & Logic
- **`aiRepository.js`**: Lấy danh sách phòng `AVAILABLE`. Select bao gồm cả giá điện, nước, internet, dịch vụ để AI báo giá chính xác.
- **`aiService.js`**: Gọi API Google Generative AI (`gemini-2.5-flash`). Khởi tạo `startChat` cùng `history` để đảm bảo Memory. Tích hợp Fallback Mock response.
- **`aiController.js` & `aiRoutes.js`**: Lắp ráp endpoints (Public). Nhận `message` và `history` từ body.

---
## 📊 Cơ Sở Dữ Liệu
Hệ thống 7 module này tương tác trên 10 bảng:
1. `reviews`
2. `favorites`
3. `conversations`
4. `messages`
5. `notifications` (lưu trữ thông báo và enum loại thông báo)
6. `support_tickets` (lưu trữ yêu cầu hỗ trợ người dùng)
7. `violation_reports` (lưu trữ báo cáo vi phạm của Khách thuê)
8. `deposits` (kiểm tra điều kiện Review)
9. `rooms` (cập nhật Rating & kiểm tra Favorites)
10. `tenants` / `landlords` / `users` (dùng cho xác thực ID).

---

## ✅ Checklist Trạng Thái
- [x] Thiết lập Repository, Service, Controller, Routes.
- [x] Tích hợp Middleware Auth.
- [x] Trigger tự động tính lại `average_rating`.
- [x] Triển khai API Toggle Favorites logic.
- [x] Triển khai luồng Chat đa nền tảng Tenant/Landlord.
- [x] Tự động cập nhật trạng thái tin nhắn `DELIVERED` & `READ`.
- [x] Triển khai Notifications (Read, Read-All, Auto-Trigger) và mở rộng ENUM.
- [x] Triển khai Support Tickets (Create, List, Detail, Cancel) và mở rộng ENUM 'OTHER'.
- [x] Triển khai Violation Reports (Create, List, Detail) cho Tenant.
- [x] Triển khai AI Room Recommendations (Tích hợp OpenAI API + Dữ liệu phòng thật).
- [x] Đã Test Postman thành công.
