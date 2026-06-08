# Tổng quan yêu cầu

#### Stakeholders

***Please include the ID and full name of the student who authored, reviewed, or updated this section.***

***Written by: 23120357 - L***ê Nhật Thành

***Edited by: ***23120357 - Lê Nhật Thành

***Reviewed by: ***Trần Đình Thi, Đặng Lê Đức Thịnh và Đỗ Phước Vinh, Lê Nguyễn Quốc Thái

| **STT** | **Stakeholder** | **Mô tả** |
| --- | --- | --- |
| 1 | Người thuê (Guest/Tenant) | Là người dùng trực tiếp tìm kiếm phòng trọ, căn hộ. Họ quan tâm đến tính minh bạch của thông tin, sự an toàn khi đặt cọc và khả năng tương tác trực tiếp với chủ nhà qua Realtime-chat. Phản hồi của họ giúp cải thiện bộ lọc tìm kiếm và độ chính xác của AI Chatbot cũng như quyết định đến sự thành công và doanh thu của toàn hệ thống. |
| 2 | Chủ nhà/Chủ trọ (Host) | Là đối tác cung cấp nguồn phòng. Họ cần công cụ số hóa để thay đổi quy trình quản lý thủ công (ghi chép tay), theo dõi hóa đơn và thống kê doanh thu theo tháng/quý/năm. Họ chịu trách nhiệm về tính xác thực của thông tin phòng đăng tải. |
| 3 | Quản trị viên (Admin) | Người quản lý cao nhất của hệ thống. Admin có nhiệm vụ phê duyệt bài đăng để tránh lừa đảo, quản lý giao dịch đặt cọc, theo dõi lịch sử hệ thống và hỗ trợ giải quyết tranh chấp giữa người thuê và chủ nhà. |
| 4 | Trưởng dự án (Teamlead) | Chịu trách nhiệm điều phối nhóm, lập kế hoạch Sprint (1-2 tuần) và giám sát tiến độ trên Trello. Teamlead đảm bảo dự án đi đúng hướng, đáp ứng các ràng buộc về công nghệ như Next.js và PostgreSQL. |
| 5 | Đội ngũ phát triển (Development Team) | Gồm các lập trình viên frontend, backend, designer, QA tester. Họ cần có kiến thức chuyên sâu về công nghệ web, cơ sở dữ liệu, API, bảo mật, và kinh nghiệm với các framework hiện đại. Đội phát triển chịu trách nhiệm thiết kế kiến trúc hệ thống, lựa chọn công nghệ phù hợp (React, Node.js, PostgreSQL, Nextjs, etc.), phát triển tính năng theo yêu cầu và đảm bảo code quality. Họ cần quản lý hệ thống có thể xử lý hàng nghìn request đồng thời, tối ưu performance và xử lý các vấn đề kỹ thuật phức tạp như real-time tracking, payment integration, và push notification. Đội ngũ này lắng nghe feedback từ người dùng để sửa lỗi và cải thiện trải nghiệm. |
| 6 | Nhà cung cấp bản đồ (Google Maps API) | Cung cấp dịch vụ định vị, hiển thị vị trí phòng trọ trên bản đồ và tính toán khoảng cách. Độ chính xác của Map data ảnh hưởng trực tiếp đến hiệu quả tìm kiếm của người thuê. |
| 7 | Nhà cung cấp thanh toán | Cung cấp hạ tầng để xử lý các giao dịch đặt cọc trực tuyến an toàn. Họ đảm bảo tính bảo mật cho thông tin tài chính của người dùng thông qua các môi trường Sandbox hoặc thực tế. |
| 8 | Nhà cung cấp dịch vụ SMS/Email | Cung cấp API để gửi mã OTP xác thực số điện thoại hoặc gửi email hóa đơn cọc phòng tự động cho khách hàng. |
| 9 | Nhà cung cấp AI (ví dụ: OpenAI API) | Cung cấp mô hình ngôn ngữ lớn (LLM) để vận hành trợ lý ảo tìm phòng. AI giúp giải thích lý do gợi ý, so sánh ưu/nhược điểm các phòng và tự động hóa quy trình hỗ trợ khách hàng. |
| 10 | Nhà cung cấp hạ tầng (Vercel, AWS S3, Neon) | Vercel lưu trữ Frontend, AWS S3 lưu trữ hình ảnh phòng trọ và Neon quản lý cơ sở dữ liệu PostgreSQL. Họ đảm bảo hệ thống hoạt động ổn định và có khả năng mở rộng (Scalability). |
| 11 | Cơ quan quản lý Nhà nước | Đưa ra các quy định pháp lý về kinh doanh dịch vụ lưu trú và bảo vệ dữ liệu cá nhân (tương đương Nghị định 13/2023/NĐ-CP). Hệ thống phải tuân thủ các quy định về đăng ký tạm trú và minh bạch trong giao dịch tài chính tại Việt Nam. |
|  |  |  |

#### Danh sách yêu cầu

##### Đặc tả yêu cầu chức năng

Written by: 23120352 - Lê Nguyễn Quốc Thái

Edited by: 23120352 - Lê Nguyễn Quốc Thái

Reviewed by: Trần Đình Thi, Đặng Lê Đức Thịnh và Đỗ Phước Vinh, Lê Nhật Thành

**FR-1: Đăng ký/Đăng nhập tài khoản người dùng**

Trong hệ thống, đối tượng tham gia bao gồm: Người dùng mới, Người dùng đã có tài khoản, Người thuê, Chủ phòng và Quản trị viên.

**FR-1.1: Đăng ký tài khoản**

- **Phương thức đăng ký:** Hệ thống phải cho phép người dùng đăng ký tài khoản thông qua Số điện thoại, Email cá nhân, hoặc thông qua OAuth2 qua Google/Facebook.
- **Thông tin cơ bản:** Hệ thống yêu cầu người dùng cung cấp các trường thông tin tối thiểu để định danh bao gồm: Họ và tên, SĐT, Email và Mật khẩu.
- **Ràng buộc dữ liệu:**
  - SĐT và Email phải là duy nhất (Unique) trên toàn bộ cơ sở dữ liệu của hệ thống.
  - SĐT phải đúng định dạng chuẩn (ví dụ: đủ 10 số, đúng đầu số hợp lệ).
  - **Bảo vệ mật khẩu:** Mật khẩu phải tuân thủ chính sách độ phức tạp cao để không dễ dàng bị brute-force. Yêu cầu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
- **Xác thực danh tính (Verification):** Hệ thống phải phát sinh và gửi mã OTP qua SMS hoặc Email. Mã OTP có hiệu lực tối đa 5 phút. Nếu OTP hợp lệ, tài khoản chuyển sang trạng thái "Active". Nếu nhập sai quá 3 lần hoặc hết hạn, hệ thống từ chối và yêu cầu gửi lại mã mới.
- **Quản lý luồng đăng ký rác:** Hệ thống phải có cơ chế tự động dọn dẹp (xóa hoặc vô hiệu hóa) các bản ghi đăng ký chưa được xác thực OTP sau 15 phút.
- **Bảo mật dữ liệu lưu trữ:** Tránh lưu trữ mật khẩu dưới dạng bản rõ (plaintext). Hệ thống phải sử dụng thuật toán an toàn như bcrypt trước khi lưu vào cơ sở dữ liệu để bảo vệ mật khẩu.
- **Vai trò:**
  - **Người thuê:** Là vai trò mặc định sau khi đăng ký thành công.
  - **Chủ phòng:** Khi người dùng muốn đăng thông tin phòng, hệ thống yêu cầu nâng cấp tài khoản. Yêu cầu cung cấp thêm thông tin định danh pháp lý: Ảnh chụp CMND/CCCD (hai mặt), thông tin liên hệ chính thức, và (tùy chọn) giấy tờ chứng minh sở hữu/ủy quyền quản lý bất động sản.
- **Phê duyệt:** Quản trị viên hệ thống phải tiến hành kiểm duyệt thủ công hoặc bán tự động các thông tin định danh của vai trò "Chủ phòng" trước khi cấp quyền đăng bài, nhằm đảm bảo quản lý tài khoản và hạn chế lừa đảo.
**FR-1.2: Đăng nhập**

- **Phương thức đăng nhập:** Hệ thống phải cho phép người dùng đăng nhập vào hệ thống bằng Tên đăng nhập (Email hoặc SĐT) kết hợp với Mật khẩu, hoặc sử dụng Single Sign-On (SSO) qua Google/Facebook.
- **Xác thực và Cảnh báo:**
  - Hệ thống phải đối chiếu thông tin đăng nhập với cơ sở dữ liệu. Chỉ cấp quyền truy cập (thông qua Session/JWT) khi thông tin hoàn toàn trùng khớp.
  - Hệ thống phải trả về thông báo lỗi chung chung (ví dụ: "Tài khoản hoặc mật khẩu không chính xác") nhằm chống lại kỹ thuật dò quét tài khoản.
- **Bảo vệ tài khoản:** hệ thống phải tạm khóa tài khoản trong 10 phút nếu người dùng đăng nhập sai quá 5 lần liên tiếp. Đồng thời, gửi email/SMS cảnh báo bảo mật đến chủ tài khoản.
- **Quản lý Phiên làm việc:**
  - Hệ thống tự động tự đăng xuất nếu người dùng không có bất kỳ tương tác nào với hệ thống trong khoảng thời gian nhất định (ví dụ: 30 phút đối với thao tác tài chính như đặt cọc trực tuyến, 7 ngày đối với thao tác lướt xem phòng).
- **Nhật ký kiểm toán:** Hệ thống phải ghi nhận chi tiết lịch sử các phiên đăng nhập thành công và thất bại, bao gồm: Thời gian (Timestamp), Địa chỉ IP, và Thông tin thiết bị (User-Agent). Dữ liệu này giúp quản trị viên quản lý tài khoản và phát hiện các hành vi truy cập bất thường.
- **Bảo mật đường truyền:** Toàn bộ quá trình truyền tải thông tin đăng nhập (Tài khoản, Mật khẩu, Token) từ phía Client lên Server phải được mã hóa qua giao thức HTTPS để chống Man-in-the-middle attack.
**FR-2: Quản lý hồ sơ người dùng**

**FR-2.1: Xem thông tin hồ sơ**

- **Hồ sơ cá nhân:**
  - Hệ thống phải hiển thị toàn bộ thông tin cá nhân của người dùng đang đăng nhập bao gồm: Ảnh đại diện, Họ tên, SĐT, Email, Giới tính, Ngày sinh, Địa chỉ, và Trạng thái xác thực tài khoản.
  - Khu vực này cũng đóng vai trò là Dashboard để người dùng điều hướng đến các tính năng khác như: xem lịch sử các giao dịch đặt cọc và thanh toán, xem danh sách các phòng yêu thích.
- **Hồ sơ công khai:**
  - Khi người thuê nhấn vào xem thông tin của một Chủ phòng, hệ thống chỉ được phép hiển thị các Thông tin công khai bao gồm: Tên chủ phòng, Ảnh đại diện, SĐT.
  - Hệ thống không hiển thị thông tin nhạy cảm (ví dụ: Email cá nhân, lịch sử giao dịch của chủ phòng) cho người dùng khác xem.
**FR-2.2: Cập nhật thông tin cá nhân**

- **Cập nhật thông tin cơ bản:** Hệ thống cho phép người dùng thay đổi Ảnh đại diện, Họ tên, Giới tính, Ngày sinh.
- **Cập nhật thông tin định danh:**
  - Khi người dùng muốn thay đổi Số điện thoại hoặc Email.
  - Hệ thống phải thực hiện luồng xác minh 2 bước: Yêu cầu nhập lại Mật khẩu hiện tại, sau đó gửi một mã OTP mới đến SĐT/Email mới. Chỉ khi OTP hợp lệ, dữ liệu mới được cập nhật trên hệ thống.
**FR-2.3: Quản lý bảo mật cá nhân**

- **Đổi mật khẩu: **Hệ thống phải cho phép người dùng thay đổi mật khẩu qua các bước:
  - Nhập mật khẩu cũ (để xác thực danh tính tại thời điểm đó).
  - Nhập mật khẩu mới.
  - Nhập lại mật khẩu mới.
**FR-2.4: Xác thực danh tính Chủ phòng**

- Hệ thống phải cung cấp một biểu mẫu để người dùng tải lên hình ảnh Giấy tờ tùy thân (CMND/CCCD) và minh chứng quyền sở hữu phòng.
- Trạng thái hồ sơ sẽ chuyển sang "Đang chờ duyệt". Trong thời gian này, chủ phòng chưa thể đăng bài.
- Thông tin này sẽ được chuyển đến phân hệ của Quản trị viên để tiến hành kiểm duyệt thủ công. Sau khi Quản trị viên duyệt, tài khoản Chủ phòng sẽ được gắn huy hiệu "Đã xác thực" trên giao diện công khai và được cấp quyền đăng phòng.
**FR-3: Tìm kiếm và Tra cứu phòng**

**FR-3.1: Bộ lọc tìm kiếm và Tra cứu**

Hệ thống phải cung cấp công cụ tìm kiếm đa chiều, cho phép người thuê tìm phòng theo các tiêu chí cụ thể.

- **Tìm kiếm theo từ khóa:** Cho phép người dùng nhập từ khóa tự do sử dụng (Full Text Search) (ví dụ: tên đường, tên khu vực, đặc điểm phòng).
- **Tìm kiếm theo khoảng giá:** Hệ thống phải cho phép người thuê lọc tìm phòng theo khoảng tiền có thể thuê (ví dụ: từ 2 triệu đến 4 triệu VNĐ).
- **Tìm kiếm theo địa điểm: **Hệ thống phải cho phép tìm phòng theo địa điểm (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã).
- **Tìm kiếm theo dịch vụ và tiện ích: **Hệ thống phải cho phép lọc theo dịch vụ (ví dụ: có máy lạnh, chỗ để xe, cho phép nuôi thú cưng, WC riêng).
- **Sắp xếp kết quả:** Hệ thống phải cung cấp các tùy chọn sắp xếp danh sách kết quả (ví dụ: Giá từ thấp đến cao, Giá từ cao xuống thấp, Mới đăng nhất).
**FR-3.2: Xử lý và Hiển thị kết quả**

- **Hiển thị danh sách:** Kết quả tìm kiếm phải được Pagination hoặc Infinite Scroll để tránh quá tải dữ liệu tải về trình duyệt.
- **Mỗi kết quả tóm tắt cần hiển thị:** Ảnh bìa, Tiêu đề, Giá thuê, Địa chỉ rút gọn và Trạng thái (Còn trống/Đã cho thuê).
**FR-4: Xem chi tiết thông tin phòng**

- Hệ thống phải cho phép người thuê xem thông tin mô tả chi tiết của một phòng cụ thể.
- Trang chi tiết phải bao gồm: Bộ sưu tập hình ảnh/video, Mô tả bằng văn bản, Giá thuê, Tiền cọc yêu cầu, Danh sách tiện ích, Địa chỉ chính xác (có thể tích hợp bản đồ), và Nút hành động (Nhắn tin, Đặt cọc).
- Tại đây, hệ thống cũng nên hiển thị Điểm đánh giá và các ý kiến/bình luận về phòng cụ thể đó từ những người dùng đã hoặc đang thuê.
**FR-5: Tương tác và Trao đổi trực tuyến**

**FR-5.1: Khởi tạo và Quản lý hội thoại**

- **Bắt đầu cuộc trò chuyện:** Hệ thống phải cho phép người thuê và chủ phòng nhắn tin trực tiếp với nhau thông qua một nút "Nhắn tin" được đặt tại trang chi tiết phòng hoặc trang hồ sơ.
- **Định danh hội thoại:** Mỗi Chat Room giữa Người thuê và Chủ phòng là một phiên độc lập, được định danh duy nhất và liên kết trực tiếp với thông tin của Căn phòng đang được thảo luận để tiện cho việc tra cứu ngữ cảnh.
- **Danh sách tin nhắn:** Hệ thống cung cấp một giao diện quản lý danh sách các cuộc hội thoại đang diễn ra, sắp xếp theo thời gian có tin nhắn mới nhất giảm dần.
**FR-5.2: Lưu trữ và Đồng bộ lịch sử**

- **Lưu trữ bền vững :** Toàn bộ nội dung tin nhắn phải được lưu trữ an toàn trong cơ sở dữ liệu. Hệ thống cho phép người dùng cuộn ngược lên để tải thêm (Load more/Pagination) lịch sử tin nhắn cũ.
- **Trạng thái tin nhắn:** Hệ thống cần cập nhật và hiển thị trạng thái của từng dòng tin nhắn: Đã gửi (Sent), Đã nhận (Delivered), Đã xem (Read).
**FR-6: Quản lý bài đăng phòng**

**FR-6.1: Đăng thông tin phòng mới**

Hệ thống phải cho phép người dùng với vai trò Chủ phòng đã được xác thực đăng thông tin phòng lên website để tìm người thuê. Quá trình này yêu cầu thu thập một bộ dữ liệu:

- **Thông tin định danh bài đăng:** Tiêu đề (ngắn gọn), Loại hình (Phòng trọ, Căn hộ mini, Nhà nguyên căn, Phòng ký túc xá, Phòng chung cư).
- **Thông tin không gian và vị trí:** Địa chỉ chi tiết, Diện tích, Sức chứa tối đa (số người).
- **Thông tin tài chính:** Giá thuê tính theo tháng, Tiền cọc yêu cầu, và các chi phí phát sinh (Điện, Nước, Phí dịch vụ, Internet).
- **Thông tin thuộc tính:** Danh sách các tiện ích có sẵn (Máy lạnh, Tủ lạnh, Máy giặt, Chỗ để xe, Thang máy, Giờ giấc tự do, Cho phép nuôi thú cưng).
- **Tài nguyên đa phương tiện: **Hệ thống yêu cầu tải lên tối thiểu 3 hình ảnh rõ nét (bao gồm ảnh chụp tổng quan, khu vực bếp, và nhà vệ sinh,...).
- **Ràng buộc:** Hệ thống phải kiểm tra tính hợp lệ của dữ liệu đầu vào. Ví dụ:
  - Giá thuê và Diện tích phải là số dương;
  - Các trường thông tin bắt buộc không được để trống;
  - Kích thước mỗi tệp hình ảnh không vượt quá 5MB;...
- **Trạng thái khởi tạo:** Sau khi Chủ phòng hoàn tất việc điền form và nhấn "Gửi", bài đăng sẽ được lưu vào cơ sở dữ liệu với trạng thái ban đầu là **Pending **và chưa được hiển thị trên không gian tra cứu.
**FR-6.2: Phê duyệt bài đăng (Admin Kiểm duyệt)**

- Hệ thống phải cung cấp giao diện cho Quản trị viên để có quyền duyệt bài đăng của chủ phòng trước khi hiển thị lên web nhằm đảm bảo nội dung không vi phạm nội quy của website.
- **Luồng xử lý:**
  - Nếu Quản trị viên chọn **Phê duyệt (Approve)**: Trạng thái bài đăng chuyển thành **Active (Đang hoạt động)** và bắt đầu xuất hiện trong kết quả tìm kiếm của Người thuê.
  - Nếu Quản trị viên chọn **Từ chối (Reject)**: Hệ thống yêu cầu Quản trị viên nhập "Lý do từ chối". Bài đăng chuyển sang trạng thái **Rejected (Bị từ chối)**, đồng thời hệ thống gửi thông báo/email kèm lý do đến Chủ phòng để họ khắc phục.
**FR-6.3: Cập nhật thông tin và Quản lý trạng thái phòng**

- **Chỉnh sửa thông tin:** Hệ thống phải cho phép Chủ phòng có thể chỉnh sửa thông tin của phòng đã đăng.
- **Thay đổi trạng thái thủ công:** Hệ thống cho phép Chủ phòng chủ động chuyển đổi trạng thái của phòng giữa **Active (Đang trống)** và **Rented (Đã cho thuê)**. Khi ở trạng thái "Đã cho thuê", phòng sẽ bị ẩn khỏi kết quả tìm kiếm mới, nhưng những người đã lưu phòng vào mục yêu thích vẫn có thể xem lại thông tin.
**FR-7: Quản lý danh sách phòng yêu thích**

**FR-7.1: Thêm và Bỏ lưu phòng**

- **Thao tác Lưu phòng:** Tại các giao diện hiển thị danh sách phòng (kết quả tìm kiếm) hoặc trang xem chi tiết phòng, hệ thống phải cung cấp một nút tương tác để người thuê lưu lại.
- **Thao tác Bỏ lưu:** Nếu một phòng đã nằm trong danh sách yêu thích, khi người dùng nhấp lại vào biểu tượng đó, hệ thống phải loại bỏ phòng này khỏi danh sách.
**FR-7.2: Xem và Quản lý danh sách yêu thích**

- **Truy xuất danh sách:** Hệ thống phải cung cấp một trang chuyên biệt (nằm trong khu vực quản lý Hồ sơ cá nhân) để người thuê xem danh sách các phòng mà họ quan tâm.
- **Đồng bộ trạng thái thực tế:** Nếu một phòng trong danh sách yêu thích bị Chủ phòng chuyển trạng thái sang Rented hệ thống phải lập tức làm mờ phòng đó trong danh sách yêu thích và gắn nhãn "Đã cho thuê / Không còn trống".
**FR-8: Đặt phòng và Thanh toán trực tuyến**

**FR-8.1: Khởi tạo Yêu cầu Đặt cọc / Đặt phòng**

- **Thao tác người thuê:** Hệ thống phải cho phép người thuê thực hiện đặt phòng trực tuyến hoặc thanh toán trực tuyến khoản tiền cọc để giữ phòng.
- **Tùy chọn thanh toán:** Hệ thống phải cung cấp nhiều lựa chọn phương thức thanh toán để tiện cho người thuê chuyển khoản ngân hàng, Ví điện tử qua mã QR.
- **Ràng buộc nghiệp vụ:** Khi người thuê nhấn "Xác nhận đặt cọc", hệ thống tạo ra một bản ghi Giao dịch (Transaction) với trạng thái **Pending (Chờ xử lý)**. Lúc này, hệ thống phải thực hiện cơ chế "Khóa tạm thời" căn phòng đó trong một khoảng thời gian ngắn (ví dụ: 15 phút) để tránh việc người khác tiếp tục đặt cọc trùng lặp.
**FR-8.2: Xử lý Yêu cầu từ phía Chủ phòng**

- **Thông báo hệ thống:** Ngay khi có một yêu cầu đặt cọc mới được khởi tạo, hệ thống phải tự động gửi thông báo qua email cho chủ phòng.
- **Thao tác kiểm duyệt:** Hệ thống cho phép chủ phòng phê duyệt yêu cầu đặt phòng/ đặt cọc nếu phòng đã có người khác thuê (ngoài hệ thống) hoặc nhận thấy người thuê không phù hợp.
- **Luồng trạng thái:**
  - Nếu **Phê duyệt**: Trạng thái giao dịch chuyển sang **Awaiting Payment**. Người thuê nhận được thông báo để tiến hành chuyển tiền.
  - Nếu **Từ chối**: Trạng thái chuyển sang **Cancelled**. Hệ thống giải phóng "Khóa tạm thời", đưa phòng trở lại trạng thái hiển thị cho mọi người tìm kiếm.
**FR-8.3: Xử lý Thanh toán và Cập nhật Trạng thái**

- **Tích hợp cổng thanh toán:** Khi người thuê tiến hành thanh toán, hệ thống sẽ điều hướng người dùng sang giao diện của cổng thanh toán trung gian. Mọi thông tin thẻ/tài khoản ngân hàng không được lưu trữ trên server.
- **Ghi nhận kết quả:** Khi khách hàng thanh toán xong, Cổng thanh toán sẽ gọi ngược lại server của hệ thống để báo kết quả. Nếu thanh toán thành công, hệ thống tự động:
  1. Chuyển trạng thái giao dịch sang **Completed**.
  2. Chuyển trạng thái của Căn phòng sang **Rented** và ẩn khỏi các kết quả tìm kiếm mới.
  3. Gửi biên lai điện tử (Email) cho cả Người thuê và Chủ phòng.
**FR-8.4: Quản lý và Truy xuất Lịch sử Giao dịch**

- **Góc độ Người thuê và Chủ phòng:** Hệ thống phải cung cấp giao diện để người thuê xem lại lịch sử các giao dịch đặt cọc và thanh toán để dễ dàng kiểm tra và làm bằng chứng khi cần thiết.
**FR-9: Hệ thống thống kê dành cho Chủ phòng**

- **Tổng hợp dữ liệu:** Hệ thống phải tính toán và hiển thị tổng doanh thu từ các giao dịch đã hoàn tất.
- **Bộ lọc thời gian:** Hệ thống phải cho phép chủ phòng thống kê doanh thu đặt phòng theo các mốc thời gian tùy chọn: theo tháng, quý, năm.
- **Trực quan hóa:** Dữ liệu doanh thu cần được biểu diễn dưới dạng các biểu đồ (ví dụ: Biểu đồ cột cho doanh thu từng tháng, Biểu đồ đường để xem xu hướng tăng trưởng) bên cạnh các con số tổng quát trực tiếp.
**FR-10: Trợ lý AI tư vấn tìm phòng**

Mục tiêu là cung cấp các đề xuất phòng ở có độ chính xác cao bằng cách đối chiếu tự động giữa yêu cầu cá nhân hóa của khách hàng và dữ liệu địa lý thực tế.

**FR-10.1: Khởi tạo tham số đầu vào**

- **Tham số hồ sơ cá nhân:** Hệ thống phải cung cấp giao diện cho phép người dùng khai báo các đặc điểm cá nhân, bao gồm thuộc tính nghề nghiệp và các hạng mục sở thích/thói quen sinh hoạt.
- **Tham số không gian mục tiêu:** Hệ thống bắt buộc người dùng xác định khu vực hành chính hoặc ranh giới địa lý mục tiêu mà họ dự định tìm phòng.
**FR-10.2: Truy xuất và Tích hợp dữ liệu không gian**

Hệ thống Backend đóng vai trò cốt lõi trong việc chuẩn bị tập dữ liệu sự thật trước khi giao tiếp với AI.

- **Lọc dữ liệu cơ sở:** Hệ thống phải thực hiện truy vấn cơ sở dữ liệu để trích xuất danh sách các phòng trọ/chung cư đang ở trạng thái khả dụng và nằm trong phạm vi khu vực địa lý mục tiêu đã được chỉ định.
- **Truy vấn địa điểm quan tâm:** Đối với tập hợp các phòng đã được lọc ra, hệ thống phải tự động quét và truy xuất các POI lân cận tương ứng với các tham số nghề nghiệp và sở thích mà người dùng đã khai báo.
- **Định lượng khoảng cách:** Hệ thống phải tính toán và ghi nhận chính xác khoảng cách vật lý từ tọa độ của từng phòng đến các POI mục tiêu tương ứng.
**FR-10.3: Đóng gói ngữ cảnh và Xử lý ngôn ngữ**

Hệ thống chỉ sử dụng Mô hình Ngôn ngữ Lớn (LLM) cho mục đích suy luận logic, không dùng để truy vấn kiến thức.

- **Tạo lập ngữ cảnh động:** Hệ thống phải tổng hợp danh sách phòng cùng bộ chỉ số khoảng cách POI thành một gói dữ liệu ngữ cảnh (Context Payload).
- **Giao tiếp API:** Hệ thống gửi gói dữ liệu ngữ cảnh này cùng với chỉ thị phân tích (Prompt) qua API đến LLM, nhằm đảm bảo LLM có đầy đủ thông tin định lượng thực tế để thực hiện suy luận, từ đó giảm thiểu tối đa hiện tượng ảo giác thông tin.
- **Kết xuất phản hồi:** Hệ thống phải hiển thị kết quả phân tích từ LLM cho người dùng, trong đó kết quả phải bao gồm thông tin mô tả chi tiết của phòng, các liên kết điều hướng trực tiếp đến trang đặt phòng. Đồng thời, kết quả phải kèm theo phần giải thích lý luận rõ ràng về mức độ phù hợp của các đề xuất dựa trên khoảng cách địa lý và tiêu chí sinh hoạt của người dùng.
**FR-11: Quản lý Giao dịch Hệ thống**

**FR-11.1: Theo dõi và tra cứu giao dịch**

- **Giao diện Giám sát:** Hệ thống phải cung cấp một bảng điều khiển tập trung, cho phép Quản trị viên theo dõi toàn bộ lịch sử giao dịch trên hệ thống.
- **Thông tin hiển thị:** Danh sách giao dịch phải bao gồm: Mã giao dịch, Tên người chuyển (Người thuê), Tên người nhận (Chủ phòng), Số tiền, Phương thức thanh toán, Thời gian thực hiện và Trạng thái hiện tại (Thành công, Thất bại, Đang chờ, Đã hoàn tiền).
- **Công cụ lọc và tra cứu:** Quản trị viên có khả năng tra cứu chéo bằng Mã giao dịch hoặc sử dụng các bộ lọc đa chiều (theo khoảng thời gian, theo trạng thái, theo tài khoản) để truy xuất nhanh dữ liệu.
**FR-11.2: Hỗ trợ giải quyết tranh chấp**

- **Tính bất biến của dữ liệu:** Dữ liệu giao dịch hiển thị cho Quản trị viên chỉ có quyền Đọc (Read-only). Hệ thống tuyệt đối không cấp quyền Sửa hoặc Xóa các bản ghi này, nhằm đảm bảo tính toàn vẹn của bằng chứng để kiểm soát và hỗ trợ giải quyết tranh chấp khi cần thiết.
**FR-12: Quản lý và Phản hồi Yêu cầu Hỗ trợ**

**FR-12.1: Tiếp nhận và phân loại yêu cầu**

- **Danh sách yêu cầu:** Hệ thống phải tổng hợp và hiển thị danh sách các yêu cầu hỗ trợ từ người dùng. Mỗi yêu cầu phải được gắn một mã định danh duy nhất.
- **Thông tin vé hỗ trợ:** Danh sách cần hiển thị các cột dữ liệu cốt lõi: Tiêu đề sự cố, Người gửi, Phân loại vấn đề (Lỗi kỹ thuật, Báo cáo tài khoản lừa đảo, Vấn đề thanh toán, Vấn đề phòng ở), Thời gian gửi và Trạng thái.
**FR-12.2: Phản hồi và xử lý sự cố**

- **Tương tác giải quyết:** Hệ thống phải cung cấp một giao diện chi tiết để Quản trị viên xem nội dung sự cố và trực tiếp phản hồi các yêu cầu hỗ trợ của người dùng. Nội dung phản hồi được ghi nhận dưới dạng chuỗi hội thoại có lưu vết thời gian.
- **Kiểm soát vòng đời:** Quản trị viên có quyền thay đổi trạng thái của yêu cầu hỗ trợ trong suốt vòng đời của nó: từ **Open, In Progress, Resolved, Closed**.

##### Đặc tả yêu cầu phi chức năng

Written by: Trần Đình Thi - 23120359

Edited by: Trần Đình Thi - 23120359

Reviewed by: Lê Nguyễn Quốc Thái, Đặng Lê Đức Thịnh và Đỗ Phước Vinh, Lê Nhật Thành

**NFR-1: Hiệu năng (Performance)**

**NFR-1.1: Thời gian phản hồi**

- Tìm kiếm và lọc phòng (gợi ý khi gõ): 95% yêu cầu phải phản hồi trong < 500 ms. (Áp dụng cho tính năng gợi ý theo giá, địa điểm).
- Tìm kiếm nâng cao (nhấn Enter) và Xem chi tiết phòng: 95% yêu cầu phải tải xong trong < 2 giây.
- Gửi tin nhắn realtime: Tin nhắn giữa người thuê và chủ phòng phải được gửi và nhận trong < 500 ms (sử dụng [Socket.io](https://socket.io/)).
- Xác thực đăng nhập/đăng ký: Hoàn tất trong < 2 giây (bao gồm hash mật khẩu và tạo JWT).
- 95% quy trình đặt cọc/thanh toán (từ lúc xác nhận đến nhận thông báo) phải hoàn tất dưới 6 giây (bao gồm tích hợp cổng thanh toán và realtime).
- Phản hồi của AI Chatbot: Thời gian từ lúc gửi câu hỏi đến khi nhận được gợi ý phòng từ OpenAI API không quá < 5 giây.
**NFR-1.2: Tốc độ tải trang**

- Trang chủ (hiển thị danh sách phòng), trang kết quả tìm kiếm phải hiển thị hoàn chỉnh trong ≤ 2.5 giây với tốc độ mạng ≥ 20 Mbps. Hình ảnh phòng trọ được nén ở định dạng WebP hoặc JPEG chất lượng 80%.
**NFR-1.3: Xử lý đồng thời**

- Hệ thống phải xử lý được tối thiểu 200 phiên truy cập đồng thời mà không gây sập hoặc chậm trễ nghiêm trọng (CPU trung bình ≤ 80%).
**NFR-1.4: Tính sẵn sàng (Availability)**

- Hệ thống cần đạt ≥ 99% thời gian hoạt động mỗi tháng.
- Hệ thống hoạt động 24/7 cho người thuê và chủ nhà. Ngoại trừ thời gian bảo trì tối đa 1 giờ/tuần (thường vào cuối tuần).
- Real-time chat và AI Chatbot phải hoạt động ổn định 24/7 để hỗ trợ người dùng.
**NFR-2: Bảo mật (Security)**

**NFR-2.1: Mã hóa dữ liệu**

- Mật khẩu người dùng được mã hóa bằng bcrypt (cost factor ≥ 10) trước khi lưu vào PostgreSQL.
- Toàn bộ dữ liệu truyền tải giữa Client (Next.js) và Server (Node.js) phải qua HTTPS (TLS 1.2+).
- Dữ liệu nhạy cảm (số CCCD, thông tin thanh toán - nếu có) được mã hóa bằng AES-256.
- Hình ảnh phòng trọ lưu trên AWS S3 với quyền truy cập private.
**NFR-2.2: Phân quyền truy cập (JWT)**

- Hệ thống có 3 vai trò: Guest (Người thuê), Host (Chủ phòng), Admin (Quản trị viên).
- Guest: Chỉ được xem phòng, nhắn tin, đặt cọc, đánh giá. Không thể sửa/xóa bài đăng.
- Host: Được đăng bài, sửa/xóa bài của chính mình, xem thống kê doanh thu, duyệt yêu cầu đặt phòng. Không được xem thông tin thanh toán chi tiết của Guest.
- Admin: Có quyền approve/reject bài đăng, khóa/mở tài khoản Host/Guest, xem toàn bộ giao dịch và yêu cầu hỗ trợ.
**NFR-2.3: Đăng nhập an toàn**

- Khóa tài khoản 10 phút sau 5 lần đăng nhập sai.
- Token JWT hết hạn sau 7 ngày (hoặc ngắn hơn tùy cài đặt). Người dùng có thể "Đăng xuất" để hủy token.
**NFR-2.4: Bảo vệ nội dung**

- Admin phải duyệt bài đăng trước khi hiển thị công khai để tránh tin giả, lừa đảo hoặc vi phạm nội quy.
**NFR-2.4: Giám sát và ghi log**

- Mọi hành động quan trọng (đăng bài, đặt cọc, phê duyệt, chat) đều được log để hỗ trợ giải quyết tranh chấp.
**NFR-3: Khả năng sử dụng (Usability)**

**NFR-3.1: Dễ học và dễ dùng**

- Người thuê (Guest) mới: 9/10 người dùng thử nghiệm có thể hoàn thành luồng "Tìm phòng → Xem chi tiết → Nhắn tin cho chủ nhà" trong < 5 phút.
- Chủ phòng (Host) mới: 8/10 người có thể đăng tin thành công (nhập đầy đủ thông tin, giá, hình ảnh) trong < 10 phút.
- Admin mới: Có thể thao tác phê duyệt bài hoặc khóa tài khoản trong < 2 phút sau khi đăng nhập vào dashboard.
**NFR-3.2: Tương tác trực quan**

- AI Chatbot hiển thị dưới dạng icon float (dễ thấy) ở góc phải màn hình.
- Realtime Chat có thông báo hiển thị số tin nhắn chưa đọc (badge) cả trên web và email (gửi qua Nodemailer nếu cần).
**NFR-4: Khả năng mở rộng và Bảo trì (Scalability & Maintainability)**

**NFR-4.1: Module hóa rõ ràng**

- Mã nguồn được tổ chức theo cấu trúc ví dụ như sau:
  - frontend/ (Next.js)
  - backend/ (Node.js + Express)
  - db/ (migrations, seeds - Knex.js)
- Các module phải độc lập tương đối, dễ dàng sửa lỗi mà không ảnh hưởng toàn hệ thống.
**NFR-4.2: Bảo trì linh hoạt**

- Bảo trì nhỏ (ví dụ: sửa CSS, cập nhật nội dung): Không cần dừng hệ thống, hoặc dừng tối đa 15 phút.
- Bảo trì lớn (nâng cấp backend, database): Thông báo trước 24 giờ, thời gian ngừng hoạt động không quá 1 giờ.
**NFR-4.3: Quản lý phiên bản**

- Sử dụng GitHub với quy trình:
  - main: code ổn định đã qua kiểm thử.
  - dev: code đang phát triển, tích hợp các nhánh tính năng.
  - feature/* (ví dụ: feature/ai-chatbot, feature/payment): phát triển từng tính năng.
- Mỗi pull request cần ít nhất 1 thành viên khác review trước khi merge vào dev.
**NFR-4.4: Khả năng mở rộng**

- Hệ thống có thể xử lý lượng dữ liệu lên đến 1000 phòng trọ và 100 người dùng hoạt động đồng thời trong điều kiện tài nguyên giới hạn (free tier của Render/Neon), nhưng vẫn đảm bảo hiệu năng cơ bản.
**NFR-5: Độ tin cậy và Phục hồi (Reliability & Recovery)**

**NFR-5.1: Xử lý lỗi**

- Khi mất kết nối internet, hệ thống hiển thị thông báo "Mất kết nối, vui lòng kiểm tra lại mạng" và cho phép Guest thử lại khi có mạng.
- Nếu thanh toán đặt cọc thất bại (lỗi từ VNPAY sandbox), hệ thống giữ thông tin đơn đặt phòng trong 10 phút để Guest thử lại mà không cần nhập lại.
**NFR-5.2: Sao lưu dữ liệu**

- Cơ sở dữ liệu PostgreSQL (Neon) tự động sao lưu mỗi 24 giờ. Với đồ án, chỉ cần đảm bảo có backup tại máy local hoặc sử dụng tính năng backup có sẵn của Neon.
**NFR-5.3: Logging**

- Ghi log các hành động quan trọng: đăng nhập, đăng xuất, tạo/sửa/xóa bài đăng, đặt phòng, thanh toán (giả lập), phê duyệt bài của Admin.
- Log được lưu dưới dạng file theo ngày hoặc trong bảng logs của database, lưu trữ tối thiểu 30 ngày.
**NFR-6: Tương thích và Tích hợp (Compatibility & Integration)**

**NFR-6.1: Tích hợp API bên thứ ba**

- AI Chatbot: Gọi API OpenAI (GPT-3.5 hoặc GPT-4 mini) để sinh gợi ý phòng và giải thích. Cần xử lý lỗi khi API key hết hạn hoặc quota vượt mức.
- Bản đồ: Tích hợp Google Maps API hoặc MapTiler để hiển thị vị trí phòng trọ.
- Thanh toán: Môi trường Sandbox của VNPAY hoặc Stripe (không dùng tiền thật).
- Lưu trữ ảnh: AWS S3 (free tier) hoặc dịch vụ thay thế như Cloudinary.
**NFR-6.2: Tuân thủ chuẩn giao tiếp**

- Backend cung cấp RESTful API, request/response dạng JSON.
- Mã trạng thái HTTP chuẩn: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error).
**NFR-6.3: Tương thích trình duyệt**

- Hoạt động ổn định trên các trình duyệt hiện đại: Chrome ≥ 108.x, Edge ≥ 108.x, Firefox ≥ 100.x, Safari ≥ 15.x (trên macOS/iOS).
**NFR-7: Tuân thủ và Đạo đức (Compliance & Ethics)**

**NFR-7.1: Minh bạch thông tin**

- Hệ thống hiển thị rõ: phòng đã được Admin duyệt, có ghi nhãn "Đã xác thực" hay chưa.
- Công khai chính sách hủy đặt cọc (nếu có) trước khi Guest thanh toán.
- Lịch sử giao dịch đặt cọc được lưu trữ minh bạch, có thể xuất báo cáo
**NFR-7.2: Ngăn chặn lừa đảo**

- Không cho phép Host liên lạc riêng với Guest ngoài hệ thống (Realtime Chat). Không hiển thị số điện thoại trực tiếp trên bài đăng để tránh tin rác.
- Admin có quyền khóa tài khoản nếu phát hiện hành vi lừa đảo (qua báo cáo từ Guest).
**NFR-7.3: Bảo vệ dữ liệu cá nhân**

- Tuân thủ các quy định cơ bản về bảo vệ dữ liệu (Nghị định 13/2023/NĐ-CP). Chỉ thu thập thông tin cần thiết (họ tên, SĐT, email). Không bán hoặc chia sẻ dữ liệu cho bên thứ ba.
**NFR-7.4: Đạo đức AI**

- AI Chatbot không được gợi ý phòng dựa trên các yếu tố nhạy cảm (dân tộc, tôn giáo, khu vực phân biệt). Phải giải thích rõ lý do gợi ý (ví dụ: "Phòng này phù hợp với ngân sách của bạn", "Gần trường đại học...") như đã nêu trong đề xuất giải pháp.
[Describe the non-functional requirements of the system using natural language]
