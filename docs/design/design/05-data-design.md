# Data Design

| **4.1** | Data Diagram |
| --- | --- |

Written by: 23120360 - Đặng Lê Đức Thịnh, 23120352 - Lê Nguyễn Quốc Thái

Edited by: 23120360 - Đặng Lê Đức Thịnh, 23120352 - Lê Nguyễn Quốc Thái

Reviewed by: Lê Nhật Thành, Đỗ Phước Vinh, Trần Đình Thi

[Draw the data diagram of the system, identifying the data components that need to be stored and illustrating the relationships between them]

![Image 9](../../assets/Design-009-c0aa677bee.png)

| **4.2** | Data Specification |
| --- | --- |

Please include the ID and full name of the student who authored, reviewed, or updated this section.

Written by: 23120360 - Đặng Lê Đức Thịnh, 23120352 - Lê Nguyễn Quốc Thái

Edited by: 23120360 - Đặng Lê Đức Thịnh, 23120352 - Lê Nguyễn Quốc Thái

Reviewed by: Lê Nhật Thành, Đỗ Phước Vinh, Trần Đình Thi

Bảng NGUOI_DUNG

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_NGUOI_DUNG** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất cho mỗi người dùng. |
| **HO_TEN** | STRING | NOT NULL, VARCHAR(255) | Họ và tên đầy đủ của người dùng. |
| **EMAIL** | STRING | UNIQUE, NOT NULL, VARCHAR(255) | Địa chỉ thư điện tử, dùng để liên lạc hoặc đăng nhập. |
| **DIEN_THOAI** | STRING | UNIQUE, VARCHAR(20) | Số điện thoại liên lạc. |
| **GIOI_TINH** | ENUM | DEFAULT 'KHAC' | Giới tính người dùng (NAM, NU, KHAC). |
| **NGAY_SINH** | DATE | CHECK (<= CURRENT_DATE) | Ngày tháng năm sinh, phục vụ kiểm tra độ tuổi. |
| **DIA_CHI** | STRING | VARCHAR(500) | Nơi cư trú hoặc địa chỉ liên lạc. |
| **URL_ANH_DAI_DIEN** | STRING | VARCHAR(2048) | Đường dẫn (URL) đến ảnh đại diện lưu trữ trên máy chủ. |
| **TRANG_THAI** | ENUM | NOT NULL, DEFAULT 'ACTIVE' | Trạng thái tài khoản (ACTIVE, INACTIVE, BANNED). |
| **USERNAME** | STRING | UNIQUE, NOT NULL, VARCHAR(50) | Tên đăng nhập nội bộ (không chứa khoảng trắng). |
| **PASSWORD** | STRING | NOT NULL, VARCHAR(255) | Mật khẩu tài khoản (phải được băm trước khi lưu). |
| **MA_VAI_TRO** | UUID | FOREIGN KEY, NOT NULL | Khóa ngoại liên kết xác định quyền hạn của người dùng. |

Bảng CHU_PHONG

| **Thuộc tính** | **Kiểu dữ liệu ** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_CHU_PHONG** | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Khóa chính của bảng. Đồng thời là khóa ngoại tham chiếu đến MA_NGUOI_DUNG trong bảng NGUOI_DUNG. |
| **URL_ANH_CCCD_TRUOC** | STRING | NOT NULL, VARCHAR(2048) | Đường dẫn đến ảnh chụp mặt trước Căn cước công dân (CCCD). |
| **URL_ANH_CCCD_SAU** | STRING | NOT NULL, VARCHAR(2048) | Đường dẫn đến ảnh chụp mặt sau Căn cước công dân (CCCD). |

Bảng KHACH_THUE

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| MA_KHACH_THUE | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Khóa chính của bảng. Đồng thời là khóa ngoại tham chiếu đến MA_NGUOI_DUNG trong bảng NGUOI_DUNG. |

Bảng PHONG

| **Thuộc tính** | **Kiểu dữ liệu ** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_PHONG** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất cho mỗi phòng. |
| **TIEU_DE** | VARCHAR(255) | NOT NULL | Tiêu đề của bài đăng phòng trọ. |
| **LOAI_PHONG** | VARCHAR(100) | NOT NULL | Loại hình phòng (Phòng trọ, Căn hộ,...). |
| **DIA_CHI_CHI_TIET** | VARCHAR(500) | NOT NULL | Địa chỉ chi tiết (Số nhà, tên đường,...). |
| **SUC_CHUA_TOI_DA** | INTEGER | NOT NULL, CHECK (SUC_CHUA_TOI_DA > 0) | Số lượng người ở tối đa. |
| **GIA_THUE_THANG** | NUMERIC(15,2) | NOT NULL, CHECK (GIA_THUE_THANG >= 0) | Giá thuê phòng một tháng. |
| **TIEN_COC** | NUMERIC(15,2) | NOT NULL, CHECK (TIEN_COC >= 0) | Số tiền đặt cọc. |
| **TIEN_DIEN** | NUMERIC(15,2) | NOT NULL, CHECK (TIEN_DIEN >= 0) | Đơn giá hoặc chi phí tiền điện. |
| **TIEN_NUOC** | NUMERIC(15,2) | NOT NULL, CHECK (TIEN_NUOC >= 0) | Đơn giá hoặc chi phí tiền nước. |
| **TIEN_INTERNET** | NUMERIC(15,2) | DEFAULT 0, CHECK (TIEN_INTERNET >= 0) | Chi phí mạng Internet hàng tháng. |
| **PHI_DICH_VU** | NUMERIC(15,2) | DEFAULT 0, CHECK (PHI_DICH_VU >= 0) | Các phụ phí dịch vụ khác. |
| **TRANG_THAI** | VARCHAR(50) (hoặc ENUM) | NOT NULL | Trạng thái phòng (Ví dụ: 'TRONG', 'DA_THUE'). |
| **DANH_GIA_TRUNG_BINH** | NUMERIC(3,2) | DEFAULT 0, CHECK (DANH_GIA_TRUNG_BINH >= 0 AND DANH_GIA_TRUNG_BINH <= 5) | Điểm đánh giá trung bình (Thang điểm 5). |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo bản ghi phòng. |
| **NGAY_CAP_NHAT** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm cập nhật bản ghi gần nhất. |
| **MO_TA_PHONG** | TEXT |  | Nội dung mô tả chi tiết phòng trọ. |
| **KINH_DO** | DOUBLE PRECISION | CHECK (KINH_DO >= -180 AND KINH_DO <= 180) | Tọa độ kinh độ (Longitude). |
| **VI_DO** | DOUBLE PRECISION | CHECK (VI_DO >= -90 AND VI_DO <= 90) | Tọa độ vĩ độ (Latitude). |

Bảng YEU_THICH

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_KHACH_THUE** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY (Cùng với MA_PHONG) | Mã định danh khách thuê, liên kết với khóa chính MA_NGUOI_DUNG của bảng người dùng. |
| **MA_PHONG** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY (Cùng với MA_KHACH_THUE) | Mã định danh phòng trọ, liên kết với khóa chính MA_PHONG của bảng PHONG. |
| **TRANG_THAI** | BOOLEAN | NOT NULL, DEFAULT TRUE | Trạng thái yêu thích (TRUE: Đang yêu thích, FALSE: Đã bỏ yêu thích). |
| **THOI_GIAN_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm khách thuê nhấn yêu thích phòng này. |

Bảng DUYET_PHONG

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_DON_DUYET_PHONG** | hoặc UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất cho mỗi đơn duyệt phòng. |
| **MA_PHONG** | hoặc UUID | NOT NULL, FOREIGN KEY | Mã định danh phòng trọ, liên kết với khóa chínhMA_PHONG của bảng PHONG. |
| **TRANG_THAI_DUYET** | ENUM | NOT NULL, DEFAULT 'CHO_DUYET' | Trạng thái phê duyệt của phòng (CHO_DUYET, DA_DUYET, TU_CHOI). |

Bảng DON_DAT_COC

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_DON_DAT_COC** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất cho mỗi đơn đặt cọc. |
| **MA_PHONG** | UUID | NOT NULL, FOREIGN KEY | Mã định danh phòng trọ, liên kết với khóa chính MA_PHONG của bảng PHONG. |
| **MA_KHACH_THUE** | UUID | NOT NULL, FOREIGN KEY | Mã định danh khách thuê, liên kết với khóa chính MA_NGUOI_DUNG của bảng NGUOI_DUNG. |
| **MA_CHU_PHONG** | UUID | NOT NULL, FOREIGN KEY | Mã định danh chủ phòng, liên kết với khóa chính MA_CHU_PHONG của bảng CHU_PHONG. |

Bảng GIAO_DICH

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_GIAO_DICH** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất cho mỗi giao dịch thanh toán. |
| **MA_DON_DAT_COC** | UUID | NOT NULL, FOREIGN KEY | Mã định danh đơn đặt cọc, liên kết với khóa chính MA_DON_DAT_COC của bảng DON_DAT_COC. |
| **SO_TIEN** | NUMERIC(15,2) | NOT NULL, CHECK (SO_TIEN > 0) | Số tiền thực hiện giao dịch (đơn vị: VNĐ). |
| **PHUONG_THUC_TT** | VARCHAR(50) (hoặc ENUM) | NOT NULL | Phương thức thanh toán (ví dụ: 'VNPAY', 'MOMO', 'CHUYEN_KHOAN'). |
| **TRANG_THAI** | VARCHAR(50) (hoặc ENUM) | NOT NULL, DEFAULT 'PENDING' | Trạng thái giao dịch (ví dụ: 'PENDING', 'SUCCESS', 'FAILED'). |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm phát sinh giao dịch thanh toán. |

Bảng BAO_CAO_VI_PHAM

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_BAO_CAO** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của báo cáo. |
| **MA_PHONG** | UUID | FOREIGN KEY, NULLABLE | Mã phòng bị báo cáo (có thể để trống nếu báo cáo đích danh chủ phòng). Tham chiếu đến MA_PHONG trong bảng PHONG |
| **MA_CHU_PHONG** | UUID | FOREIGN KEY, NULLABLE | Mã chủ phòng bị báo cáo (có thể để trống nếu chỉ báo cáo về phòng). Tham chiếu đến MA_CHU_PHONG trong bảng CHU_PHONG |
| **MA_KHACH_THUE** | UUID | FOREIGN KEY, NOT NULL | Người gửi báo cáo vi phạm. Tham chiếu đến MA_KHACH_THUE trong bảng KHACH_THUE |
| **LY_DO** | TEXT | NOT NULL | Nội dung chi tiết lý do vi phạm. |
| **TRANG_THAI_XU_LY** | ENUM | NOT NULL, DEFAULT 'CHO_XU_LY' | Trạng thái xử lý (CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET, TU_CHOI). |
| **URL_ANH_BANG_CHUNG** | VARCHAR(2048) |  | Đường dẫn đến hình ảnh làm bằng chứng vi phạm. |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm gửi báo cáo. |

Bảng YEU_CAU_HO_TRO

| **Thuộc tính** | **Kiểu dữ liệu ** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_HO_TRO** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của yêu cầu hỗ trợ. |
| **MA_PHONG** | UUID | FOREIGN KEY, NULLABLE | Mã phòng liên quan đến sự cố cần hỗ trợ (nếu có). |
| **DANH_MUC** | ENUM | NOT NULL | Phân loại hỗ trợ (SUL_CO_APP, TAI_KHOAN, THANH_TOAN). |
| **TIEU_DE** | VARCHAR(255) | NOT NULL | Tiêu đề ngắn gọn của yêu cầu hỗ trợ. |
| **MO_TA_CHI_TIET** | TEXT | NOT NULL | Nội dung chi tiết vấn đề cần kỹ thuật giải quyết. |
| **URL_ANH_BANG_CHUNG** | VARCHAR(2048) |  | Ảnh chụp màn hình sự cố/bằng chứng kèm theo. |
| **TRANG_THAI** | VARCHAR(50) (hoặc ENUM) | NOT NULL, DEFAULT 'MO' | Trạng thái ticket (MO, DANG_XU_LY, DONG). |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo yêu cầu hỗ trợ. |
| **NGAY_CAP_NHAT** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm cập nhật trạng thái mới nhất của ticket. |

Bảng NHAT_KY_HE_THONG

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_NHAT_KY** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của dòng nhật ký. |
| **MA_NGUOI_DUNG** | UUID | FOREIGN KEY, NOT NULL | Mã người dùng thực hiện hành động. |
| **HANH_DONG** | VARCHAR(255) | NOT NULL | Tên hành động hành vi (ví dụ: 'LOGIN', 'DELETE_ROOM', 'UPDATE_PASSWORD'). |
| **THOI_GIAN_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm chính xác hành động xảy ra. |

Bảng VAI_TRO

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_VAI_TRO** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của vai trò. |
| **TEN_VAI_TRO** | VARCHAR(50) | NOT NULL, UNIQUE | Tên vai trò (ví dụ: 'ADMIN', 'LANDLORD', 'TENANT'). |
| **MO_TA** | VARCHAR(255) |  | Mô tả chi tiết về phạm vi của vai trò này. |

Bảng QUYEN

| **Thuộc tính** | **Kiểu dữ liệu ** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_QUYEN** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của quyền. |
| **TEN_QUYEN** | VARCHAR(100) | NOT NULL, UNIQUE | Tên quyền cụ thể (ví dụ: 'ROOM_CREATE', 'USER_BAN', 'REPORT_VIEW'). |
| **MO_TA** | VARCHAR(255) |  | Mô tả chức năng cụ thể của quyền này. |

Bảng HINH_ANH_PHONG

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_PHONG** | UUID | FOREIGN KEY, NOT NULL, PRIMARY KEY (Cùng với SO_THU_TU) | Khóa ngoại liên kết với bảng PHONG. |
| **SO_THU_TU** | INTEGER | NOT NULL, PRIMARY KEY (Cùng với MA_PHONG) | Thứ tự hiển thị của ảnh trong bộ sưu tập (1, 2, 3...). |
| **URL_ANH** | VARCHAR(2048) | NOT NULL | Đường dẫn lưu trữ tập tin hình ảnh. |
| **LA_ANH_BIA** | BOOLEAN | NOT NULL, DEFAULT FALSE | Xác định ảnh này có phải là ảnh đại diện chính của phòng không. |

Bảng HOI_THOAI

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_HOI_THOAI** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của cuộc hội thoại. |
| **MA_KHACH_THUE** | UUID | FOREIGN KEY, NOT NULL | Khóa ngoại trỏ về mã người dùng đóng vai trò khách thuê. |
| **MA_CHU_PHONG** | UUID | FOREIGN KEY, NOT NULL | Khóa ngoại trỏ về mã người dùng đóng vai trò chủ phòng. |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm mở phòng chat này lần đầu tiên. |

Bảng PHIEN

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_PHIEN** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của phiên (Session ID). |
| **MA_HOI_THOAI** | UUID | FOREIGN KEY, NOT NULL | Khóa ngoại liên kết trực tiếp với bảng HOI_THOAI. |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm khởi tạo phiên làm việc/kết nối. |
| **NGAY_HET_HAN** | TIMESTAMP | NOT NULL | Thời điểm phiên hết hiệu lực (Token/Session Expiration). |

Bảng TIN_NHAN

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_TIN_NHAN** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của tin nhắn. |
| **MA_HOI_THOAI** | UUID | FOREIGN KEY, NOT NULL | Khóa ngoại xác định tin nhắn thuộc phòng chat nào. |
| **NOI_DUNG** | TEXT | NOT NULL | Nội dung văn bản của tin nhắn gửi đi. |
| **MA_NGUOI_GUI** | UUID | FOREIGN KEY, NOT NULL | Xác định ai là người gửi (Khách thuê hoặc Chủ phòng). |
| **THOI_GIAN_GUI** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm tin nhắn được gửi lên máy chủ hệ thống. |
| **TRANG_THAI** | ENUM | NOT NULL, DEFAULT 'DA_GUI' | Trạng thái tin nhắn (DA_GUI, DA_NHAN, DA_DOC). |
| **NGAY_GUI** | DATE | NOT NULL, DEFAULT CURRENT_DATE | Ngày gửi (phục vụ việc gom nhóm tin nhắn theo ngày ở FE). |
| **NGAY_DOC** | TIMESTAMP | NULLABLE | Thời điểm chính xác người nhận nhấn mở xem tin nhắn. |

Bảng THONG_BAO

| **Thuộc tính** | **Kiểu dữ liệu ** | **Ràng buộc** | **Mô tả** |
| --- | --- | --- | --- |
| **MA_THONG_BAO** | UUID | PRIMARY KEY, NOT NULL | Khóa chính định danh duy nhất của thông báo. |
| **TIEU_DE** | VARCHAR(255) | NOT NULL | Tiêu đề hiển thị ngắn gọn của thông báo. |
| **NOI_DUNG** | TEXT | NOT NULL | Nội dung chi tiết của thông báo gửi tới người dùng. |
| **LOAI_THONG_BAO** | ENUM | NOT NULL | Phân loại thông báo (HE_THONG, DAT_COC, TIN_NHAN_MOI). |
| **TRANG_THAI** | ENUM | NOT NULL, DEFAULT 'CHUA_DOC' | Trạng thái xem thông báo (CHUA_DOC, DA_DOC). |
| **NGAY_TAO** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Thời điểm hệ thống phát sinh thông báo này. |

[If using a Database Management System (DBMS), describe the data tables, the information for each data column including attribute name, data type and value constraints, key constraints..., and explain the attribute]

[If using XML/JSON or a self-defined structured file to store data, the file structure, attribute information, data type, and value constraints need to be specifically described. An example of the content for the information storage file should be included]
