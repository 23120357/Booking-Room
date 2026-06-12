# 11 Backend Team Assignment

Tai lieu nay phan cong backend cho nhom 5 nguoi, uu tien lam song song, it conflict, chua dung frontend, va co the test bang Postman/Insomnia.

Nguon can bam:

- `docs/10-api-implementation-contracts.md`
- `docs/05-database-schema.md`
- `docs/07-class-specifications.md`
- `backend/app.js`
- `backend/routes/**`
- `backend/controllers/**`
- `backend/services/**`
- `backend/models/**`

## Nguyen tac lam viec chung

- Moi nguoi lam tren branch rieng: `feature/backend-<module-name>`.
- Khong sua frontend trong dot nay.
- Moi API phai tra dung envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Loi:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "field": "error message"
  }
}
```

- Dung `authenticate`, `optionalAuthenticate`, `authorize` co san thay vi viet auth middleware moi.
- Dung `AppError` cho loi nghiep vu.
- Controller chi nhan request/response; service xu ly business logic; model/repository xu ly DB.
- Moi nguoi tu tao Postman requests cho module minh va export collection neu can.

## File dung chung can khoa nhe

Nhung file nay rat de conflict. Chi mot nguoi sua trong cung mot PR, hoac thong bao truoc trong nhom:

| File | Ly do |
| --- | --- |
| `backend/app.js` | Mount routes moi |
| `backend/middlewares/authMiddleware.js` | Auth dung chung |
| `backend/middlewares/roleMiddleware.js` | Role dung chung |
| `backend/middlewares/errorHandler.js` | Error format dung chung |
| `backend/utils/responseHelper.js` | Response format dung chung |
| `backend/db/migrations/**` | Thu tu migration va schema |
| `backend/models/User.js` | Nhieu module dung user |
| `backend/models/Room.js` | Nhieu module dung room |

Neu module can them route vao `app.js`, moi nguoi co the tao route file truoc. Sau do mot nguoi integration owner merge mount routes cuoi cung.

## Phan cong tong quan

| Nguoi | Module so huu | Folder chinh | Muc tieu |
| --- | --- | --- | --- |
| Nguoi 1 | Auth + Profile + Host Verification | `routes/auth`, `routes/*/profile`, `controllers/auth`, `services/auth`, `models/User.js` | Onboarding, login, profile, password |
| Nguoi 2 | Public Rooms + Host Rooms + Room Approval | `routes/guest/roomRoutes.js`, `routes/host/roomRoutes.js`, `routes/admin/roomRoutes.js`, `models/Room.js` | Room lifecycle end-to-end |
| Nguoi 3 | Booking/Deposit + Payment/Transactions | `routes/guest/bookingRoutes.js`, `routes/host/bookingRoutes.js`, new payment routes | Dat coc, xu ly thanh toan |
| Nguoi 4 | Reviews + Favorites + Chat + Notifications | new review/favorite/conversation/notification routes | Engagement va realtime-ready API |
| Nguoi 5 | Admin Users + Support + Violation + Dashboard/Logs | `routes/admin/*`, new support/report routes | Quan tri, moderation, support |

## Nguoi 1: Auth, Profile, Host Verification

### Scope

Da co:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Can implement tiep:

- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`
- `PATCH /api/auth/password`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `POST /api/profile/host-verification`

### File nen tao/sua

| Loai | File |
| --- | --- |
| Routes | `backend/routes/auth/authRoutes.js`, `backend/routes/guest/profileRoutes.js`, `backend/routes/host/profileRoutes.js` |
| Controllers | `backend/controllers/auth/authController.js`, `backend/controllers/guest/profileController.js`, `backend/controllers/host/profileController.js` |
| Services | `backend/services/auth/authService.js`, new `backend/services/profile/profileService.js` |
| Models | `backend/models/User.js`, new `backend/models/OtpVerification.js` neu can |

### Postman tests

#### Register tenant

Request:

`POST /api/auth/register`

```json
{
  "fullName": "Tenant Test",
  "email": "tenant.test@example.com",
  "phoneNumber": "0900000001",
  "username": "tenanttest",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "TENANT"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": {
      "role": "TENANT",
      "email": "tenant.test@example.com"
    },
    "token": "jwt"
  }
}
```

#### Register host

Request:

`POST /api/auth/register`

```json
{
  "fullName": "Host Test",
  "email": "host.test@example.com",
  "phoneNumber": "0900000002",
  "username": "hosttest",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "HOST",
  "idCardFrontUrl": "https://example.com/front.jpg",
  "idCardBackUrl": "https://example.com/back.jpg"
}
```

Expected `201`:

```json
{
  "success": true,
  "data": {
    "user": {
      "role": "HOST",
      "email": "host.test@example.com"
    },
    "token": "jwt"
  }
}
```

#### Login

Request:

`POST /api/auth/login`

```json
{
  "identifier": "tenant.test@example.com",
  "password": "Password@123"
}
```

Expected `200`: co `data.user` va `data.token`.

#### Update profile

Request:

`PATCH /api/profile/me`

Header: `Authorization: Bearer <token>`

```json
{
  "full_name": "Tenant Test Updated",
  "gender": "MALE",
  "date_of_birth": "2000-01-01",
  "address": "Quan 5, TP.HCM",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

Expected `200`:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "full_name": "Tenant Test Updated",
      "gender": "MALE"
    }
  }
}
```

## Nguoi 2: Public Rooms, Host Rooms, Admin Room Approval

### Scope

Da co:

- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms`
- `GET /api/rooms/my`
- `PATCH /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `GET /api/admin/rooms/pending`
- `PATCH /api/admin/rooms/:id/approve`
- `PATCH /api/admin/rooms/:id/reject`

Can implement tiep:

- `PATCH /api/rooms/:id/status`
- Luu reject reason/audit neu them migration
- Dam bao filter/sort/pagination hoat dong on dinh

### File nen tao/sua

| Loai | File |
| --- | --- |
| Routes | `backend/routes/guest/roomRoutes.js`, `backend/routes/host/roomRoutes.js`, `backend/routes/admin/roomRoutes.js` |
| Controllers | `backend/controllers/guest/roomController.js`, `backend/controllers/host/roomController.js`, `backend/controllers/admin/roomController.js` |
| Services | `backend/services/guest/roomService.js`, `backend/services/host/roomService.js`, `backend/services/admin/roomService.js` |
| Models | `backend/models/Room.js` |

### Postman tests

#### List rooms

Request:

`GET /api/rooms?page=1&limit=12&keyword=phong&minPrice=1000000&maxPrice=5000000&sort=price_asc`

Expected `200`:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

#### Create room as host

Request:

`POST /api/rooms`

Header: `Authorization: Bearer <host_token>`

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
  "room_description": "Phong sach se, gan truong",
  "longitude": 106.682,
  "latitude": 10.762,
  "images": [
    "https://example.com/room-1.jpg"
  ]
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Room submitted for approval",
  "data": {
    "room": {
      "title": "Phong tro gan DH KHTN",
      "approval_status": "PENDING"
    }
  }
}
```

#### Approve room

Request:

`PATCH /api/admin/rooms/:id/approve`

Header: `Authorization: Bearer <admin_token>`

```json
{}
```

Expected `200`: `data.room.approval_status = "APPROVED"`.

#### Reject room

Request:

`PATCH /api/admin/rooms/:id/reject`

Header: `Authorization: Bearer <admin_token>`

```json
{
  "reason": "Hinh anh chua ro"
}
```

Expected `200`: `data.room.approval_status = "REJECTED"`.

## Nguoi 3: Booking/Deposit, Payment/Transactions

### Scope

Can implement:

- `POST /api/bookings/deposits`
- `GET /api/bookings/deposits/my`
- `GET /api/bookings/deposits/:id`
- `PATCH /api/bookings/deposits/:id/cancel`
- `GET /api/host/bookings/deposits`
- `PATCH /api/host/bookings/deposits/:id/status`
- `POST /api/payments/transactions`
- `POST /api/payments/webhook`
- `GET /api/payments/transactions/:id`
- `GET /api/admin/transactions`

### File nen tao/sua

| Loai | File |
| --- | --- |
| Routes | `backend/routes/guest/bookingRoutes.js`, `backend/routes/host/bookingRoutes.js`, new `backend/routes/payment/paymentRoutes.js`, new `backend/routes/admin/transactionRoutes.js` |
| Controllers | `backend/controllers/guest/bookingController.js`, `backend/controllers/host/bookingController.js`, new `backend/controllers/payment/paymentController.js`, new `backend/controllers/admin/transactionController.js` |
| Services | `backend/services/guest/bookingService.js`, `backend/services/host/bookingService.js`, new `backend/services/payment/paymentService.js`, new `backend/services/admin/transactionService.js` |
| Models | `backend/models/Booking.js`, new `backend/models/Transaction.js` |

### Postman tests

#### Create deposit booking

Request:

`POST /api/bookings/deposits`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "room_id": "room-uuid",
  "appointment_time": "2026-06-15T09:00:00.000Z"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Deposit booking created successfully",
  "data": {
    "deposit": {
      "deposit_id": "uuid",
      "room_id": "room-uuid",
      "tenant_id": "uuid",
      "landlord_id": "uuid",
      "deposit_amount": 3500000,
      "status": "PROCESSING",
      "expired_at": "created_at + 15 minutes"
    }
  }
}
```

#### Create payment transaction

Request:

`POST /api/payments/transactions`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "deposit_id": "deposit-uuid",
  "payment_method": "VNPAY",
  "return_url": "http://localhost:3000/payment-result"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "transaction_id": "uuid",
      "deposit_id": "deposit-uuid",
      "amount": 3500000,
      "payment_method": "VNPAY",
      "status": "PENDING"
    },
    "payment_url": "https://sandbox-payment-gateway/..."
  }
}
```

#### Payment webhook success

Request:

`POST /api/payments/webhook`

```json
{
  "gateway": "VNPAY",
  "gateway_transaction_id": "VNPAY-123",
  "transaction_id": "transaction-uuid",
  "response_code": "00",
  "amount": 3500000,
  "signature": "signed-payload"
}
```

Expected `200`:

```json
{
  "success": true,
  "data": {
    "transaction": {
      "status": "SUCCESS"
    },
    "deposit": {
      "status": "CONFIRMED"
    }
  }
}
```

## Nguoi 4: Reviews, Favorites, Chat, Notifications

### Scope

Can implement:

- `GET /api/rooms/:roomId/reviews`
- `POST /api/reviews`
- `PATCH /api/reviews/:id`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:roomId`
- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `PATCH /api/conversations/:id/read`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### File nen tao/sua

| Loai | File |
| --- | --- |
| Routes | new `backend/routes/guest/reviewRoutes.js`, new `backend/routes/guest/favoriteRoutes.js`, new `backend/routes/chat/conversationRoutes.js`, new `backend/routes/notification/notificationRoutes.js` |
| Controllers | `backend/controllers/guest/reviewController.js`, new favorite/chat/notification controllers |
| Services | `backend/services/guest/reviewService.js`, new favorite/chat/notification services |
| Models | `backend/models/Review.js`, new `Favorite.js`, `Conversation.js`, `Message.js`, `Notification.js` |

### Postman tests

#### Create review

Request:

`POST /api/reviews`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "deposit_id": "deposit-uuid",
  "rating": 5,
  "comment": "Phong sach se, chu nha ho tro tot"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "review_id": "uuid",
      "deposit_id": "deposit-uuid",
      "rating": 5,
      "comment": "Phong sach se, chu nha ho tro tot"
    }
  }
}
```

#### Add favorite

Request:

`POST /api/favorites`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "room_id": "room-uuid"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Room added to favorites",
  "data": {
    "favorite": {
      "tenant_id": "uuid",
      "room_id": "room-uuid",
      "status": true
    }
  }
}
```

#### Create conversation

Request:

`POST /api/conversations`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "landlord_id": "host-uuid",
  "room_id": "room-uuid"
}
```

Expected `200` or `201`:

```json
{
  "success": true,
  "message": "Conversation ready",
  "data": {
    "conversation": {
      "conversation_id": "uuid",
      "tenant_id": "uuid",
      "landlord_id": "host-uuid"
    }
  }
}
```

#### Send message

Request:

`POST /api/conversations/:id/messages`

Header: `Authorization: Bearer <tenant_or_host_token>`

```json
{
  "content": "Phong con trong khong a?"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "message_id": "uuid",
      "conversation_id": "uuid",
      "content": "Phong con trong khong a?",
      "status": "SENT"
    }
  }
}
```

#### List notifications

Request:

`GET /api/notifications?status=UNREAD`

Header: `Authorization: Bearer <token>`

Expected `200`: `data.items` la danh sach notifications, co pagination.

## Nguoi 5: Admin Users, Support, Violation, Dashboard/Logs

### Scope

Can implement:

- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/lock`
- `PATCH /api/admin/users/:id/unlock`
- `PATCH /api/admin/users/:id/role`
- `POST /api/admin/users/:id/password-reset`
- `POST /api/support/tickets`
- `GET /api/support/tickets`
- `GET /api/support/tickets/:id`
- `GET /api/admin/support/tickets`
- `PATCH /api/admin/support/tickets/:id/status`
- `POST /api/violation-reports`
- `GET /api/violation-reports`
- `GET /api/admin/violation-reports`
- `PATCH /api/admin/violation-reports/:id/status`
- `GET /api/admin/dashboard/overview`
- `GET /api/admin/system-logs`

### File nen tao/sua

| Loai | File |
| --- | --- |
| Routes | `backend/routes/admin/userRoutes.js`, `backend/routes/admin/dashboardRoutes.js`, new support/report/system-log routes |
| Controllers | `backend/controllers/admin/userController.js`, `backend/controllers/admin/dashboardController.js`, new support/report controllers |
| Services | `backend/services/admin/userService.js`, `backend/services/admin/dashboardService.js`, new support/report services |
| Models | new `SupportTicket.js`, `ViolationReport.js`, `SystemLog.js`, maybe extend `User.js` |

### Postman tests

#### Admin list users

Request:

`GET /api/admin/users?page=1&limit=20&role=TENANT&status=ACTIVE`

Header: `Authorization: Bearer <admin_token>`

Expected `200`:

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

#### Lock user

Request:

`PATCH /api/admin/users/:id/lock`

Header: `Authorization: Bearer <admin_token>`

```json
{
  "reason": "Vi pham chinh sach"
}
```

Expected `200`:

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

#### Create support ticket

Request:

`POST /api/support/tickets`

Header: `Authorization: Bearer <token>`

```json
{
  "room_id": "room-uuid",
  "category": "PAYMENT",
  "title": "Loi thanh toan",
  "detailed_description": "Da tru tien nhung booking chua xac nhan",
  "evidence_image_url": "https://example.com/evidence.jpg"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "ticket": {
      "ticket_id": "uuid",
      "category": "PAYMENT",
      "status": "OPEN"
    }
  }
}
```

#### Create violation report

Request:

`POST /api/violation-reports`

Header: `Authorization: Bearer <tenant_token>`

```json
{
  "room_id": "room-uuid",
  "landlord_id": "host-uuid",
  "reason": "Thong tin phong khong dung thuc te",
  "evidence_image_url": "https://example.com/evidence.jpg"
}
```

Expected `201`:

```json
{
  "success": true,
  "message": "Violation report created successfully",
  "data": {
    "report": {
      "report_id": "uuid",
      "resolution_status": "PENDING"
    }
  }
}
```

#### Dashboard overview

Request:

`GET /api/admin/dashboard/overview`

Header: `Authorization: Bearer <admin_token>`

Expected `200`:

```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "total_users": 0,
    "total_rooms": 0,
    "pending_rooms": 0,
    "active_deposits": 0,
    "successful_transactions": 0,
    "revenue": 0,
    "open_support_tickets": 0,
    "pending_violation_reports": 0
  }
}
```

## Thu tu lam de test on dinh

1. Nguoi 1 hoan thien auth/profile truoc vi cac module khac can token.
2. Nguoi 2 hoan thien rooms vi booking, review, favorite can room data.
3. Nguoi 3 lam deposit/payment sau khi co tenant, host, room approved.
4. Nguoi 4 lam review/favorite/chat/notification sau khi co tenant, host, room, deposit.
5. Nguoi 5 co the lam song song admin/support/report, nhung dashboard can data tu cac module khac de test day du.

## Chien luoc Postman

### Environment variables

Tao Postman environment:

| Variable | Gia tri mau |
| --- | --- |
| `baseUrl` | `http://localhost:5000` |
| `tenantToken` | Lay tu login tenant |
| `hostToken` | Lay tu login host |
| `adminToken` | Lay tu seed/admin login |
| `tenantId` | Lay tu register/login |
| `hostId` | Lay tu register/login |
| `roomId` | Lay tu create room |
| `depositId` | Lay tu create deposit |
| `transactionId` | Lay tu create transaction |
| `conversationId` | Lay tu create conversation |

### Flow test tich hop toi thieu

1. Register/login tenant.
2. Register/login host.
3. Host create room.
4. Admin approve room.
5. Public list rooms thay room approved.
6. Tenant create deposit.
7. Tenant create transaction.
8. Payment webhook chuyen transaction success va deposit confirmed.
9. Tenant create review.
10. Tenant favorite room.
11. Tenant create conversation va send message.
12. User create support ticket.
13. Tenant create violation report.
14. Admin xem dashboard/users/transactions/support/reports.

## Definition of Done cho moi module

- Tat ca endpoint trong scope co route/controller/service/model can thiet.
- Co validation request body va query params.
- Co phan quyen dung role.
- Co response envelope dung format.
- Co Postman requests mau test duoc thanh cong va loi co ban.
- Khong sua frontend.
- Khong thay doi response cua module nguoi khac neu chua thong bao.
- Neu them migration, ghi ro ly do va update `docs/10-api-implementation-contracts.md` neu contract thay doi.

## Ranh gioi de tranh conflict

- Nguoi 1 khong sua `Room.js`, tru khi can doc room cho host verification.
- Nguoi 2 khong sua booking/payment/review/favorite.
- Nguoi 3 khong sua room approval logic, chi doc room da approved.
- Nguoi 4 khong sua deposit status, chi validate deposit confirmed de tao review.
- Nguoi 5 khong sua logic nghiep vu cua module khac, chi query tong hop cho dashboard.
- Integration owner se gom mount routes vao `backend/app.js` sau khi tung module co route file rieng.
