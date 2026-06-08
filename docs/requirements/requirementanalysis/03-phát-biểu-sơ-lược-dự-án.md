# Phát biểu sơ lược dự án

Written by: 23120357 - Lê Nhật Thành

Edited by: 23120357 - Lê Nhật Thành

Reviewed by: Lê Nguyễn Quốc Thái, Trần Đình Thi, Đặng Lê Đức Thịnh và Đỗ Phước Vinh

- **Business Description:**
**Bối cảnh:**

Trong bối cảnh đô thị hóa tại các thành phố lớn (như TP.HCM), nhu cầu tìm kiếm phòng trọ, căn hộ của sinh viên và người lao động là rất lớn. Tuy nhiên, quy trình truyền thống đang gặp nhiều khó khăn như thông tin không minh bạch, tình trạng lừa đảo tiền cọc, và khó khăn trong việc trao đổi trực tiếp giữa chủ nhà và người thuê.

**Vấn đề cốt lõi:**

- **Người thuê: **Mất nhiều thời gian lọc thông tin, lo ngại về tính xác thực của phòng và gặp khó khăn khi cần hỗ trợ ngay lập tức.
- **Chủ nhà: **Việc quản lý phòng trọ vẫn thủ công như ghi chép tay, khó theo dõi hóa đơn,...
- Thiếu sự kết nối trực tiếp và minh bạch giữa chủ trọ và người thuê
**Giải pháp**

Hệ thống **Booking Room **được xây dựng nhằm giải quyết vấn đề này trên nền tảng số hóa. Hệ thống tập trung vào tính tác cao (Realtime-chat), sự tiện lợi (Tìm kiếm và lọc thông tin) và sự an toàn về mặt thông tin rõ ràng do một bên thứ ba quản lý (Admin sẽ phê duyệt cái bài từ chủ trọ , quản lý giao dịch).

- **Operating Environment:**
- **Phía người dùng (Client-side)**: Ứng dụng chạy trên trình duyệt web (Chrome, Edge..) hỗ trợ HTML5 và JavaScript. Giao diện được tối ưu hóa bằng **Next.js **để đảm bảo tốc độ tải trang và trải nghiệm mượt mà
- **Phía máy chủ (Server-side)**: Hệ thống chạy trên môi trường **Node.js **sử dụng framework **Express **và hệ quản trị CSDL PostgreSQL
- **Kết nối **: Cần có kết nối Internet
- **Design & Implementation Constraints:**
- **Công nghệ Frontend: **Sử dụng thư viện **React **với framework **Next.js **
- **Công nghệ Backend: **Xây dựng trên Node.js (Express), sử dụng thư viện Knex để hỗ trợ truy vấn (query) và quản lý cấu trúc database (migration/seed).
- **Tính năng thông minh: **Bắt buộc tính hợp **AI Chatbot** để tự động hóa quy trình hỗ trợ khách hàng
- **Giao tiếp: **Phải đảm bảo tính năng nhắn tin thời gian thực (**Real-time chat**) giữa người thuê và chủ nhà
- **Bảo mật: **Sử dụng JWT cho xác thực , mật khẩu phải được băm (hash) trước khi lưu
