# Architectural Design

| **3.1** | Architecture Diagram |
| --- | --- |

Written by: 23120359 - Trần Đình Thi, 23120352 - Lê Nguyễn Quốc Thái

Edited by: 23120359 - Trần Đình Thi,23120352 - Lê Nguyễn Quốc Thái

Reviewed by: Lê Nhật Thành, Đặng Lê Đức Thịnh, Đỗ Phước Vinh

| **3.1.1** | *System decomposition tree* |
| --- | --- |

![Image 6](../../assets/Design-006-48c0fbcde3.png)

| **3.1.2** | *Overall system architecture diagram* |
| --- | --- |

![Image 7](../../assets/Design-007-284cfda4d4.png)

- Presentation Layer:
  - Bản chất của tầng này là làm nhiệm vụ giao tiếp phục vụ ba nhóm Stakeholders độc lập: Tenant/Guest, Host và Admin.
  - Hệ thống sử dụng Next.js (React framework).
  - Chịu trách nhiệm thu thập tương tác của người dùng, đóng gói thành các HTTP Requests gửi xuống Backend, và render UI dựa trên dữ liệu JSON/XML trả về.
- Business Logic Layer: Xây dựng trên nền tảng Node.js và Express.js. Tuân thủ nghiêm ngặt nguyên lý Single Responsibility Principle thông qua việc phân chia mã nguồn thành một đường ống tuyến tính:
  - Routes: Điểm tiếp nhận (entry point) đầu tiên của các HTTP Request. Nó không chứa logic mà chỉ làm nhiệm vụ ánh xạ các endpoint tới Controller tương ứng.
  - Middlewares: Nơi xử lý cơ chế xác thực và phân quyền bằng JWT. Request phải vượt qua trạm kiểm duyệt này để chứng minh tính hợp lệ trước khi đi tiếp.
  - Controllers: Tiếp nhận request hợp lệ từ Middleware. Nó trích xuất dữ liệu đầu vào (params, body), gọi đến Service tương ứng để xử lý, và định dạng kết quả thành HTTP Response trả về cho Client.
  - Services: Nơi chứa toàn bộ logic cốt lõi. Tầng này cũng chịu trách nhiệm trực tiếp gọi ra các External Services.
  - Repositories: Một lớp trừu tượng đóng vai trò giao tiếp duy nhất với Database. Nó cô lập hoàn toàn các câu lệnh truy vấn dữ liệu (SQL) khỏi logic nghiệp vụ.
- Database Layer:
  - Sử dụng PostgreSQL trên nền tảng Cloud Neon đảm bảo tính ACID.
  - Công cụ Knex.js được đặt ở tầng Repositories đóng vai trò là Query Builder để tối ưu hóa việc tạo câu lệnh SQL tĩnh và quản lý schema.
- External Services: Tầng Services của hệ thống sẽ gọi API qua HTTP/REST tới các nhà cung cấp này:
- Bảo mật/Giao dịch: VNPay/Stripe xử lý luồng tiền.
- Hệ thống File: AWS S3 giảm tải việc lưu trữ Blob/Image trực tiếp trên máy chủ Node.js.
- Trí tuệ nhân tạo: OpenAI API xử lý ngôn ngữ tự nhiên.
- Bản đồ: Google Map hỗ trợ các truy vấn không gian và.
- Thông báo: qua Email sử dụng nodemailer.

| **3.2** | Class Diagram |
| --- | --- |

Written by: 23120359 - Trần Đình Thi, 23120352 - Lê Nguyễn Quốc Thái

Edited by: 23120359 - Trần Đình Thi,23120352 - Lê Nguyễn Quốc Thái

Reviewed by: Lê Nhật Thành, Đặng Lê Đức Thịnh, Đỗ Phước Vinh

Linkdiagram: [https://drive.google.com/file/d/15lj9oDA_35sh4MkhrzHNJq7YEAyTlElB/view?usp=sharing](https://drive.google.com/file/d/15lj9oDA_35sh4MkhrzHNJq7YEAyTlElB/view?usp=sharing)

![Image 8](../../assets/Design-008-f8a0e50562.jpg)

| **3.3** | Class Specification |
| --- | --- |

Written by: Cả nhóm

| **3.3.1** | *Class RoomPost* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất (UUID) của bài đăng phòng. |
| 2 | title | Private | Not Null | Tiêu đề hiển thị của bài đăng (ví dụ: "Phòng trọ cao cấp Q1"). |
| 3 | roomType | Private | Not Null | Loại hình lưu trú (Phòng trọ, Phòng Studio,...). |
| 4 | detailedAddress | Private | Not Null | Địa chỉ chi tiết của căn phòng. |
| 5 | area | Private | > 0 | Diện tích thực tế của phòng (đơn vị: m2). |
| 6 | maxCapacity | Private | > 0 | Số lượng người ở tối đa cho phép. |
| 7 | monthlyRent | Private | > 0 | Giá thuê phòng mỗi tháng (VNĐ). |
| 8 | deposit | Private | > 0, < monthlyRent | Số tiền cọc yêu cầu. |
| 9 | status | Private | Not Null | Trạng thái phòng ("Pending", "Approved", "Locked", "Rented", "Available"). |
| 10 | averageRating | Private | 0.0 - 5.0 | Điểm đánh giá trung bình từ người thuê. |
| 11 | createdAt | Private |  | Thời gian tạo bài đăng. |
| 12 | updatedAt | Private |  | Thời gian cập nhật bài đăng gần nhất. |
| 13 | roomDescription | Private | Not Null | Mô tả chi tiết không gian và quy định phòng. |
| 14 | longitude | Private | Not Null | Kinh độ phục vụ định vị trên Google Maps. |
| 15 | latitude | Private | Not Null | Vĩ độ phục vụ định vị không gian. |
| 16 | hostId | Private | Not Null,<br>FK -> UserID | Mã định danh của chủ phòng. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createRoomPost() | Public |  | Khởi tạo một bài đăng mới với trạng thái mặc định là "Pending". |
| 2 | updateRoomDetails() | Public |  | Cập nhật các thông tin vật lý và thương mại của phòng trọ. |
| 3 | updateStatus(newStatus) | Public |  | Chuyển đổi trạng thái phòng (vd: từ "Available" sang "Locked" khi có người đặt cọc). |
| 4 | calculateAverageRating() | Public |  | Tự động tính toán lại điểm trung bình khi có một đánh giá (Review) mới được thêm vào. |

| **3.3.2** | *Class Service* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất của dịch vụ (UUID). |
| 2 | serviceName | Private | Not Null | Tên dịch vụ. |
| 3 | fee | Private | >= 0 | Chi phí dịch vụ. |
| 4 | description | Private |  | Mô tả thêm về dịch vụ. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | addServiceToRoom() | Public |  | Gắn/liên kết một dịch vụ mới vào một RoomPost cụ thể. |
| 2 | updateServiceFee() | Public |  | Cập nhật mức phí của một dịch vụ. |

| **3.3.3** | *Class DepositBooking* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất toàn hệ thống của đơn đặt cọc . |
| 2 | tenantId | Private | Not Null | Mã định danh của khách thuê thực hiện tạo đơn đặt cọc |
| 3 | roomPostId | Private | Not Null | Mã định danh của bài đăng phòng trọ được lựa chọn để đặt cọc |
| 4 | createAt | Private |  | Ghi nhận mốc thời gian khách thuê bắt đầu nhấn tạo yêu cầu giữ phòng. |
| 5 | expiredAt | Private | expiredAt<br>= createAt + 15 mins | Mốc thời gian hết hạn thanh toán đặt cọc tạm thời để chống giữ chỗ ảo. |
| 6 | appointmentTime | Private |  | Thời gian hẹn gặp mặt trực tiếp để xem phòng trọ hoặc bàn giao. |
| 7 | status | Private | "Processing", "Confirmed", "Expired", "Cancelled" | Trạng thái hiện tại của tiến trình xử lý đơn đặt cọc giữ phòng. |
| 8 | depositAmount | Private |  | Số tiền đặt cọc giữ chỗ bắt buộc khách thuê phải hoàn tất thanh toán. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createDepositBooking (tenantId,roomPostId, appointment,amount) | Public |  | Khởi tạo một đơn đặt cọc giữ chỗ mới gắn liền với khách thuê, tự động tính toán thời gian expiredAt và gán trạng thái ban đầu là "Processing" |
| 2 | updateStatus(newStatus) | Public | newStatus thuộc danh mục trạng thái hợp lệ | Cập nhật trạng thái giao dịch mới cho đơn đặt cọc dựa trên tín hiệu phản hồi thực tế từ hệ thống cổng thanh toán. |
| 3 | checkTimeout() | Public |  | Hệ thống chạy ngầm kiểm tra định kỳ; nếu thời gian hiện tại vượt quá expiredAt mà đơn chưa được thanh toán, tự động chuyển trạng thái thành "Expired". |
| 4 | cancelDepositBooking(reason: String) | Public |  | Xử lý yêu cầu hủy đơn đặt cọc từ phía người dùng, đồng thời ghi nhận lý do hủy đơn. |

| **3.3.4** | *Class Transaction* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất toàn hệ thống của giao dịch thanh toán |
| 2 | depositBookingId | Private | Not Null | Mã định danh của đơn đặt cọc giữ phòng tương ứng với giao dịch này |
| 3 | gatewayTracsaction | Private |  | Mã tham chiếu giao dịch do cổng thanh toán bên thứ ba (VNPAY,...) trả về khi thực hiện thành công. |
| 4 | amount | Private | amount== DepositBooking.depositAmount | Số tiền thực tế người dùng thanh toán . |
| 5 | paymentMethod | Private | Chỉ VNPay và BankTransfer | Phương thức hoặc cổng thanh toán điện tử mà người dùng lựa chọn sử dụng. |
| 6 | status | Private | "Pending", "Success",<br>"Failed" | Trạng thái xử lý dòng tiền của phiên giao dịch trên hệ thống. |
| 7 | createAt | Private |  | Thời điểm hệ thống ghi nhận yêu cầu khởi tạo phiên giao dịch thanh toán. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createTransaction(depositBookingId,method) | Public |  | Khởi tạo bản ghi giao dịch mới ở trạng thái "Pending" dựa trên thông tin hóa đơn đặt cọc và phương thức thanh toán đã chọn. |
| 2 | processWebhookCallback(gatewayId,responseCode) | Public |  | Tiếp nhận dữ liệu phản hồi tự động (IPN/Webhook) từ cổng thanh toán để cập nhật gatewayTransactionId. |
| 3 | verifyPaymentStatus() | Public |  | Thực hiện kiểm tra mã phản hồi (responseCode); nếu hợp lệ thì chuyển trạng thái giao dịch thành "Success", ngược lại chuyển thành "Failed". |
| 4 | getTransactionDetails(): | Public |  | Trả về thông tin chi tiết lịch sử giao dịch và mã tham chiếu để hiển thị lên màn hình biên lai cho người dùng. |

| **3.3.5** | *Class RoomImage* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | roomPostId | Private | Not Null | Khóa ngoại trỏ đến RoomPost sở hữu hình ảnh này. |
| 2 | serialNumber | Private | > 0 | Số thứ tự hiển thị của hình ảnh trên thư viện. |
| 3 | imageUrl | Private | Not Null | Đường dẫn trực tiếp đến file ảnh (lưu trên AWS S3). |
| 4 | thumbnail | Private | Boolean | Cờ đánh dấu đây có phải là ảnh đại diện (ảnh bìa) của phòng hay không. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | uploadImage() | Public | < 10MB | Xử lý tải ảnh lên Cloud và lưu trữ imageUrl vào CSDL. |
| 2 | setAsThumbnail() | Public |  | Cập nhật cờ thumbnail = true cho ảnh được chọn làm ảnh bìa. |

| **3.3.6** | *Class RoomPost* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh phòng chat (UUID). |
| 2 | tenantId | Private | Not Null | Mã định danh người thuê tham gia hội thoại. |
| 3 | hostId | Private | Not Null | Mã định danh chủ phòng tham gia hội thoại. |
| 4 | createdAt | Private |  | Thời gian bắt đầu cuộc trò chuyện. |
| 5 | updatedAt | Private |  | Thời gian có sự tương tác (tin nhắn) mới nhất. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createConversation() | Public |  | Mở một kênh liên lạc mới khi người thuê nhấn "Nhắn tin cho chủ phòng". |
| 2 | getMessages() | Public |  | Truy xuất danh sách tin nhắn cũ thuộc phiên hội thoại này (hỗ trợ phân trang). |

| **3.3.7** | *Class Message* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất của tin nhắn. |
| 2 | conversationId | Private | Not Null | Khóa ngoại trỏ đến Conversation chứa tin nhắn này. |
| 3 | senderId | Private | Not Null | Người gửi tin nhắn (có thể là Host hoặc Tenant). |
| 4 | content | Private | Not Null | Nội dung văn bản của tin nhắn. |
| 5 | status | Private | Not Null | Trạng thái tin nhắn: "Sent", "Delivered", "Read". |
| 6 | sentAt | Private |  | Thời điểm hệ thống ghi nhận tin nhắn được gửi lên Server. |
| 7 | readAt | Private |  | Thời điểm đối phương mở xem tin nhắn. |
| 8 | timestamp | Private |  | Nhãn thời gian thực phục vụ đồng bộ Socket.io. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | sendMessage() | Public |  | Tiếp nhận payload tin nhắn, lưu Database và phát tín hiệu Realtime đến người nhận. |
| 2 | updateStatusToRead() | Public |  | Đổi trạng thái tin nhắn thành "Read" khi người nhận mở hộp thoại. |

| **3.3.8** | *Class Review* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất của đánh giá. |
| 2 | ratingScore | Private | 1 - 5 | Số sao đánh giá chất lượng (1 đến 5 sao). |
| 3 | content | Private |  | Nội dung bình luận chi tiết. |
| 4 | createdAt | Private |  | Thời gian đăng tải đánh giá. |
| 5 | depositBookingId | Private | Unique | Khóa ngoại liên kết với giao dịch đặt cọc thành công, đảm bảo chỉ khách đã thuê mới được review. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createReview() | Public |  | Ghi nhận đánh giá mới và kích hoạt cập nhật lại averageRating cho RoomPost. |
| 2 | editReview() | Public |  | Cho phép người dùng chỉnh sửa nội dung đánh giá của chính mình. |

| **3.3.9** | *Class User* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất của người dùng |
| 2 | fullName | Private | Không null | Họ và tên đầy đủ. |
| 3 | email | Private | Unique, định dạng email | Địa chỉ email dùng để đăng nhập, liên lạc. |
| 4 | phoneNumber | Private | Unique, định dạng số | Số điện thoại liên lạc. |
| 5 | passwordHash | Private | Không null | Mật khẩu đã được mã hóa (bcrypt). |
| 6 | avatarUrl | Private |  | Đường dẫn ảnh đại diện (lưu trên cloud). |
| 7 | createdAt | Private |  | Thời điểm tạo tài khoản. |
| 8 | updatedAt | Private |  | Thời điểm cập nhật gần nhất. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | login() | Public |  | Xác thực thông tin đăng nhập, cấp JWT token. |
| 2 | logout() | Public |  | Hủy token, kết thúc phiên làm việc. |
| 3 | changePassword() | Public |  | Thay đổi mật khẩu sau khi xác thực mật khẩu cũ. |
| 4 | updateProfile() | Public |  | Cập nhật thông tin cá nhân (họ tên, avatar...). |

| **3.3.10** | *Class Role* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh của vai trò. |
| 2 | roleName | Private | Không null | Tên vai trò (VD: TENANT, HOST). |
| 3 | description | Private |  | Mô tả chi tiết về vai trò. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | addPermission() | Public |  | Gán một quyền (permission) vào vai trò. |
| 2 | removePermission() | Public |  | Thu hồi một quyền khỏi vai trò. |

| **3.3.11** | *Class Permission* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh của quyền. |
| 2 | permissionName | Private | Không null | Tên quyền (VD: ROOM_POST_APPROVE). |
| 3 | description | Private |  | Mô tả chi tiết về quyền. |

| **3.3.12** | *Class Tenant* |
| --- | --- |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | addFavorite() | Public |  | Thêm một phòng vào danh sách yêu thích. |
| 2 | removeFavorite() | Public |  | Xóa phòng khỏi danh sách yêu thích. |
| 3 | submitReport() | Public |  | Gửi báo cáo vi phạm về một phòng hoặc người dùng. |
| 4 | submitSupportRequest() | Public |  | Tạo yêu cầu hỗ trợ gửi đến Admin. |
| 5 | viewNotifications() | Public |  | Xem danh sách thông báo của mình. |
| 6 | viewTransactionHistory() | Public |  | Xem lịch sử giao dịch đặt cọc và thanh toán. |

| **3.3.13** | *Class Host* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | idFrontImageUrl | Private |  | Đường dẫn ảnh mặt trước CCCD để xác thực. |
| 2 | idBackImageUrl | Private |  | Đường dẫn ảnh mặt sau CCCD. |
| 3 | isVerified | Private | Boolean | Trạng thái đã được Admin xác thực hay chưa. |
| 4 | verifiedAt | Private |  | Thời điểm hoàn tất xác thực. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createRoom() | Public |  | Tạo mới một hồ sơ phòng (thông tin cơ bản). |
| 2 | editReview() | Public |  | Chỉnh sửa thông tin hồ sơ phòng đã có. |
| 3 | createRoomPost() | Public |  | Đăng tin cho thuê từ hồ sơ phòng (gửi duyệt). |
| 4 | editRoomPost() | Public |  | Chỉnh sửa thông tin bài đăng đã gửi. |
| 5 | viewDepositRequest() | Public |  | Xem danh sách yêu cầu đặt cọc từ khách thuê. |
| 6 | processDepositRequest() | Public |  | Chấp nhận hoặc từ chối yêu cầu đặt cọc. |
| 7 | viewListRoom() | Public |  | Xem danh sách tất cả hồ sơ phòng của mình. |
| 8 | viewRoom() | Public |  | Xem chi tiết một hồ sơ phòng. |
| 9 | viewRoomPost() | Public |  | Xem chi tiết một bài đăng. |
| 10 | viewListRoomPost() | Public |  | Xem danh sách các bài đăng của mình. |
| 11 | viewRevenue() | Public |  | Xem thống kê doanh thu từ các giao dịch thành công. |

| **3.3.14** | *Class Admin* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | id | Private | Unique | Mã định danh duy nhất của đánh giá. |
| 2 | fullName | Private | Không null | Họ và tên. |
| 3 | email | Private | Unique, định dạng email | Email đăng nhập và liên lạc. |
| 4 | phoneNumber | Private |  | Số điện thoại (tùy chọn). |
| 5 | passwordHash | Private | Không null | Mật khẩu đã mã hóa. |
| 6 | avatarUrl | Private |  | Ảnh đại diện. |
| 7 | role | Private | Giá trị mặc định ADMIN | Vai trò quản trị (có thể phân cấp). |
| 8 | createdAt | Private |  | Thời điểm tạo tài khoản admin. |
| 9 | updatedAt | Private |  | Thời điểm cập nhật gần nhất. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | viewListUser() | Public |  | Xem danh sách tất cả người dùng (có phân trang). |
| 2 | viewUser() | Public |  | Xem chi tiết thông tin một người dùng. |
| 3 | lockUser(UUID userId) | Public |  | Khóa tài khoản người dùng (không thể đăng nhập). |
| 4 | unlockUser(UUID userId) | Public |  | Mở khóa tài khoản người dùng. |
| 5 | viewUserList() | Public |  | (Trùng với viewListUser) - Có thể gộp. |
| 6 | viewUserDetail(UUID userId) | Public |  | Xem chi tiết hồ sơ người dùng với các thông tin nhạy cảm. |
| 7 | assignRole(UUID userId, UUID roleId) | Public |  | Gán hoặc thay đổi vai trò cho người dùng. |
| 8 | resetUserPassword(UUID userId) | Public |  | Đặt lại mật khẩu cho người dùng (gửi email OTP). |
| 9 | deleteUser(UUID userId) | Public |  | Xóa (vô hiệu hóa) tài khoản người dùng. |
| 10 | viewRoomPost() | Public |  | Xem chi tiết một bài đăng phòng. |
| 11 | viewListRoomPost() | Public |  | Xem danh sách tất cả bài đăng trên hệ thống. |
| 12 | rejectRoomApproval() | Public |  | Từ chối duyệt bài đăng, kèm lý do. |
| 13 | acceptRoomApproval() | Public |  | Phê duyệt bài đăng để hiển thị công khai. |
| 14 | processSupportRequest() | Public |  | Xử lý yêu cầu hỗ trợ từ người dùng. |
| 15 | verifyHost() | Public |  | Xác thực danh tính chủ phòng (dựa trên ảnh CCCD). |
| 16 | processViolationReport(reportId, newStatus) | Public |  | Xử lý đơn khiếu nại |

| **3.3.15** | *Class SupportRequest* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | ID | Private | Unique | Mã định danh duy nhất của yêu cầu hỗ trợ (Khóa chính). |
| 2 | roomID | Private |  | Mã phòng liên quan đến sự cố cần hỗ trợ. |
| 3 | category | Private | Không null | Phân loại danh mục hỗ trợ. |
| 4 | title | Private | Không null | Tiêu đề ngắn gọn của yêu cầu hỗ trợ. |
| 5 | detailedDescription | Private | Không null | Nội dung mô tả chi tiết vấn đề cần giải quyết. |
| 6 | evidenceImageUrl | Private |  | Đường dẫn URL ảnh chụp màn hình sự cố hoặc bằng chứng kèm theo. |
| 7 | status | Private | Giá trị mặc định | Trạng thái hiện tại của yêu cầu. |
| 8 | createdAt | Private | Không null | Thời điểm tạo yêu cầu hỗ trợ. |
| 9 | updatedAt | Private | Không null | Thời điểm cập nhật trạng thái gần nhất của yêu cầu. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createSupportRequest() | Public |  | Client hoặc Host gửi một yêu cầu hỗ trợ mới lên hệ thống. |
| 2 | viewSupportRequestDetail(UUID requestId) | Public |  | Xem thông tin chi tiết của một yêu cầu hỗ trợ cụ thể. |
| 3 | viewListSupportRequest() | Public |  | Xem danh sách tất cả các yêu cầu hỗ trợ. |
| 4 | updateStatus(UUID requestId, String newStatus) | Public |  | Cập nhật trạng thái của yêu cầu hỗ trợ. |
| 5 | addResolutionNote(UUID requestId, String note) | Public |  | Ghi nhận nội dung, giải pháp hoặc ghi chú kỹ thuật trong quá trình xử lý sự cố. |
| 6 | closeSupportRequest(UUID requestId) | Public |  | Đóng yêu cầu hỗ trợ sau khi vấn đề đã được giải quyết xong. |
| 7 | reopenSupportRequest(UUID requestId) | Public |  | Mở lại yêu cầu nếu người dùng phản hồi rằng sự cố vẫn chưa được khắc phục triệt để. |
| 8 | sendNotificationToUser(UUID requestId) | Public |  | Tự động gửi thông báo cho người gửi khi trạng thái yêu cầu thay đổi. |

| **3.3.16** | *Class ViolationReport* |
| --- | --- |

Mô tả danh sách các thuộc tính:

| **Seq** | **Property** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | ID | Private | Unique | Mã định danh duy nhất của báo cáo vi phạm (Khóa chính). |
| 2 | roomID | Private |  | Mã phòng bị báo cáo. |
| 3 | hostID | Private |  | Mã chủ phòng bị báo cáo. |
| 4 | tenantID | Private | Không null | Mã khách thuê – người trực tiếp gửi báo cáo vi phạm. |
| 5 | reason | Private | Không null | Nội dung mô tả chi tiết lý do, hành vi vi phạm. |
| 6 | processingStatus | Private | Giá trị mặc định | Các trạng thái xử lý đơn yêu cầu. |
| 7 | evidenceImageUrl | Private |  | Đường dẫn URL đến hình ảnh, ảnh chụp màn hình làm bằng chứng vi phạm. |
| 8 | createdAt | Private | Không null | Thời điểm hệ thống ghi nhận báo cáo vi phạm được gửi lên. |

Danh sách phương thức / chức năng chính:

| **Seq** | **Operation** | **Modifier** | **Constraint** | **Description** |
| --- | --- | --- | --- | --- |
| 1 | createViolationReport() | Public |  | Khách thuê (Tenant) tạo và gửi một báo cáo vi phạm mới kèm bằng chứng. |
| 2 | viewViolationReportDetail(UUID reportId) | Public |  | Xem thông tin chi tiết của một báo cáo vi phạm cụ thể. |
| 3 | viewListViolationReport() | Public |  | Admin xem danh sách tất cả các báo cáo vi phạm. |
| 4 | updateProcessingStatus(UUID reportId, String status) | Public |  | Admin cập nhật trạng thái xử lý của đơn yêu cầu. |
| 5 | acceptViolationReport(UUID reportId, String resolution) | Public |  | Phê duyệt báo cáo vi phạm là đúng sự thật, đưa ra phương án xử lý và chuyển trạng thái thành đã giải quyết. |
| 6 | rejectViolationReport(UUID reportId, String rejectReason) | Public |  | Từ chối báo cáo vi phạm (Nếu bằng chứng không rõ ràng hoặc báo cáo sai sự thật), kèm lý do từ chối. |
| 7 | applySanction(UUID targetId, String penaltyType) | Public |  | Thực thi hình phạt dựa trên báo cáo. |
| 8 | notifyReportResult(UUID reportId) | Public |  | Gửi thông báo kết quả xử lý vi phạm về cho Khách thuê (người gửi) và Chủ phòng (người bị báo cáo). |
