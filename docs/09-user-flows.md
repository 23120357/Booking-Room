# 09 User Flows

Traceability:
- `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md`
- `docs/design/design/06-user-interface-and-user-experience-design.md`

## Registration Flow

1. User selects "Đăng ký".
2. System shows form for full name, email, phone, password, role.
3. User submits.
4. System validates format and uniqueness.
5. System sends OTP by email/SMS.
6. User enters OTP.
7. System verifies OTP, creates account, hashes password, and activates account.

Alternatives:
- Missing fields: show "Vui lòng điền đầy đủ thông tin".
- Existing email/phone: show account already used and suggest login.
- Wrong/expired OTP: require retry or resend.

Cross refs: [01 Business Rules](01-business-rules.md#registration-and-login), [06 API Spec](06-api-spec.md).

## Login Flow

1. User selects "Đăng nhập".
2. User enters email/username/phone and password.
3. System checks credentials in database.
4. On success, system issues JWT and shows success.
5. User is redirected into system/home/dashboard.

Alternatives:
- Wrong credentials: show generic error.
- Forgot password: start password recovery flow.
- Too many failed attempts: lock account for 10 minutes.

## Search Rooms Flow

1. Guest/Tenant opens search/home page.
2. User provides keyword, price range, capacity, administrative area, amenities.
3. User clicks search or applies filters.
4. Client sends search request to backend.
5. Backend queries matching rooms.
6. Backend returns JSON summaries.
7. Client renders paginated room cards.

Alternatives:
- No result: show "Không tìm thấy phòng phù hợp" and offer clear filters.
- Pagination: call API with same filters and new page/offset.

## Room Detail Flow

1. User selects room card.
2. Client extracts room ID from URL.
3. Client requests room detail.
4. Backend returns room core data, images, amenities, host, coordinates, reviews.
5. Client renders gallery, description, pricing, map, reviews, and actions.
6. User may save favorite, chat host, or start deposit.

Alternatives:
- Room not public/existing: show not-found/error per application standard.
- Deposit action when unauthenticated: redirect to login then return.

## Realtime Chat Flow

1. Authenticated Tenant/Host opens chat from room detail or inbox.
2. User writes message and sends.
3. Client validates non-empty/allowed content.
4. Server receives message over active channel.
5. Server identifies sender/recipient and saves message.
6. If recipient is online, server pushes message realtime.
7. Recipient UI displays without reload.
8. Read receipt updates message status.

Alternatives:
- Recipient offline: send push/email notification.
- Network loss: cache locally, show sending/error state, retry after reconnection.
- Attachment too large/invalid: reject immediately.

## Deposit Checkout Flow

1. Authenticated Tenant clicks "Đặt cọc ngay" on room detail.
2. System creates/loads deposit session and locks room for 15 minutes.
3. Checkout displays countdown, room info, customer info, booking info, payment methods, and payment summary.
4. User selects payment method.
5. User confirms payment.
6. Backend creates pending DepositBooking/Transaction.
7. Browser redirects to sandbox payment gateway.
8. Payment callback updates transaction/booking status.

Success:
- Booking becomes completed/confirmed.
- Room becomes rented.
- Confirmation email/receipt sent to Tenant and Host.
- User is routed to payment success screen.

Failure/cancel:
- Transaction marked failed/cancelled.
- Room lock released.
- User can retry.

Timeout:
- Session cancelled automatically.
- Room lock released.
- User returned to room detail with timeout message.

## Payment Success Flow

1. User lands with `transactionId` or `bookingId`.
2. System loads real transaction data.
3. UI shows success message, room info, deposit amount, transaction code, policy note.
4. User can copy transaction code.
5. User can chat host, view transaction history, or return home.

## Host Listing Flow

1. Host account must be verified before posting.
2. Host creates or edits room/listing.
3. Listing is submitted for Admin approval.
4. Listing remains pending until approved.
5. Admin approves/rejects.
6. Approved listing may appear publicly.

Related rules: [01 Business Rules](01-business-rules.md#admin-governance).

## Admin Approval Flow

1. Admin opens listing approval screen.
2. System loads listings, prioritizing pending.
3. Admin searches/filters or opens detail.
4. Admin reviews images, map, price, description, host data.
5. Admin approves or rejects with reason.
6. System updates approval status and public visibility.

## Support Request Flow

1. Tenant/Host creates support request with category, title, details, optional evidence.
2. System stores request with unique id.
3. Admin views support queue.
4. Admin opens details and responds.
5. Admin updates lifecycle: Open, In Progress, Resolved, Closed.
6. System records response/timeline and notifies user.

## Violation Report Flow

1. Tenant submits violation report with room/host target, reason, evidence.
2. Admin views report list.
3. Admin updates processing status.
4. Admin accepts or rejects report.
5. If accepted, Admin applies sanction.
6. System notifies reporter and reported party of result.

## AI Room Recommendation Flow

1. User opens AI chatbot.
2. User enters natural-language request.
3. Client sends message and conversation context to backend.
4. Backend extracts criteria such as budget, location, amenities.
5. Backend queries real room/location/POI data.
6. Backend packages factual context and prompt for OpenAI.
7. AI returns natural-language explanation and recommended rooms.
8. UI displays AI bubble plus room cards and rationale.
9. User clicks a recommended room to open room detail.

Rules:
- AI must use backend-provided factual room data.
- AI must explain why each room is recommended.
- AI must not use sensitive/discriminatory factors.

## Cross References

- UI screens: [08 UI Specifications](08-ui-specifications.md)
- Requirements: [02 Requirements](02-requirements.md)
- API expectations: [06 API Spec](06-api-spec.md)
