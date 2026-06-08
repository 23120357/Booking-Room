# 02 Requirements

Traceability:
- `docs/requirements/requirementanalysis/04-tổng-quan-yêu-cầu.md`
- `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md`
- `docs/requirements/projectproposal.md`
- `docs/auth-logic.md`

## Functional Requirements Summary

| ID | Requirement Area | Summary | Related Business Rules |
| --- | --- | --- | --- |
| FR-1 | Account registration/login | Register via phone/email or Google/Facebook; login by email/phone/username/password or SSO; issue JWT on success. | [BR-REG/LOGIN](01-business-rules.md#registration-and-login) |
| FR-2 | User profile | View/update profile; protect sensitive public/private profile information; change password; verify host identity. | [BR-SEC](01-business-rules.md#security-privacy-and-compliance) |
| FR-3 | Search rooms | Multi-dimensional search by keyword, price, location, amenities, and sorting. Results paginated/infinite. | [BR-ROOM](01-business-rules.md#room-search-and-display) |
| FR-4 | Room detail | Show full room media/details/price/deposit/amenities/map/reviews/action buttons. | [BR-ROOM](01-business-rules.md#room-search-and-display) |
| FR-5 | Realtime chat | Tenant and Host communicate through realtime chat. Messages are stored and pushed realtime. | [BR-CHAT](01-business-rules.md#chat) |
| FR-6 | Room/deposit booking | Tenant can initiate deposit/booking from room detail. | [BR-PAY](01-business-rules.md#deposit-and-payment) |
| FR-7 | Host room management | Host creates/edits room/listing information; host can process deposit requests. | [07 Class Specifications](07-class-specifications.md#host) |
| FR-8 | Admin listing/account governance | Admin approves/rejects listings and manages accounts. | [BR-ADM](01-business-rules.md#admin-governance) |
| FR-9 | Reviews/favorites | Tenant can review eligible rooms, favorite/unfavorite rooms, and view saved rooms. | [BR-REV/FAV](01-business-rules.md#reviews-and-favorites) |
| FR-10 | AI chatbot | Natural-language room search using backend-filtered factual room/location data and OpenAI reasoning. | [BR-AI](01-business-rules.md#ai-rules) |
| FR-11 | Transaction management | Admin monitors transaction history; transaction data is immutable/read-only to Admin. | [BR-PAY](01-business-rules.md#deposit-and-payment) |
| FR-12 | Support request management | Users submit support; Admin categorizes/responds and changes lifecycle state. | [BR-ADM](01-business-rules.md#admin-governance) |

## Use Case Catalog

Source: `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md`.

| UC | Name | Actors | Result |
| --- | --- | --- | --- |
| UC01 | Đăng ký tài khoản | Tenant/Guest, Host | Account created; password hashed; stored in PostgreSQL. |
| UC02 | Đăng nhập | Tenant/Guest, Host, Admin | JWT access granted and user redirected to relevant dashboard/area. |
| UC03 | Quản lý hồ sơ cá nhân | Tenant/Guest, Host | Profile information updated. |
| UC04 | Đổi mật khẩu / Quên mật khẩu | Tenant, Host | New password set and encrypted/hashed safely. |
| UC05 | Nhắn tin thời gian thực | Tenant, Host | Message persisted and delivered realtime/offline notification sent. |
| UC06 | Tìm kiếm và lọc phòng trọ | Guest/Tenant | Paginated matching room list. |
| UC07 | Xem chi tiết phòng trọ | Guest/Tenant | Full room detail with map/media/action buttons. |
| UC08-UC23 | Additional booking, host, admin, support, transaction, AI flows | See source use-case tables | Preserve source behavior; reorganized summaries appear in [09 User Flows](09-user-flows.md). |

Note: The source contains detailed tables for UC01-UC23. When implementing a specific use case, consult `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md` for exact main/alternative scenarios.

## Non-Functional Requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1.1 | Response time | Search suggestions < 500ms for 95% requests; advanced search and room detail < 2s for 95%; realtime messages < 500ms; auth < 2s; deposit/payment < 6s; AI response < 5s. |
| NFR-1.2 | Page load | Home and search result pages complete in <= 2.5s on network >= 20 Mbps; room images compressed as WebP or JPEG quality 80%. |
| NFR-1.3 | Concurrency | Minimum 200 concurrent sessions without crash or severe delay, CPU average <= 80%. |
| NFR-1.4 | Availability | >= 99% monthly uptime; 24/7 for tenants/hosts except maintenance max 1 hour/week; chat and AI stable 24/7. |
| NFR-2.1 | Security | Passwords bcrypt cost >= 10; HTTPS/TLS 1.2+; AES-256 for sensitive CCCD/payment data; room images private on S3. |
| NFR-2.2 | Authorization | JWT role-based access for Guest/Tenant, Host, Admin. |
| NFR-2.3 | Login safety | Lock account 10 minutes after 5 failed login attempts; JWT expires after 7 days or shorter setting. |
| NFR-2.4 | Content protection/logging | Admin approval before public listing; important actions logged. |
| NFR-3.1 | Usability | 9/10 new tenants complete "search -> detail -> message host" in < 5 min; 8/10 new hosts can post in < 10 min; new Admin can approve/lock in < 2 min. |
| NFR-3.2 | Interaction | AI chatbot appears as visible floating icon; realtime chat shows unread badge and can notify by email. |
| NFR-4 | Maintainability | Clear frontend/backend/db modularity; Git workflow main/dev/feature branches; PR requires at least one reviewer. |
| NFR-4.4 | Scale | Handle up to 1000 rooms and 100 active users on limited/free-tier resources while maintaining basic performance. |
| NFR-5 | Reliability | Network loss shows retry message; failed deposit payment keeps booking data for 10 minutes; DB backup every 24h; logs retained at least 30 days. |
| NFR-6 | Integration | OpenAI, maps, sandbox payment, image storage; RESTful JSON API with standard HTTP codes. |
| NFR-7 | Compliance/Ethics | Transparent verified status and cancellation policy; fraud prevention; personal data protection; AI avoids sensitive/discriminatory factors. |

## Conflicts and Gaps

| Type | Detail | Required Action |
| --- | --- | --- |
| Conflict | Password minimum is 6 in `auth-logic.md` but 8 plus complexity in requirement analysis. | Product decision before auth implementation. |
| Conflict | OTP validity is 5 minutes in FR-1.1 but 10 minutes in UC01. | Product decision before OTP implementation. |
| Conflict | Payment methods differ: UI lists VNPAY, international cards, ATM/Napas; Transaction class says only VNPay and BankTransfer. | Product decision before payment implementation. |
| Gap | Endpoint-level API contracts are not fully specified. | See [06 API Spec](06-api-spec.md); define contracts before backend/frontend integration. |
| Gap | ERD is primarily an image plus table specs; textual relationship cardinalities are partially inferred from FK constraints. | See [03 ERD](03-erd.md). |

## Cross References

- Business rules: [01 Business Rules](01-business-rules.md)
- Database schema: [05 Database Schema](05-database-schema.md)
- API expectations: [06 API Spec](06-api-spec.md)
- User flows: [09 User Flows](09-user-flows.md)
