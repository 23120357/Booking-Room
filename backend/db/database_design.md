# DATABASE DESIGN SPECIFICATION
## ACCOMMODATION MANAGEMENT & BOOKING SYSTEM

This document specifies the database schema, data types, integrity constraints (Primary Keys, Foreign Keys, Check Constraints), and entity relationships for the Accommodation Management & Booking System. All table and column names have been translated into English and cross-referenced with the architectural entity-relationship design.

---

### 1. Table: `roles` (Vai Trò Hệ Thống)
* Defines core user access levels within the application.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **role_id** | UUID | PRIMARY KEY, NOT NULL | Unique identifier for each role. |
| **role_name** | VARCHAR(50) | NOT NULL, UNIQUE | Name of the role (e.g., 'ADMIN', 'LANDLORD', 'TENANT'). |
| **description** | VARCHAR(255) | NULLABLE | Detailed description of the role's scope. |

---

### 2. Table: `permissions` (Quyền Hạn Chi Tiết)
* Defines atomic system capabilities or actions.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **permission_id** | UUID | PRIMARY KEY, NOT NULL | Unique identifier for each permission. |
| **permission_name**| VARCHAR(100) | NOT NULL, UNIQUE | Technical action name (e.g., 'ROOM_CREATE', 'USER_BAN'). |
| **description** | VARCHAR(255) | NULLABLE | Detailed description of what this permission grants. |

---

### 3. Table: `role_permissions` (Bảng Trung Gian Quyền - Vai Trò)
* Resolves the many-to-many (N:N) relationship between roles and permissions as depicted in `image_a4d68a.jpg`.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **role_id** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY | Component of composite PK. References `roles(role_id)`. |
| **permission_id** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY | Component of composite PK. References `permissions(permission_id)`. |

---

### 4. Table: `users` (Người Dùng)
* The root table for all authenticated actors. Inherited entities branch from this core table.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **user_id** | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the user. |
| **full_name** | VARCHAR(255) | NOT NULL | User's complete legal name. |
| **email** | VARCHAR(255) | UNIQUE, NOT NULL | Primary email address, used for login and notifications. |
| **phone_number** | VARCHAR(20) | UNIQUE, NULLABLE | Contact phone number. |
| **gender** | ENUM | DEFAULT 'OTHER' | User's gender (VALUES: 'MALE', 'FEMALE', 'OTHER'). |
| **date_of_birth** | DATE | CHECK (date_of_birth <= CURRENT_DATE) | Birthdate verification rule to prevent future dates. |
| **address** | VARCHAR(500) | NULLABLE | Residential or contact address. |
| **avatar_url** | VARCHAR(2048) | NULLABLE | S3 or storage bucket path to the user's profile picture. |
| **status** | ENUM | NOT NULL, DEFAULT 'ACTIVE' | Account state (VALUES: 'ACTIVE', 'INACTIVE', 'BANNED'). |
| **username** | VARCHAR(50) | UNIQUE, NOT NULL | Internal login identifier (no spaces permitted). |
| **password** | VARCHAR(255) | NOT NULL | Salted cryptographic hash of the user password. |
| **role_id** | UUID | FOREIGN KEY, NOT NULL | Associates user with a system role. References `roles(role_id)`. |

---

### 5. Table: `landlords` (Chủ Phòng)
* Specialized entity extending `users` via a 1:1 specialization/inheritance relationship.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **landlord_id** | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Primary Key. Shared identity referencing `users(user_id)`. |
| **id_card_front_url**| VARCHAR(2048) | NOT NULL | Storage link to the front image of the national ID card (CCCD). |
| **id_card_back_url** | VARCHAR(2048) | NOT NULL | Storage link to the back image of the national ID card (CCCD). |

---

### 6. Table: `tenants` (Khách Thuê)
* Specialized entity extending `users` via a 1:1 specialization/inheritance relationship.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **tenant_id** | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Primary Key. Shared identity referencing `users(user_id)`. |

---

### 7. Table: `rooms` (Phòng Trọ / Căn Hộ)
* Core listing entity. Updated to explicitly include `landlord_id` to establish ownership (1:N relationship with `landlords`).

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **room_id** | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the listing. |
| **landlord_id** | UUID | FOREIGN KEY, NOT NULL | Ownership key. References `landlords(landlord_id)`. |
| **title** | VARCHAR(255) | NOT NULL | Marketing or descriptive title of the listing. |
| **room_type** | VARCHAR(100) | NOT NULL | Accommodation category (e.g., 'Room', 'Apartment'). |
| **detailed_address** | VARCHAR(500) | NOT NULL | Exact location details (Street number, ward, district). |
| **max_capacity** | INTEGER | NOT NULL, CHECK (max_capacity > 0) | Maximum headcount permitted inside the room. |
| **monthly_rent** | NUMERIC(15,2) | NOT NULL, CHECK (monthly_rent >= 0) | Cost of rent per calendar month (VND). |
| **deposit_amount** | NUMERIC(15,2) | NOT NULL, CHECK (deposit_amount >= 0) | Holding security deposit amount. |
| **electricity_cost** | NUMERIC(15,2) | NOT NULL, CHECK (electricity_cost >= 0) | Unit price or fixed cost for electricity. |
| **water_cost** | NUMERIC(15,2) | NOT NULL, CHECK (water_cost >= 0) | Unit price or fixed cost for water consumption. |
| **internet_cost** | NUMERIC(15,2) | DEFAULT 0, CHECK (internet_cost >= 0) | Flat monthly rate for data connectivity. |
| **service_fee** | NUMERIC(15,2) | DEFAULT 0, CHECK (service_fee >= 0) | Additional recurring fees (trash, security, cleaning). |
| **status** | ENUM / VARCHAR(50) | NOT NULL | Operational status (e.g., 'AVAILABLE', 'RENTED'). |
| **average_rating** | NUMERIC(3,2) | DEFAULT 0, CHECK (average_rating >= 0 AND average_rating <= 5) | System calculated rating on a 5-star scale. |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when the listing was created. |
| **updated_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of the last modifications. |
| **room_description**| TEXT | NULLABLE | Expanded description text field. |
| **longitude** | DOUBLE PRECISION | CHECK (longitude >= -180 AND longitude <= 180) | GIS geographic Longitude coordinate. |
| **latitude** | DOUBLE PRECISION | CHECK (latitude >= -90 AND latitude <= 90) | GIS geographic Latitude coordinate. |

---

### 8. Table: `room_images` (Hình Ảnh Phòng Trọ)
* Stores listing photo attachments. Weak entity structurally tied to `rooms`.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **room_id** | UUID | FOREIGN KEY, NOT NULL, PRIMARY KEY | Component of composite PK. References `rooms(room_id)`. |
| **sequence_number**| INTEGER | NOT NULL, PRIMARY KEY | Component of composite PK. Determines display order (1, 2, 3...). |
| **image_url** | VARCHAR(2048) | NOT NULL | Cloud storage address of the file. |
| **is_cover** | BOOLEAN | NOT NULL, DEFAULT FALSE | Flag indicating if this image is the primary search thumbnail. |

---

### 9. Table: `favorites` (Danh Sách Yêu Thích)
* Bridge entity tracking user bookmarking preferences (N:N relationship between `tenants` and `rooms`).

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **tenant_id** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY | Component of composite PK. References `tenants(tenant_id)`. |
| **room_id** | UUID | NOT NULL, FOREIGN KEY, PRIMARY KEY | Component of composite PK. References `rooms(room_id)`. |
| **status** | BOOLEAN | NOT NULL, DEFAULT TRUE | Active flag (TRUE: active favorite, FALSE: un-favorited history). |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of insertion. |

---

### 10. Table: `room_approvals` (Lịch Sử Duyệt Bài)
* Audit log tracking verification states of listings by administrative moderators.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **approval_id** | UUID | PRIMARY KEY, NOT NULL | Unique key for the moderation log record. |
| **room_id** | UUID | NOT NULL, FOREIGN KEY | Targeted listing identifier. References `rooms(room_id)`. |
| **approval_status** | ENUM | NOT NULL, DEFAULT 'PENDING' | Review state (VALUES: 'PENDING', 'APPROVED', 'REJECTED'). |

---

### 11. Table: `deposits` (Đơn Đặt Cọc)
* Legally/Financially binding down-payment agreements holding a specific listing.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **deposit_id** | UUID | PRIMARY KEY, NOT NULL | Unique reservation contract code. |
| **room_id** | UUID | NOT NULL, FOREIGN KEY | Target room. References `rooms(room_id)`. |
| **tenant_id** | UUID | NOT NULL, FOREIGN KEY | Contracting client. References `tenants(tenant_id)`. |
| **landlord_id** | UUID | NOT NULL, FOREIGN KEY | Contracting property owner. References `landlords(landlord_id)`. |

---

### 12. Table: `transactions` (Giao Dịch Thanh Toán)
* Financial ledger entries mapping to escrow deposit actions.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **transaction_id** | UUID | PRIMARY KEY, NOT NULL | Unique monetary transaction receipt token. |
| **deposit_id** | UUID | NOT NULL, FOREIGN KEY | Parent agreement reference. References `deposits(deposit_id)`. |
| **amount** | NUMERIC(15,2) | NOT NULL, CHECK (amount > 0) | Transacted value in fiat currency (VND). Must be positive. |
| **payment_method** | ENUM / VARCHAR(50) | NOT NULL | Routing gateway used (e.g., 'VNPAY', 'MOMO', 'BANK_TRANSFER'). |
| **status** | ENUM / VARCHAR(50) | NOT NULL, DEFAULT 'PENDING' | Settlement state (e.g., 'PENDING', 'SUCCESS', 'FAILED'). |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Exact execution time. |

---

### 13. Table: `violation_reports` (Báo Cáo Vi Phạm)
* Moderation ticketing mechanism enabling users to flag bad actors or fake listings.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **report_id** | UUID | PRIMARY KEY, NOT NULL | System report ID. |
| **room_id** | UUID | FOREIGN KEY, NULLABLE | Targeted room context. References `rooms(room_id)`. |
| **landlord_id** | UUID | FOREIGN KEY, NULLABLE | Targeted property owner context. References `landlords(landlord_id)`. |
| **tenant_id** | UUID | FOREIGN KEY, NOT NULL | Submitting reporter identity. References `tenants(tenant_id)`. |
| **reason** | TEXT | NOT NULL | Explicit description of the infringement. |
| **resolution_status**| ENUM | NOT NULL, DEFAULT 'PENDING' | Remediation workflow phase (VALUES: 'PENDING', 'PROCESSING', 'RESOLVED', 'DISMISSED'). |
| **evidence_image_url**| VARCHAR(2048)| NULLABLE | Link to a screenshot validation proof. |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation datetime. |

---

### 14. Table: `support_tickets` (Yêu Cầu Hỗ Trợ)
* Technical and administrative help desk tickets. Modified per `image_a4d68a.jpg` to reference `user_id` directly instead of a room constraint.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **ticket_id** | UUID | PRIMARY KEY, NOT NULL | Support request index identifier. |
| **user_id** | UUID | FOREIGN KEY, NOT NULL | Submitting user (Tenant, Landlord, or Admin). References `users(user_id)`. |
| **category** | ENUM | NOT NULL | System slice classification (VALUES: 'APP_FAULT', 'ACCOUNT', 'PAYMENT'). |
| **title** | VARCHAR(255) | NOT NULL | Brief subject or summary statement. |
| **detailed_description**| TEXT | NOT NULL | Explanatory log explaining technical difficulties. |
| **evidence_image_url**| VARCHAR(2048)| NULLABLE | Supporting visual diagnostics/screenshots. |
| **status** | ENUM / VARCHAR(50) | NOT NULL, DEFAULT 'OPEN' | Workflow state (VALUES: 'OPEN', 'IN_PROGRESS', 'CLOSED'). |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Initiation time. |
| **updated_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification state change. |

---

### 15. Table: `conversations` (Hội Thoại)
* Chat room structures tracking communications channels between participants.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **conversation_id**| UUID | PRIMARY KEY, NOT NULL | Communication channel ID. |
| **tenant_id** | UUID | FOREIGN KEY, NOT NULL | Associated tenant entity. References `tenants(tenant_id)`. |
| **landlord_id** | UUID | FOREIGN KEY, NOT NULL | Associated property owner entity. References `landlords(landlord_id)`. |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Channel establishment date. |

---

### 16. Table: `messages` (Tin Nhắn Chi Tiết)
* Individual records tracking atomic text objects inside chat instances.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **message_id** | UUID | PRIMARY KEY, NOT NULL | Unique item index tracking payload. |
| **conversation_id**| UUID | FOREIGN KEY, NOT NULL | Parent context entity mapping. References `conversations(conversation_id)`. |
| **content** | TEXT | NOT NULL | Raw content payload string. |
| **sender_id** | UUID | FOREIGN KEY, NOT NULL | Actor pushing payload. References `users(user_id)`. |
| **sent_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Millisecond precision clock tracking ingestion time. |
| **status** | ENUM | NOT NULL, DEFAULT 'SENT' | Tracking lifecycle flags (VALUES: 'SENT', 'DELIVERED', 'READ'). |
| **sent_date** | DATE | NOT NULL, DEFAULT CURRENT_DATE | Denormalized date field optimizing front-end calendar block groupings. |
| **read_at** | TIMESTAMP | NULLABLE | Precise target execution read acknowledgment time. |

---

### 17. Table: `sessions` (Phiên Làm Việc Kết Nối Chat)
* Tracks transient socket pipelines or session persistence data for stateful systems.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **session_id** | UUID | PRIMARY KEY, NOT NULL | Active system token or state tracker identifier. |
| **conversation_id**| UUID | FOREIGN KEY, NOT NULL | Associated conversation context. References `conversations(conversation_id)`. |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Ingestion time of connectivity registration. |
| **expires_at** | TIMESTAMP | NOT NULL | Expiration safety boundary for stateless verification tokens. |

---

### 18. Table: `notifications` (Thông Báo Hệ Thống)
* Inbound message payload queues dispatched to individual nodes. Updated per `image_a4d68a.jpg` to include direct `user_id` mapping.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **notification_id**| UUID | PRIMARY KEY, NOT NULL | Discrete target notification ID. |
| **user_id** | UUID | FOREIGN KEY, NOT NULL | Recipient account mapping target. References `users(user_id)`. |
| **title** | VARCHAR(255) | NOT NULL | Headlining summary statement. |
| **content** | TEXT | NOT NULL | Explanatory inline information block. |
| **notification_type**| ENUM | NOT NULL | Scope of generation source (VALUES: 'SYSTEM', 'DEPOSIT', 'NEW_MESSAGE'). |
| **status** | ENUM | NOT NULL, DEFAULT 'UNREAD' | Processing states (VALUES: 'UNREAD', 'READ'). |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Dispatched baseline server time. |

---

### 19. Table: `system_logs` (Nhật Ký Hệ Thống / Audit Logs)
* Secure Append-Only data stream recording execution metadata for security operations.

| Attribute | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **log_id** | UUID | PRIMARY KEY, NOT NULL | Sequenced row trace index. |
| **user_id** | UUID | FOREIGN KEY, NOT NULL | Operating actor identity. References `users(user_id)`. |
| **action** | VARCHAR(255) | NOT NULL | Standardized action enum string (e.g., 'LOGIN', 'DELETE_ROOM'). |
| **created_at** | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Absolute immutable generation server time. |
