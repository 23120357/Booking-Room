# 05 Database Schema

Traceability:
- `docs/design/design/05-data-design.md` section 4.2 Data Specification.
- Related ERD: [03 ERD](03-erd.md).

## Schema Rules

- PostgreSQL is the documented DBMS.
- Knex.js is the documented migration/query tool.
- UUID is used for primary keys in most tables.
- Passwords stored in `NGUOI_DUNG.PASSWORD` must be hashed before storage.
- Sensitive data such as CCCD should be encrypted per [01 Business Rules](01-business-rules.md#security-privacy-and-compliance).

## Tables

### NGUOI_DUNG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_NGUOI_DUNG | UUID | PRIMARY KEY, NOT NULL | Unique user identifier. |
| HO_TEN | STRING | NOT NULL, VARCHAR(255) | Full name. |
| EMAIL | STRING | UNIQUE, NOT NULL, VARCHAR(255) | Email for login/contact. |
| DIEN_THOAI | STRING | UNIQUE, VARCHAR(20) | Phone number. |
| GIOI_TINH | ENUM | DEFAULT `KHAC` | NAM, NU, KHAC. |
| NGAY_SINH | DATE | CHECK <= CURRENT_DATE | Date of birth. |
| DIA_CHI | STRING | VARCHAR(500) | Address/contact address. |
| URL_ANH_DAI_DIEN | STRING | VARCHAR(2048) | Avatar URL. |
| TRANG_THAI | ENUM | NOT NULL, DEFAULT `ACTIVE` | ACTIVE, INACTIVE, BANNED. |
| USERNAME | STRING | UNIQUE, NOT NULL, VARCHAR(50) | Internal username without spaces. |
| PASSWORD | STRING | NOT NULL, VARCHAR(255) | Hashed password. |
| MA_VAI_TRO | UUID | FOREIGN KEY, NOT NULL | Linked role. |

### CHU_PHONG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_CHU_PHONG | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Host user id, references `NGUOI_DUNG`. |
| URL_ANH_CCCD_TRUOC | STRING | NOT NULL, VARCHAR(2048) | Front CCCD image URL. |
| URL_ANH_CCCD_SAU | STRING | NOT NULL, VARCHAR(2048) | Back CCCD image URL. |

### KHACH_THUE

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_KHACH_THUE | UUID | PRIMARY KEY, FOREIGN KEY, NOT NULL | Tenant user id, references `NGUOI_DUNG`. |

### PHONG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_PHONG | UUID | PRIMARY KEY, NOT NULL | Unique room id. |
| TIEU_DE | VARCHAR(255) | NOT NULL | Room/listing title. |
| LOAI_PHONG | VARCHAR(100) | NOT NULL | Room type. |
| DIA_CHI_CHI_TIET | VARCHAR(500) | NOT NULL | Detailed address. |
| SUC_CHUA_TOI_DA | INTEGER | NOT NULL, > 0 | Maximum capacity. |
| GIA_THUE_THANG | NUMERIC(15,2) | NOT NULL, >= 0 | Monthly rent. |
| TIEN_COC | NUMERIC(15,2) | NOT NULL, >= 0 | Deposit amount. |
| TIEN_DIEN | NUMERIC(15,2) | NOT NULL, >= 0 | Electricity fee/unit. |
| TIEN_NUOC | NUMERIC(15,2) | NOT NULL, >= 0 | Water fee/unit. |
| TIEN_INTERNET | NUMERIC(15,2) | DEFAULT 0, >= 0 | Internet fee. |
| PHI_DICH_VU | NUMERIC(15,2) | DEFAULT 0, >= 0 | Other service fees. |
| TRANG_THAI | VARCHAR(50)/ENUM | NOT NULL | Example: TRONG, DA_THUE. |
| DANH_GIA_TRUNG_BINH | NUMERIC(3,2) | DEFAULT 0, 0-5 | Average rating. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |
| NGAY_CAP_NHAT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Updated time. |
| MO_TA_PHONG | TEXT |  | Detailed description. |
| KINH_DO | DOUBLE PRECISION | -180..180 | Longitude. |
| VI_DO | DOUBLE PRECISION | -90..90 | Latitude. |

### YEU_THICH

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_KHACH_THUE | UUID | NOT NULL, FK, composite PK | Tenant id. |
| MA_PHONG | UUID | NOT NULL, FK, composite PK | Room id. |
| TRANG_THAI | BOOLEAN | NOT NULL, DEFAULT TRUE | Favorite active/removed. |
| THOI_GIAN_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Favorite timestamp. |

### DUYET_PHONG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_DON_DUYET_PHONG | UUID | PRIMARY KEY, NOT NULL | Approval request id. |
| MA_PHONG | UUID | NOT NULL, FK | Room id. |
| TRANG_THAI_DUYET | ENUM | NOT NULL, DEFAULT `CHO_DUYET` | CHO_DUYET, DA_DUYET, TU_CHOI. |

### DON_DAT_COC

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_DON_DAT_COC | UUID | PRIMARY KEY, NOT NULL | Deposit booking id. |
| MA_PHONG | UUID | NOT NULL, FK | Room id. |
| MA_KHACH_THUE | UUID | NOT NULL, FK | Tenant id. |
| MA_CHU_PHONG | UUID | NOT NULL, FK | Host id. |

Note: Class specs add fields not listed here: `createdAt`, `expiredAt = createdAt + 15 mins`, `appointmentTime`, `status`, `depositAmount`. Resolve schema/class alignment before migration.

### GIAO_DICH

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_GIAO_DICH | UUID | PRIMARY KEY, NOT NULL | Transaction id. |
| MA_DON_DAT_COC | UUID | NOT NULL, FK | Deposit booking id. |
| SO_TIEN | NUMERIC(15,2) | NOT NULL, > 0 | Amount. |
| PHUONG_THUC_TT | VARCHAR(50)/ENUM | NOT NULL | Example: VNPAY, MOMO, CHUYEN_KHOAN. |
| TRANG_THAI | VARCHAR(50)/ENUM | NOT NULL, DEFAULT `PENDING` | PENDING, SUCCESS, FAILED. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |

### BAO_CAO_VI_PHAM

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_BAO_CAO | UUID | PRIMARY KEY, NOT NULL | Report id. |
| MA_PHONG | UUID | FK, nullable | Reported room id. |
| MA_CHU_PHONG | UUID | FK, nullable | Reported host id. |
| MA_KHACH_THUE | UUID | FK, NOT NULL | Reporting tenant id. |
| LY_DO | TEXT | NOT NULL | Violation reason. |
| TRANG_THAI_XU_LY | ENUM | NOT NULL, DEFAULT `CHO_XU_LY` | CHO_XU_LY, DANG_XU_LY, DA_GIAI_QUYET, TU_CHOI. |
| URL_ANH_BANG_CHUNG | VARCHAR(2048) |  | Evidence image URL. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |

### YEU_CAU_HO_TRO

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_HO_TRO | UUID | PRIMARY KEY, NOT NULL | Support request id. |
| MA_PHONG | UUID | FK, nullable | Related room id. |
| DANH_MUC | ENUM | NOT NULL | SUL_CO_APP, TAI_KHOAN, THANH_TOAN. |
| TIEU_DE | VARCHAR(255) | NOT NULL | Support title. |
| MO_TA_CHI_TIET | TEXT | NOT NULL | Detailed issue description. |
| URL_ANH_BANG_CHUNG | VARCHAR(2048) |  | Evidence screenshot/image. |
| TRANG_THAI | VARCHAR(50)/ENUM | NOT NULL, DEFAULT `MO` | MO, DANG_XU_LY, DONG. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |
| NGAY_CAP_NHAT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Updated time. |

### NHAT_KY_HE_THONG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_NHAT_KY | UUID | PRIMARY KEY, NOT NULL | Log id. |
| MA_NGUOI_DUNG | UUID | FK, NOT NULL | Actor user id. |
| HANH_DONG | VARCHAR(255) | NOT NULL | Action name, e.g. LOGIN, DELETE_ROOM, UPDATE_PASSWORD. |
| THOI_GIAN_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Action timestamp. |

### VAI_TRO

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_VAI_TRO | UUID | PRIMARY KEY, NOT NULL | Role id. |
| TEN_VAI_TRO | VARCHAR(50) | NOT NULL, UNIQUE | ADMIN, LANDLORD, TENANT. |
| MO_TA | VARCHAR(255) |  | Role description. |

### QUYEN

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_QUYEN | UUID | PRIMARY KEY, NOT NULL | Permission id. |
| TEN_QUYEN | VARCHAR(100) | NOT NULL, UNIQUE | Example: ROOM_CREATE, USER_BAN, REPORT_VIEW. |
| MO_TA | VARCHAR(255) |  | Permission description. |

### HINH_ANH_PHONG

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_PHONG | UUID | FK, NOT NULL, composite PK | Room id. |
| SO_THU_TU | INTEGER | NOT NULL, composite PK | Image order. |
| URL_ANH | VARCHAR(2048) | NOT NULL | Image URL. |
| LA_ANH_BIA | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether image is cover. |

### HOI_THOAI

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_HOI_THOAI | UUID | PRIMARY KEY, NOT NULL | Conversation id. |
| MA_KHACH_THUE | UUID | FK, NOT NULL | Tenant id. |
| MA_CHU_PHONG | UUID | FK, NOT NULL | Host id. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Conversation start time. |

### PHIEN

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_PHIEN | UUID | PRIMARY KEY, NOT NULL | Session id. |
| MA_HOI_THOAI | UUID | FK, NOT NULL | Conversation id. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |
| NGAY_HET_HAN | TIMESTAMP | NOT NULL | Expiry time. |

### TIN_NHAN

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_TIN_NHAN | UUID | PRIMARY KEY, NOT NULL | Message id. |
| MA_HOI_THOAI | UUID | FK, NOT NULL | Conversation id. |
| NOI_DUNG | TEXT | NOT NULL | Message content. |
| MA_NGUOI_GUI | UUID | FK, NOT NULL | Sender id. |
| THOI_GIAN_GUI | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Sent timestamp. |
| TRANG_THAI | ENUM | NOT NULL, DEFAULT `DA_GUI` | DA_GUI, DA_NHAN, DA_DOC. |
| NGAY_GUI | DATE | NOT NULL, DEFAULT CURRENT_DATE | Sent date. |
| NGAY_DOC | TIMESTAMP | NULLABLE | Read timestamp. |

### THONG_BAO

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| MA_THONG_BAO | UUID | PRIMARY KEY, NOT NULL | Notification id. |
| TIEU_DE | VARCHAR(255) | NOT NULL | Title. |
| NOI_DUNG | TEXT | NOT NULL | Body. |
| LOAI_THONG_BAO | ENUM | NOT NULL | HE_THONG, DAT_COC, TIN_NHAN_MOI. |
| TRANG_THAI | ENUM | NOT NULL, DEFAULT `CHUA_DOC` | CHUA_DOC, DA_DOC. |
| NGAY_TAO | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created time. |

## Schema Gaps

- No explicit role-permission join table is documented.
- Review table appears in class specs but not in extracted data specification.
- Some class fields are missing from data tables; migrations should reconcile [07 Class Specifications](07-class-specifications.md) before implementation.

## Cross References

- ERD summary: [03 ERD](03-erd.md)
- Business rules: [01 Business Rules](01-business-rules.md)
- Class specs: [07 Class Specifications](07-class-specifications.md)
