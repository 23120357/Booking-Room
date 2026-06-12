# 10 API Implementation Contracts

Tai lieu nay liet ke cac API can implement theo tung module cua project Booking Room, dua tren:

- `docs/02-requirements.md`
- `docs/03-erd.md`
- `docs/05-database-schema.md`
- `docs/06-api-spec.md`
- `docs/07-class-specifications.md`
- route/controller/service hien co trong `backend/`
- TypeScript types va API client hien co trong `frontend/`

## Quy uoc chung

Base URL backend hien tai: `http://localhost:5000`

Frontend dang goi truc tiep cac path khong co prefix `/api`, vi backend mount song song ca 2 dang:

- `/auth/...` va `/api/auth/...`
- `/rooms/...` va `/api/rooms/...`
- `/admin/rooms/...` va `/api/admin/rooms/...`

Khuyen nghi chuan hoa khi implement moi: dung `/api/...`. Neu can tuong thich frontend hien tai, giu alias khong co `/api`.

Response envelope thanh cong:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Response envelope loi:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "field": "error message"
  }
}
```

Header auth:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Roles:

- `TENANT`: khach thue
- `HOST`: chu phong, map tu DB role `LANDLORD`
- `ADMIN`: quan tri vien

HTTP status chinh:

| Status | Y nghia |
| --- | --- |
| 200 | Thanh cong |
| 201 | Tao moi thanh cong |
| 204 | Thanh cong khong co body, neu can |
| 400 | Sai request/validation |
| 401 | Chua dang nhap/token sai |
| 403 | Khong co quyen |
| 404 | Khong tim thay |
| 409 | Trung du lieu/xung dot trang thai |
| 423 | Tai khoan dang bi khoa tam thoi |
| 500 | Loi server |

## DTO dung chung

### User

```json
{
  "user_id": "uuid",
  "full_name": "Nguyen Van A",
  "email": "user@example.com",
  "phone_number": "0901234567",
  "gender": "OTHER",
  "date_of_birth": "2000-01-01",
  "address": "Quan 1, TP.HCM",
  "avatar_url": "https://...",
  "status": "ACTIVE",
  "username": "nguyenvana",
  "role_id": "uuid",
  "role": "TENANT"
}
```

### Room

```json
{
  "room_id": "uuid",
  "landlord_id": "uuid",
  "title": "Phong tro gan DH KHTN",
  "room_type": "Phong tro",
  "detailed_address": "227 Nguyen Van Cu, Quan 5, TP.HCM",
  "max_capacity": 2,
  "monthly_rent": 3500000,
  "deposit_amount": 3500000,
  "electricity_cost": 4000,
  "water_cost": 100000,
  "internet_cost": 100000,
  "service_fee": 50000,
  "status": "AVAILABLE",
  "approval_status": "APPROVED",
  "average_rating": 4.5,
  "created_at": "2026-06-12T00:00:00.000Z",
  "updated_at": "2026-06-12T00:00:00.000Z",
  "room_description": "Mo ta chi tiet",
  "longitude": 106.682,
  "latitude": 10.762,
  "cover_image_url": "https://...",
  "images": [
    {
      "sequence_number": 1,
      "image_url": "https://...",
      "is_cover": true
    }
  ],
  "host": {
    "user_id": "uuid",
    "full_name": "Chu phong A",
    "avatar_url": "https://...",
    "phone_number": "0901234567"
  }
}
```

### Pagination

```json
{
  "page": 1,
  "limit": 12,
  "total": 100,
  "total_pages": 9
}
```

## 1. System/Health Module

### 1.1 Health check

Status: da co trong `backend/app.js`.

`GET /health`

Auth: public

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "status": "ok",
    "uptime": 120.5,
    "timestamp": "2026-06-12T00:00:00.000Z"
  }
}
```

### 1.2 Database health check

Status: da co trong `backend/app.js`.

`GET /health/db`

Auth: public hoac internal only neu deploy production.

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "status": "ok",
    "database": "reachable",
    "result": 1
  }
}
```

## 2. Auth Module

### 2.1 Register

Status: da co route/controller/service.

`POST /api/auth/register`

Auth: public

Request body:

```json
{
  "fullName": "Nguyen Van A",
  "email": "tenant@example.com",
  "phoneNumber": "0901234567",
  "username": "tenant01",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "TENANT",
  "idCardFrontUrl": "https://...",
  "idCardBackUrl": "https://..."
}
```

Rules:

- `role` chi nhan `TENANT` hoac `HOST`.
- Neu `role = HOST`, bat buoc co `idCardFrontUrl`, `idCardBackUrl`.
- Password theo service hien tai: toi thieu 8 ky tu, co chu thuong, chu hoa, so va ky tu dac biet.
- Email, phone, username khong duoc trung.

Response `201`:

```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": "<User>",
    "token": "jwt-access-token"
  }
}
```

### 2.2 Login

Status: da co route/controller/service.

`POST /api/auth/login`

Auth: public

Request body:

```json
{
  "identifier": "tenant@example.com",
  "password": "Password@123"
}
```

`identifier` co the la email, phone number hoac username.

Response `200`:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": "<User>",
    "token": "jwt-access-token"
  }
}
```

Loi chinh:

- `401 Invalid credentials`
- `423 Account is temporarily locked`

### 2.3 Logout

Status: da co route/controller, hien chua invalidate token server-side.

`POST /api/auth/logout`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### 2.4 Get current user

Status: da co route/controller.

`GET /api/auth/me`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Current user",
  "data": {
    "user": "<User>"
  }
}
```

### 2.5 Request password reset OTP

Status: can implement.

`POST /api/auth/password/forgot`

Auth: public

Request body:

```json
{
  "identifier": "tenant@example.com"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "OTP sent if account exists",
  "data": {
    "otp_id": "uuid",
    "expires_at": "2026-06-12T00:05:00.000Z"
  }
}
```

### 2.6 Reset password with OTP

Status: can implement.

`POST /api/auth/password/reset`

Auth: public

Request body:

```json
{
  "otp_id": "uuid",
  "otp": "123456",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

### 2.7 Change password

Status: can implement.

`PATCH /api/auth/password`

Auth: `TENANT | HOST | ADMIN`

Request body:

```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

## 3. Profile Module

### 3.1 Get my profile

Status: can implement, co the reuse `/api/auth/me`.

`GET /api/profile/me`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": "<User>"
  }
}
```

### 3.2 Update my profile

Status: can implement.

`PATCH /api/profile/me`

Auth: `TENANT | HOST | ADMIN`

Request body:

```json
{
  "full_name": "Nguyen Van A",
  "phone_number": "0901234567",
  "gender": "MALE",
  "date_of_birth": "2000-01-01",
  "address": "Quan 5, TP.HCM",
  "avatar_url": "https://..."
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": "<User>"
  }
}
```

### 3.3 Submit/update host verification documents

Status: can implement.

`POST /api/profile/host-verification`

Auth: `HOST`

Request body:

```json
{
  "idCardFrontUrl": "https://...",
  "idCardBackUrl": "https://..."
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Host verification documents submitted",
  "data": {
    "landlord_id": "uuid",
    "id_card_front_url": "https://...",
    "id_card_back_url": "https://...",
    "is_verified": true
  }
}
```

## 4. Public Room Module

### 4.1 List/search rooms

Status: da co route/controller/service.

`GET /api/rooms`

Auth: public

Query params:

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | number | no | Default `1` |
| `limit` | number | no | Default `12`, max `50` |
| `keyword` / `q` | string | no | Tim theo title, description, address |
| `location` | string | no | Tim theo address |
| `roomType` / `room_type` | string | no | Loai phong |
| `minPrice` / `min_price` | number | no | Gia thue tu |
| `maxPrice` / `max_price` | number | no | Gia thue den |
| `sort` | string | no | `newest`, `price_asc`, `price_desc`, `rating_desc` |

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Rooms fetched successfully",
  "data": {
    "items": ["<Room>"],
    "pagination": "<Pagination>"
  }
}
```

### 4.2 Get room detail

Status: da co route/controller/service.

`GET /api/rooms/:id`

Auth: optional

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Room fetched successfully",
  "data": {
    "room": "<Room>"
  }
}
```

## 5. Host Room Management Module

### 5.1 Create room post

Status: da co route/controller/service.

`POST /api/rooms`

Auth: `HOST`

Request body:

```json
{
  "title": "Phong tro gan DH KHTN",
  "room_type": "Phong tro",
  "detailed_address": "227 Nguyen Van Cu, Quan 5, TP.HCM",
  "max_capacity": 2,
  "monthly_rent": 3500000,
  "deposit_amount": 3500000,
  "electricity_cost": 4000,
  "water_cost": 100000,
  "internet_cost": 100000,
  "service_fee": 50000,
  "room_description": "Mo ta chi tiet",
  "longitude": 106.682,
  "latitude": 10.762,
  "images": [
    "https://image-1.jpg",
    "https://image-2.jpg"
  ]
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Room submitted for approval",
  "data": {
    "room": "<Room>"
  }
}
```

### 5.2 List my rooms

Status: da co route/controller/service.

`GET /api/rooms/my`

Auth: `HOST`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Host rooms fetched successfully",
  "data": {
    "rooms": ["<Room>"]
  }
}
```

### 5.3 Update my room

Status: da co route/controller/service.

`PATCH /api/rooms/:id`

Auth: `HOST`

Request body: partial room fields.

```json
{
  "title": "Phong tro moi cap nhat",
  "monthly_rent": 3800000,
  "images": [
    "https://new-image.jpg"
  ]
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Room updated and submitted for approval",
  "data": {
    "room": "<Room>"
  }
}
```

### 5.4 Delete my room

Status: da co route/controller/service.

`DELETE /api/rooms/:id`

Auth: `HOST`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Room deleted successfully",
  "data": null
}
```

### 5.5 Update room availability/status

Status: can implement.

`PATCH /api/rooms/:id/status`

Auth: `HOST`

Request body:

```json
{
  "status": "AVAILABLE"
}
```

Allowed status: `AVAILABLE`, `LOCKED`, `RENTED`.

Response `200`:

```json
{
  "success": true,
  "message": "Room status updated successfully",
  "data": {
    "room": "<Room>"
  }
}
```

## 6. Admin Room Approval Module

### 6.1 List pending rooms

Status: da co route/controller/service.

`GET /api/admin/rooms/pending`

Auth: `ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Pending rooms fetched successfully",
  "data": {
    "rooms": ["<Room>"]
  }
}
```

### 6.2 Approve room

Status: da co route/controller/service.

`PATCH /api/admin/rooms/:id/approve`

Auth: `ADMIN`

Request body:

```json
{}
```

Response `200`:

```json
{
  "success": true,
  "message": "Room approved successfully",
  "data": {
    "room": "<Room>"
  }
}
```

### 6.3 Reject room

Status: da co route/controller/service. Backend hien tai chua luu reason.

`PATCH /api/admin/rooms/:id/reject`

Auth: `ADMIN`

Request body:

```json
{
  "reason": "Thong tin hinh anh chua ro"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Room rejected successfully",
  "data": {
    "room": "<Room>"
  }
}
```

## 7. Booking/Deposit Module

### 7.1 Create deposit booking

Status: can implement.

`POST /api/bookings/deposits`

Auth: `TENANT`

Request body:

```json
{
  "room_id": "uuid",
  "appointment_time": "2026-06-15T09:00:00.000Z"
}
```

Server lay `tenant_id` tu JWT, `landlord_id` va `deposit_amount` tu room. `expired_at = created_at + 15 minutes`.

Response `201`:

```json
{
  "success": true,
  "message": "Deposit booking created successfully",
  "data": {
    "deposit": {
      "deposit_id": "uuid",
      "room_id": "uuid",
      "tenant_id": "uuid",
      "landlord_id": "uuid",
      "deposit_amount": 3500000,
      "appointment_time": "2026-06-15T09:00:00.000Z",
      "status": "PROCESSING",
      "created_at": "2026-06-12T00:00:00.000Z",
      "expired_at": "2026-06-12T00:15:00.000Z"
    }
  }
}
```

### 7.2 List my deposit bookings

Status: can implement.

`GET /api/bookings/deposits/my`

Auth: `TENANT`

Query params: `page`, `limit`, `status`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Deposit bookings fetched successfully",
  "data": {
    "items": [
      {
        "deposit_id": "uuid",
        "room": "<Room>",
        "deposit_amount": 3500000,
        "appointment_time": "2026-06-15T09:00:00.000Z",
        "status": "PROCESSING",
        "created_at": "2026-06-12T00:00:00.000Z",
        "expired_at": "2026-06-12T00:15:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 7.3 Get deposit booking detail

Status: can implement.

`GET /api/bookings/deposits/:id`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Deposit booking fetched successfully",
  "data": {
    "deposit": {
      "deposit_id": "uuid",
      "room": "<Room>",
      "tenant": "<User>",
      "landlord": "<User>",
      "deposit_amount": 3500000,
      "appointment_time": "2026-06-15T09:00:00.000Z",
      "status": "PROCESSING",
      "created_at": "2026-06-12T00:00:00.000Z",
      "expired_at": "2026-06-12T00:15:00.000Z",
      "confirmed_at": null,
      "cancelled_at": null,
      "cancellation_reason": null
    }
  }
}
```

### 7.4 Cancel deposit booking

Status: can implement.

`PATCH /api/bookings/deposits/:id/cancel`

Auth: `TENANT`

Request body:

```json
{
  "reason": "Khong con nhu cau"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Deposit booking cancelled successfully",
  "data": {
    "deposit": {
      "deposit_id": "uuid",
      "status": "CANCELLED",
      "cancelled_at": "2026-06-12T00:10:00.000Z",
      "cancellation_reason": "Khong con nhu cau"
    }
  }
}
```

### 7.5 Host list deposit requests

Status: can implement.

`GET /api/host/bookings/deposits`

Auth: `HOST`

Query params: `page`, `limit`, `status`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Host deposit requests fetched successfully",
  "data": {
    "items": [
      {
        "deposit_id": "uuid",
        "room": "<Room>",
        "tenant": "<User>",
        "deposit_amount": 3500000,
        "appointment_time": "2026-06-15T09:00:00.000Z",
        "status": "CONFIRMED"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 7.6 Host process deposit request

Status: can implement.

`PATCH /api/host/bookings/deposits/:id/status`

Auth: `HOST`

Request body:

```json
{
  "status": "CONFIRMED",
  "reason": null
}
```

Allowed status cho host: `CONFIRMED`, `CANCELLED`.

Response `200`:

```json
{
  "success": true,
  "message": "Deposit request updated successfully",
  "data": {
    "deposit": {
      "deposit_id": "uuid",
      "status": "CONFIRMED",
      "confirmed_at": "2026-06-12T00:10:00.000Z"
    }
  }
}
```

## 8. Payment/Transaction Module

### 8.1 Create payment transaction

Status: can implement.

`POST /api/payments/transactions`

Auth: `TENANT`

Request body:

```json
{
  "deposit_id": "uuid",
  "payment_method": "VNPAY",
  "return_url": "http://localhost:3000/tenant/bookings/payment-result"
}
```

Allowed method theo migration: `VNPAY`, `MOMO`, `BANK_TRANSFER`.

Response `201`:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "transaction_id": "uuid",
      "deposit_id": "uuid",
      "amount": 3500000,
      "payment_method": "VNPAY",
      "status": "PENDING",
      "created_at": "2026-06-12T00:00:00.000Z"
    },
    "payment_url": "https://sandbox-payment-gateway/..."
  }
}
```

### 8.2 Payment gateway callback/webhook

Status: can implement.

`POST /api/payments/webhook`

Auth: gateway signature, not JWT.

Request body:

```json
{
  "gateway": "VNPAY",
  "gateway_transaction_id": "VNPAY-123",
  "transaction_id": "uuid",
  "response_code": "00",
  "amount": 3500000,
  "signature": "signed-payload"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Payment callback processed successfully",
  "data": {
    "transaction": {
      "transaction_id": "uuid",
      "status": "SUCCESS"
    },
    "deposit": {
      "deposit_id": "uuid",
      "status": "CONFIRMED"
    }
  }
}
```

### 8.3 Get transaction detail

Status: can implement.

`GET /api/payments/transactions/:id`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Transaction fetched successfully",
  "data": {
    "transaction": {
      "transaction_id": "uuid",
      "deposit_id": "uuid",
      "amount": 3500000,
      "payment_method": "VNPAY",
      "status": "SUCCESS",
      "created_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 8.4 Admin list transactions

Status: can implement.

`GET /api/admin/transactions`

Auth: `ADMIN`

Query params: `page`, `limit`, `status`, `payment_method`, `from`, `to`, `keyword`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": {
    "items": [
      {
        "transaction_id": "uuid",
        "deposit_id": "uuid",
        "room": "<Room>",
        "tenant": "<User>",
        "amount": 3500000,
        "payment_method": "VNPAY",
        "status": "SUCCESS",
        "created_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

## 9. Review Module

### 9.1 List room reviews

Status: can implement.

`GET /api/rooms/:roomId/reviews`

Auth: public

Query params: `page`, `limit`, `sort`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "items": [
      {
        "review_id": "uuid",
        "deposit_id": "uuid",
        "room_id": "uuid",
        "tenant": {
          "user_id": "uuid",
          "full_name": "Nguyen Van A",
          "avatar_url": "https://..."
        },
        "rating": 5,
        "comment": "Phong sach se",
        "created_at": "2026-06-12T00:00:00.000Z",
        "updated_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 9.2 Create review

Status: can implement.

`POST /api/reviews`

Auth: `TENANT`

Request body:

```json
{
  "deposit_id": "uuid",
  "rating": 5,
  "comment": "Phong sach se, chu nha ho tro tot"
}
```

Rules:

- Deposit phai thuoc tenant dang dang nhap.
- Deposit phai `CONFIRMED`.
- Moi `deposit_id` chi co 1 review.
- Sau khi tao review, cap nhat `rooms.average_rating`.

Response `201`:

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "review_id": "uuid",
      "deposit_id": "uuid",
      "room_id": "uuid",
      "tenant_id": "uuid",
      "rating": 5,
      "comment": "Phong sach se, chu nha ho tro tot",
      "created_at": "2026-06-12T00:00:00.000Z",
      "updated_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 9.3 Update review

Status: can implement.

`PATCH /api/reviews/:id`

Auth: `TENANT`

Request body:

```json
{
  "rating": 4,
  "comment": "Cap nhat noi dung danh gia"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {
      "review_id": "uuid",
      "rating": 4,
      "comment": "Cap nhat noi dung danh gia",
      "updated_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

## 10. Favorite Module

### 10.1 List my favorite rooms

Status: can implement.

`GET /api/favorites`

Auth: `TENANT`

Query params: `page`, `limit`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Favorite rooms fetched successfully",
  "data": {
    "items": [
      {
        "room": "<Room>",
        "created_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 10.2 Add favorite

Status: can implement.

`POST /api/favorites`

Auth: `TENANT`

Request body:

```json
{
  "room_id": "uuid"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Room added to favorites",
  "data": {
    "favorite": {
      "tenant_id": "uuid",
      "room_id": "uuid",
      "status": true,
      "created_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 10.3 Remove favorite

Status: can implement.

`DELETE /api/favorites/:roomId`

Auth: `TENANT`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Room removed from favorites",
  "data": null
}
```

## 11. Chat Module

### 11.1 Create/get conversation with host

Status: can implement.

`POST /api/conversations`

Auth: `TENANT`

Request body:

```json
{
  "landlord_id": "uuid",
  "room_id": "uuid"
}
```

`room_id` optional, dung de validate tenant dang chat tu phong nao.

Response `201` hoac `200` neu conversation da ton tai:

```json
{
  "success": true,
  "message": "Conversation ready",
  "data": {
    "conversation": {
      "conversation_id": "uuid",
      "tenant_id": "uuid",
      "landlord_id": "uuid",
      "created_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 11.2 List my conversations

Status: can implement.

`GET /api/conversations`

Auth: `TENANT | HOST`

Query params: `page`, `limit`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Conversations fetched successfully",
  "data": {
    "items": [
      {
        "conversation_id": "uuid",
        "tenant": "<User>",
        "landlord": "<User>",
        "last_message": {
          "message_id": "uuid",
          "content": "Xin chao",
          "sender_id": "uuid",
          "sent_at": "2026-06-12T00:00:00.000Z",
          "status": "SENT"
        },
        "unread_count": 2,
        "created_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 11.3 List messages

Status: can implement.

`GET /api/conversations/:id/messages`

Auth: `TENANT | HOST`

Query params: `page`, `limit`, `before`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": {
    "items": [
      {
        "message_id": "uuid",
        "conversation_id": "uuid",
        "content": "Phong con trong khong a?",
        "sender_id": "uuid",
        "sent_at": "2026-06-12T00:00:00.000Z",
        "status": "SENT",
        "sent_date": "2026-06-12",
        "read_at": null
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 11.4 Send message

Status: can implement.

`POST /api/conversations/:id/messages`

Auth: `TENANT | HOST`

Request body:

```json
{
  "content": "Phong con trong khong a?"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "message_id": "uuid",
      "conversation_id": "uuid",
      "content": "Phong con trong khong a?",
      "sender_id": "uuid",
      "sent_at": "2026-06-12T00:00:00.000Z",
      "status": "SENT",
      "sent_date": "2026-06-12",
      "read_at": null
    }
  }
}
```

### 11.5 Mark conversation messages as read

Status: can implement.

`PATCH /api/conversations/:id/read`

Auth: `TENANT | HOST`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "updated_count": 3
  }
}
```

## 12. Notification Module

### 12.1 List my notifications

Status: can implement.

`GET /api/notifications`

Auth: `TENANT | HOST | ADMIN`

Query params: `page`, `limit`, `status`, `notification_type`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": {
    "items": [
      {
        "notification_id": "uuid",
        "user_id": "uuid",
        "title": "Tin nhan moi",
        "content": "Ban co tin nhan moi",
        "notification_type": "NEW_MESSAGE",
        "status": "UNREAD",
        "created_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

### 12.2 Mark notification as read

Status: can implement.

`PATCH /api/notifications/:id/read`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "notification_id": "uuid",
      "status": "READ"
    }
  }
}
```

### 12.3 Mark all notifications as read

Status: can implement.

`PATCH /api/notifications/read-all`

Auth: `TENANT | HOST | ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updated_count": 10
  }
}
```

## 13. Support Ticket Module

### 13.1 Create support ticket

Status: can implement.

`POST /api/support/tickets`

Auth: `TENANT | HOST | ADMIN`

Request body:

```json
{
  "room_id": "uuid",
  "category": "PAYMENT",
  "title": "Loi thanh toan",
  "detailed_description": "Da bi tru tien nhung booking chua xac nhan",
  "evidence_image_url": "https://..."
}
```

Allowed category: `APP_FAULT`, `ACCOUNT`, `PAYMENT`.

Response `201`:

```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "ticket": {
      "ticket_id": "uuid",
      "user_id": "uuid",
      "room_id": "uuid",
      "category": "PAYMENT",
      "title": "Loi thanh toan",
      "detailed_description": "Da bi tru tien nhung booking chua xac nhan",
      "evidence_image_url": "https://...",
      "status": "OPEN",
      "created_at": "2026-06-12T00:00:00.000Z",
      "updated_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 13.2 List my support tickets

Status: can implement.

`GET /api/support/tickets`

Auth: `TENANT | HOST | ADMIN`

Query params: `page`, `limit`, `status`, `category`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Support tickets fetched successfully",
  "data": {
    "items": ["<SupportTicket>"],
    "pagination": "<Pagination>"
  }
}
```

### 13.3 Get support ticket detail

Status: can implement.

`GET /api/support/tickets/:id`

Auth: owner hoac `ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Support ticket fetched successfully",
  "data": {
    "ticket": "<SupportTicket>"
  }
}
```

### 13.4 Admin list support tickets

Status: can implement.

`GET /api/admin/support/tickets`

Auth: `ADMIN`

Query params: `page`, `limit`, `status`, `category`, `keyword`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Support tickets fetched successfully",
  "data": {
    "items": ["<SupportTicket>"],
    "pagination": "<Pagination>"
  }
}
```

### 13.5 Admin update support ticket status

Status: can implement.

`PATCH /api/admin/support/tickets/:id/status`

Auth: `ADMIN`

Request body:

```json
{
  "status": "IN_PROGRESS",
  "resolution_note": "Dang kiem tra giao dich"
}
```

Allowed status: `OPEN`, `IN_PROGRESS`, `CLOSED`, `RESOLVED`.

Response `200`:

```json
{
  "success": true,
  "message": "Support ticket updated successfully",
  "data": {
    "ticket": "<SupportTicket>"
  }
}
```

## 14. Violation Report Module

### 14.1 Create violation report

Status: can implement.

`POST /api/violation-reports`

Auth: `TENANT`

Request body:

```json
{
  "room_id": "uuid",
  "landlord_id": "uuid",
  "reason": "Thong tin phong khong dung thuc te",
  "evidence_image_url": "https://..."
}
```

`room_id` hoac `landlord_id` phai co it nhat mot gia tri.

Response `201`:

```json
{
  "success": true,
  "message": "Violation report created successfully",
  "data": {
    "report": {
      "report_id": "uuid",
      "room_id": "uuid",
      "landlord_id": "uuid",
      "tenant_id": "uuid",
      "reason": "Thong tin phong khong dung thuc te",
      "resolution_status": "PENDING",
      "evidence_image_url": "https://...",
      "created_at": "2026-06-12T00:00:00.000Z"
    }
  }
}
```

### 14.2 List my violation reports

Status: can implement.

`GET /api/violation-reports`

Auth: `TENANT`

Query params: `page`, `limit`, `resolution_status`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Violation reports fetched successfully",
  "data": {
    "items": ["<ViolationReport>"],
    "pagination": "<Pagination>"
  }
}
```

### 14.3 Admin list violation reports

Status: can implement.

`GET /api/admin/violation-reports`

Auth: `ADMIN`

Query params: `page`, `limit`, `resolution_status`, `keyword`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Violation reports fetched successfully",
  "data": {
    "items": ["<ViolationReport>"],
    "pagination": "<Pagination>"
  }
}
```

### 14.4 Admin update violation report status

Status: can implement.

`PATCH /api/admin/violation-reports/:id/status`

Auth: `ADMIN`

Request body:

```json
{
  "resolution_status": "RESOLVED",
  "resolution_note": "Da xac minh va canh bao chu phong",
  "penalty_type": "WARNING"
}
```

Allowed status: `PENDING`, `PROCESSING`, `RESOLVED`, `DISMISSED`.

Response `200`:

```json
{
  "success": true,
  "message": "Violation report updated successfully",
  "data": {
    "report": "<ViolationReport>"
  }
}
```

## 15. Admin User Management Module

### 15.1 List users

Status: can implement.

`GET /api/admin/users`

Auth: `ADMIN`

Query params: `page`, `limit`, `role`, `status`, `keyword`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "items": ["<User>"],
    "pagination": "<Pagination>"
  }
}
```

### 15.2 Get user detail

Status: can implement.

`GET /api/admin/users/:id`

Auth: `ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": "<User>"
  }
}
```

### 15.3 Lock/ban user

Status: can implement.

`PATCH /api/admin/users/:id/lock`

Auth: `ADMIN`

Request body:

```json
{
  "reason": "Vi pham chinh sach"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "User locked successfully",
  "data": {
    "user": {
      "user_id": "uuid",
      "status": "BANNED"
    }
  }
}
```

### 15.4 Unlock user

Status: can implement.

`PATCH /api/admin/users/:id/unlock`

Auth: `ADMIN`

Request body:

```json
{}
```

Response `200`:

```json
{
  "success": true,
  "message": "User unlocked successfully",
  "data": {
    "user": {
      "user_id": "uuid",
      "status": "ACTIVE"
    }
  }
}
```

### 15.5 Assign role

Status: can implement.

`PATCH /api/admin/users/:id/role`

Auth: `ADMIN`

Request body:

```json
{
  "role": "HOST"
}
```

Allowed role: `TENANT`, `HOST`, `ADMIN`.

Response `200`:

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": "<User>"
  }
}
```

### 15.6 Reset user password

Status: can implement.

`POST /api/admin/users/:id/password-reset`

Auth: `ADMIN`

Request body:

```json
{
  "temporaryPassword": "TempPassword@123"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "User password reset successfully",
  "data": null
}
```

## 16. Admin Dashboard Module

### 16.1 Get dashboard overview

Status: can implement.

`GET /api/admin/dashboard/overview`

Auth: `ADMIN`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "total_users": 120,
    "total_rooms": 80,
    "pending_rooms": 5,
    "active_deposits": 10,
    "successful_transactions": 40,
    "revenue": 120000000,
    "open_support_tickets": 3,
    "pending_violation_reports": 2
  }
}
```

### 16.2 Get system logs

Status: can implement.

`GET /api/admin/system-logs`

Auth: `ADMIN`

Query params: `page`, `limit`, `user_id`, `action`, `from`, `to`

Request body: none

Response `200`:

```json
{
  "success": true,
  "message": "System logs fetched successfully",
  "data": {
    "items": [
      {
        "log_id": "uuid",
        "user_id": "uuid",
        "action": "LOGIN",
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0",
        "created_at": "2026-06-12T00:00:00.000Z"
      }
    ],
    "pagination": "<Pagination>"
  }
}
```

## 17. AI Chatbot/Recommendation Module

### 17.1 Recommend rooms by natural language

Status: can implement.

`POST /api/ai/room-recommendations`

Auth: public optional, neu co token thi ca nhan hoa theo user.

Request body:

```json
{
  "message": "Tim phong gan DH KHTN, gia duoi 4 trieu, o duoc 2 nguoi",
  "filters": {
    "location": "Quan 5",
    "maxPrice": 4000000,
    "maxCapacity": 2
  },
  "conversation_id": "client-session-id"
}
```

Backend phai filter phong bang du lieu that truoc, AI chi giai thich va xep hang, khong tu tao phong khong co trong DB.

Response `200`:

```json
{
  "success": true,
  "message": "Room recommendations generated successfully",
  "data": {
    "reply": "Minh tim thay 3 phong phu hop nhat voi ngan sach va khu vuc cua ban.",
    "rooms": ["<Room>"],
    "suggested_filters": {
      "location": "Quan 5",
      "maxPrice": 4000000,
      "maxCapacity": 2
    }
  }
}
```

## Route mounting can bo sung trong `backend/app.js`

Hien tai `app.js` chi mount auth, public/host rooms va admin room approvals. Khi implement cac module con lai, can mount them:

```js
app.use('/api/profile', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/host/bookings', hostBookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/violation-reports', violationReportRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin/violation-reports', adminViolationReportRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/system-logs', adminSystemLogRoutes);
app.use('/api/ai', aiRoutes);
```

## Tong hop trang thai implement

| Module | API da co | API can implement tiep |
| --- | --- | --- |
| Health | `/health`, `/health/db` | Production hardening |
| Auth | register, login, logout, me | forgot/reset/change password, OTP flow |
| Profile | none rieng biet | profile CRUD, host verification update |
| Public rooms | list, detail | enrich reviews/favorite flags neu can |
| Host rooms | create, list my, update, delete | update status |
| Admin room approval | list pending, approve, reject | reject reason/audit log |
| Booking/deposit | none | all deposit booking APIs |
| Payment/transaction | none | all payment APIs |
| Review | none | all review APIs |
| Favorite | none | all favorite APIs |
| Chat | none | conversations/messages/read APIs |
| Notification | none | list/read APIs |
| Support | none | user/admin ticket APIs |
| Violation report | none | tenant/admin report APIs |
| Admin user | none | user governance APIs |
| Admin dashboard | none | overview/log APIs |
| AI chatbot | none | recommendation API |

## Ghi chu can quyet dinh truoc khi code

- `docs/06-api-spec.md` ghi endpoint-level contracts chua duoc chot; file nay de xuat contract implementable dua tren schema/code hien tai.
- Password minimum trong docs cu co conflict 6 vs 8 ky tu; backend hien tai dang enforce 8 ky tu va complexity.
- OTP validity trong docs co conflict 5 vs 10 phut; neu khong co quyet dinh moi, nen dung 5 phut theo response contract o tren.
- Payment method trong docs co conflict; migration hien tai cho phep `VNPAY`, `MOMO`, `BANK_TRANSFER`.
- `support_tickets` migration chua co cot `resolution_note`; neu muon luu note, can migration bo sung.
- `violation_reports` migration chua co cot `resolution_note`, `penalty_type`; neu muon luu audit xu ly, can migration bo sung hoac ghi vao `system_logs`.
- `room_approvals` migration chua co cot `reason`, `reviewed_by`, `reviewed_at`; can them neu can lich su duyet day du.
