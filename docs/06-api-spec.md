# 06 API Spec

The source docs specify RESTful JSON APIs conceptually but do not provide complete endpoint-level contracts. This file captures only documented API expectations and marks gaps explicitly.

Traceability:
- `docs/system.md` tech stack and route conventions.
- `docs/auth-logic.md`.
- `docs/requirements/requirementanalysis/04-tổng-quan-yêu-cầu.md` NFR-6.2.
- `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md` use cases.
- `docs/design/design/04-architectural-design.md`.

## API Architecture Rules

| Rule | Source |
| --- | --- |
| Backend provides RESTful API. | NFR-6.2; project proposal architecture. |
| Requests/responses use JSON. | NFR-6.2 |
| Standard HTTP status codes: 200, 400, 401, 403, 404, 500. | NFR-6.2 |
| Routes only map endpoints to controllers; business logic belongs in services. | Architecture design |
| JWT middleware handles authentication and authorization before controllers. | Architecture design |
| Repository layer isolates SQL/Knex from business logic. | Architecture design |

## Documented API Interactions

These are documented behaviors, not finalized endpoint paths.

| Area | Method/Action | Required Data | Expected Result | Source |
| --- | --- | --- | --- | --- |
| Auth | Register | Full name, email, phone, password, confirm password, role | Validate, check uniqueness, send OTP, hash password, create account after OTP. | `auth-logic.md`; FR-1.1; UC01 |
| Auth | Login | Email/phone/username and password | Validate credentials, return user + JWT, redirect by flow/role. | `auth-logic.md`; FR-1.2; UC02 |
| Auth | Forgot/change password | Email or current password, OTP, new password | Verify identity and update hashed password. | UC04; FR-2.3 |
| Profile | View/update profile | User profile fields | Display/update personal data with extra verification for email/phone changes. | FR-2 |
| Host verification | Submit host documents | CCCD front/back and optional proof | Mark pending, Admin reviews before host posting. | FR-2.4 |
| Room search | Search/filter rooms | Keyword, price range, location, capacity, amenities, page/offset, sort | Return paginated JSON room summaries. | FR-3; UC06 |
| Room detail | Get room detail | Room ID | Return room core info, images, amenities, host, coordinates, reviews. | FR-4; UC07 |
| Chat | Send message | Conversation, sender, recipient, message content | Persist message, push via realtime channel, notify offline recipient. | UC05 |
| Deposit booking | Start checkout | Room ID, tenant, appointment/check-in data, amount | Create or prepare deposit session; lock room for 15 minutes. | UI checkout; DepositBooking class |
| Payment | Create transaction | Deposit booking ID, payment method | Create pending transaction and payment gateway redirect/link. | UI checkout; Transaction class |
| Payment callback | Process gateway callback | Gateway transaction ID/response code | Update transaction and booking status; send email; redirect success/failure. | Transaction class; UI checkout |
| Reviews | Create/edit review | Rating, content, deposit booking ID | Save review and update room average rating. | Review class |
| Favorites | Add/remove favorite | Tenant ID, room ID | Update favorite status. | Tenant class; data schema |
| Admin listings | Approve/reject listing | Room/listing ID, decision, reason if rejected | Update approval status. | Admin class; UI admin approval |
| Admin users | Lock/unlock/assign role/reset password | User ID and operation data | Update account/role/security state. | Admin class |
| Admin transactions | Query transaction history | Filters by ID/date/status/account | Return read-only transaction data. | FR-11 |
| Support | Create/list/update support request | Category, title, details, evidence, status | Support lifecycle handling. | FR-12; SupportRequest class |
| Violation reports | Create/process report | Room/host/tenant, reason, evidence, status/resolution | Admin handles report and sanctions. | ViolationReport class |
| AI chatbot | Recommend rooms | Natural language prompt + backend filtered factual room/POI data | Return explanation and room recommendation cards/links. | FR-10; AI UI spec |

## HTTP Status Expectations

| Code | Meaning |
| --- | --- |
| 200 | OK/success. |
| 400 | Bad request/validation error. |
| 401 | Unauthorized/not logged in or invalid token. |
| 403 | Forbidden/role lacks permission. |
| 404 | Resource not found. |
| 500 | Internal server error. |

## Unspecified Details

Do not invent these without product/technical decision:

- Exact endpoint paths.
- Request/response DTO names and shapes.
- Error response envelope.
- Pagination parameter names.
- JWT storage strategy: localStorage vs cookie vs global store.
- OTP transport: SMS, email, or both.
- Payment gateway callback URL and signing rules.
- AI response JSON schema.

## Cross References

- Business rules: [01 Business Rules](01-business-rules.md)
- Requirements: [02 Requirements](02-requirements.md)
- Architecture: [04 Architecture](04-architecture.md)
- Class specs: [07 Class Specifications](07-class-specifications.md)
