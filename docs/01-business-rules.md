# 01 Business Rules

This file consolidates business rules from the source docs. Conflicts are preserved explicitly.

Traceability:
- `docs/system.md`
- `docs/auth-logic.md`
- `docs/requirements/requirementanalysis/04-tổng-quan-yêu-cầu.md`
- `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md`
- `docs/design/design/05-data-design.md`
- `docs/design/design/06-user-interface-and-user-experience-design.md`

## Access and Roles

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-AUTH-001 | Anyone may browse public home, room list, and room detail pages. | `system.md` section 2; UC06; UC07 |
| BR-AUTH-002 | Booking/deposit and chat actions require login. | `system.md` section 2; UI room detail behavior |
| BR-AUTH-003 | System roles are Guest/Tenant, Host, and Admin. | `system.md`; NFR-2.2 |
| BR-AUTH-004 | Guest/Tenant cannot edit or delete listings. | NFR-2.2 |
| BR-AUTH-005 | Host may create/edit/delete only their own room/listing content and view revenue. | NFR-2.2; Host class spec |
| BR-AUTH-006 | Admin may approve/reject listings, lock/unlock users, view transactions, and process support/complaints. | NFR-2.2; Admin class spec |

## Registration and Login

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-REG-001 | Registration input includes full name, email, phone number, password, confirm password, and role selection between tenant and host. | `auth-logic.md`; UC01 |
| BR-REG-002 | Email and phone number must be unique. | FR-1.1; UC01 |
| BR-REG-003 | Phone number must be valid, for example 10 digits with valid prefix. | FR-1.1 |
| BR-REG-004 | Passwords must be hashed before storage; bcrypt is required in NFR with cost factor >= 10. | `auth-logic.md`; FR-1.1; NFR-2.1 |
| BR-REG-005 | OTP verification is required for registration identity verification. | FR-1.1; UC01 |
| BR-REG-006 | FR-1.1 states OTP is valid for at most 5 minutes; UC01 states OTP expires after 10 minutes. This conflict must be resolved before implementation. | FR-1.1; UC01 |
| BR-REG-007 | OTP entry is rejected after more than 3 wrong attempts or expiration. | FR-1.1 |
| BR-REG-008 | Unverified registration records should be deleted or disabled after 15 minutes. | FR-1.1 |
| BR-REG-009 | Tenant is the default role after successful registration. | FR-1.1 |
| BR-REG-010 | Host upgrade requires legal identity documents: front/back CCCD/CMND, contact information, and optionally ownership/authorization proof. | FR-1.1; FR-2.4 |
| BR-REG-011 | Admin must verify host identity before host can post rooms. | FR-1.1; FR-2.4 |
| BR-LOGIN-001 | Login uses email/phone/username plus password, or SSO through Google/Facebook. | FR-1.2; UC02 |
| BR-LOGIN-002 | Successful login returns user information and JWT token. | `auth-logic.md`; UC02 |
| BR-LOGIN-003 | Token should be stored in localStorage, cookie, or global state. | `auth-logic.md` |
| BR-LOGIN-004 | Successful login redirects to the public home page, previous blocked page, or role dashboard depending on flow. | `auth-logic.md`; UC02 |
| BR-LOGIN-005 | Login failure must use a generic error message to avoid account enumeration. | FR-1.2 |
| BR-LOGIN-006 | Account locks for 10 minutes after more than 5 consecutive failed login attempts; notify account owner by email/SMS. | FR-1.2; UC02; NFR-2.3 |
| BR-LOGIN-007 | Login audit logs include timestamp, IP address, and user-agent for success and failure. | FR-1.2 |

## Password Policy Conflict

| Source | Requirement |
| --- | --- |
| `auth-logic.md` | Password minimum 6 characters; confirm password must match. |
| FR-1.1 / UC01 | Password minimum 8 characters with uppercase, lowercase, number, and special character. |

Implementation must not silently choose one policy. Resolve this conflict before changing auth validation.

## Room Search and Display

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-ROOM-001 | Search supports free text, price range, location, services/amenities, and sort options. | FR-3.1; UC06 |
| BR-ROOM-002 | Search results must use pagination or infinite scroll. | FR-3.2; UC06 |
| BR-ROOM-003 | Result cards show cover image, title, rental price, short address, and room status. | FR-3.2 |
| BR-ROOM-004 | Room detail includes media gallery, text description, rent, required deposit, amenities, exact address/map, chat action, deposit action, ratings, and reviews. | FR-4; UC07; UI spec 5.2.15 |
| BR-ROOM-005 | Only rooms/listings allowed for public display should appear publicly. | UC07; Admin approval rules |
| BR-ROOM-006 | Public room/listing UI must clearly show whether a room/listing is verified/admin approved. | NFR-7.1 |

## Chat

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-CHAT-001 | Realtime chat connects Tenant and Host. | System overview; UC05 |
| BR-CHAT-002 | Message text cannot be empty and must respect allowed length. | UC05 |
| BR-CHAT-003 | Messages are saved to the database and delivered realtime to online recipients. | UC05; Message class spec |
| BR-CHAT-004 | Offline recipients receive push/email notification. | UC05 |
| BR-CHAT-005 | Client may cache unsent messages locally and retry after network recovery. | UC05 |
| BR-CHAT-006 | Attachments over 5MB or invalid format are rejected. | UC05 |
| BR-CHAT-007 | Host direct private contact outside the system is not allowed; phone number should not be displayed directly on listings to reduce spam/fraud. | NFR-7.2 |

## Deposit and Payment

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-PAY-001 | Deposit checkout holds/locks a room temporarily for 15 minutes with countdown. | UI checkout spec; DepositBooking class |
| BR-PAY-002 | Countdown must be synchronized with server to prevent client-side time tampering. | UI checkout spec |
| BR-PAY-003 | If countdown reaches 00:00, cancel deposit session, release room lock, notify user, and return to room detail. | UI checkout spec |
| BR-PAY-004 | Payment options include VNPAY, international card, and domestic ATM/Napas in UI spec. | UI checkout spec |
| BR-PAY-005 | Technical class spec says Transaction.paymentMethod allows only VNPay and BankTransfer; this conflicts with UI payment options and must be resolved. | Transaction class spec; UI checkout spec |
| BR-PAY-006 | Confirm payment creates DepositBooking/Transaction in Pending/Processing state and redirects to sandbox payment gateway. | UI checkout spec; DepositBooking/Transaction class specs |
| BR-PAY-007 | Successful payment sets booking completed/confirmed and room rented, sends confirmation email to Tenant and Host, and navigates to success screen. | UI checkout/success specs |
| BR-PAY-008 | Failed or cancelled payment marks transaction failed/cancelled, releases room lock, shows error, and allows retry. | UI checkout spec |
| BR-PAY-009 | Payment card information must not be stored on the server. | UI checkout constraints |
| BR-PAY-010 | Transaction records shown to Admin are read-only and must not be edited or deleted. | FR-11.2 |

## Reviews and Favorites

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-REV-001 | Tenants who have rented or previously rented may rate/comment on a room. | Project proposal feature table |
| BR-REV-002 | Review is linked uniquely to a successful deposit booking; only customers who rented can review. | Review class spec |
| BR-REV-003 | Creating a review updates RoomPost average rating. | RoomPost and Review class specs |
| BR-FAV-001 | Tenants can add/remove favorite rooms and view favorite rooms. | Tenant class spec; proposal feature table |

## Admin Governance

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-ADM-001 | Admin approves/rejects host listings before public display. | FR-1.1; NFR-2.4; UI admin approval spec |
| BR-ADM-002 | Admin can lock/unlock Host/Guest accounts. | NFR-2.2; Admin class spec |
| BR-ADM-003 | Admin can process violation reports and apply sanctions. | Admin and ViolationReport class specs |
| BR-ADM-004 | Admin can process support requests through Open, In Progress, Resolved, Closed lifecycle. | FR-12.2 |
| BR-ADM-005 | Admin dashboard includes KPIs for pending posts, new users, daily transactions, and complaints. | UI admin dashboard spec |

## Security, Privacy, and Compliance

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-SEC-001 | All credentials, tokens, and sensitive traffic must use HTTPS/TLS 1.2+. | FR-1.2; NFR-2.1 |
| BR-SEC-002 | Sensitive data such as CCCD and payment data, if stored, must use AES-256. | NFR-2.1 |
| BR-SEC-003 | Public host profile may only show public information: host name, avatar, phone number. Sensitive details such as email and transaction history must not be shown to other users. | FR-2.1 |
| BR-SEC-004 | Important actions must be logged: login, logout, create/edit/delete listing, booking, payment, approval, chat. | NFR-2.4; NFR-5.3 |
| BR-SEC-005 | Logs must be retained at least 30 days. | NFR-5.3 |
| BR-SEC-006 | System must comply with basic personal data protection requirements similar to Nghị định 13/2023/NĐ-CP. | Stakeholders; NFR-7.3 |
| BR-SEC-007 | Do not sell or share user data with third parties. | NFR-7.3 |

## AI Rules

| Rule ID | Rule | Source |
| --- | --- | --- |
| BR-AI-001 | AI chatbot must use actual room/location data provided by backend context; LLM is for reasoning, not source-of-truth knowledge retrieval. | FR-10.3 |
| BR-AI-002 | AI recommendations must include room details, direct links to booking/room detail, and clear explanation of recommendation rationale. | FR-10.3; AI chatbot UI spec |
| BR-AI-003 | AI must not recommend based on sensitive factors such as ethnicity, religion, or discriminatory area factors. | NFR-7.4 |

## Cross References

- Requirements list: [02 Requirements](02-requirements.md)
- API expectations and gaps: [06 API Spec](06-api-spec.md)
- Data constraints: [05 Database Schema](05-database-schema.md)
- User flows: [09 User Flows](09-user-flows.md)
