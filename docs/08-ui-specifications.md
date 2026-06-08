# 08 UI Specifications

Traceability:
- `docs/design/design/06-user-interface-and-user-experience-design.md`
- `docs/requirements/requirementanalysis/05-phân-tích-yêu-cầu.md` mockup/prototype section.

## Screen Map

![Screen Diagram](assets/Design-010-5d43bf311e.png)

| Area | Screen | Purpose |
| --- | --- | --- |
| Auth | Public home before login | Entry point for visitors; links to login. |
| Auth | Login | Account login and role-based redirect. |
| Auth | Forgot password | Password recovery from login. |
| Auth | Register | New account registration. |
| Tenant | Tenant home / recommendations | Main tenant screen after login. |
| Tenant | AI Chatbot | Automated room-search assistant. |
| Tenant | Profile | View/edit personal information, password, avatar. |
| Tenant | Room list/search results | Display rooms after search. |
| Tenant | Advanced filter | Filter by price, location, amenities. |
| Tenant | Room detail | Full room details, media, amenities, map, reviews, actions. |
| Tenant | Checkout/payment | Deposit invoice and 15-minute countdown. |
| Tenant | Payment success | Receipt and next actions. |
| Tenant | Booking history | Manage booking states. |
| Host | Host dashboard | Host business overview. |
| Host | Listing management | Host room/listing list. |
| Host | Create/edit listing | Listing form. |
| Host | Revenue statistics | Revenue charts and metrics. |
| Host | Host transaction management | Host transaction history. |
| Admin | Admin dashboard | System overview and navigation. |
| Admin | User management | Account list, filters, lock/unlock/role operations. |
| Admin | Complaints | Violation/support complaint handling. |
| Admin | Listing approval | Review and approve/reject host posts. |
| Admin | Transaction management | System transaction monitoring. |
| Admin | User support | Support request handling. |

## Auth Screens

### Login

Inputs:
- Email/phone/username.
- Password.

Behavior:
- Submit credentials to backend.
- On success, receive user and JWT.
- Redirect by role or previous blocked page.
- Forgot password starts recovery flow.

Source: `auth-logic.md`; UC02; UI screen map.

### Register

Inputs:
- Full name.
- Email.
- Phone.
- Password.
- Confirm password.
- Role selection: Tenant or Host.

Behavior:
- Validate required fields, email format, password, password confirmation.
- Check email/phone uniqueness.
- Send OTP; verify before activating account.

Source: `auth-logic.md`; UC01.

## Public/Tenant Room Search

### Home/Search Entry

UI elements:
- Location filter.
- Price range/filter.
- Room type filter.
- "Tìm ngay" action.
- Featured rooms.
- AI chatbot floating icon.

Behavior:
- Search action gathers location, price, and room type.
- Request search API with pagination/sorting.
- Navigate to room list/search result page.
- Room card opens room detail.
- AI chatbot icon navigates/opens AI chatbot.

Source: UI spec 5.2.13; NFR-3.2.

### Room List / Search Results

UI elements:
- Location filter.
- Price range min/max.
- Room type.
- Amenities: air conditioner, washing machine, refrigerator, balcony, parking, elevator.
- Advanced filters.
- Result summary count and area.
- Room cards with image, address, rating/review count, title, area, amenity tags, monthly price.
- Pagination.

Behavior:
- Restore filters from URL query params on load.
- Filter changes call search API and update URL query params.
- Pagination calls API with same filters and new page/offset.
- Clicking a room card opens room detail.

Source: UI spec 5.2.14; UC06.

### Room Detail

UI elements:
- Title, average rating, review count, short address.
- Image/gallery area and lightbox/gallery modal.
- Host info: avatar, name, joined date; host profile link.
- Description with read more/collapse.
- Amenities list with icon/tag layout and "show all amenities" popup.
- Map with exact address and marker.
- Reviews section.
- Sticky/right action panel with monthly rent, deposit, room status, primary deposit action, secondary chat action, safety commitment.

Behavior:
- Load by roomId from URL.
- Fetch room info, images, amenities, host, reviews, coordinates.
- Deposit action: if not logged in, redirect to login then back; if logged in, go to checkout.
- Chat action opens realtime chat.
- Host avatar/name opens public host profile.

Source: UI spec 5.2.15; UC07.

## Checkout and Payment

### Deposit Checkout

UI elements:
- 15-minute countdown warning.
- Room information and thumbnail.
- Customer information from logged-in profile.
- Booking information: expected check-in date, occupant count, note.
- Payment methods: VNPAY, international card, domestic ATM/Napas.
- Payment summary: deposit, fees, total.
- Confirm payment and cancel deposit buttons.
- Policy/terms links.

Behavior:
- Receive previous deposit session data.
- Start countdown from server time.
- Default payment method: VNPAY.
- Confirm payment creates pending booking/transaction and redirects to sandbox gateway.
- Cancel shows confirmation, releases room lock, returns to room detail.
- Timeout cancels session and releases room lock.
- Callback success marks booking completed, room rented, sends emails, and navigates to success.
- Callback failure/cancel releases lock and allows retry.

Source: UI spec 5.2.16; payment business rules.

### Payment Success

UI elements:
- Success icon and headline "Đặt cọc thành công!".
- Room, address, expected check-in, deposit amount, transaction code.
- Next-step guidance: host contacts within 24h; use chat/support if needed.
- Refund/cancellation policy note.
- Actions: chat host, view transaction history, home.

Behavior:
- Load by `transactionId` or `bookingId`.
- Copy transaction code shows toast for 2 seconds.
- Chat opens realtime chat.
- Transaction history highlights newly created transaction if applicable.

Source: UI spec 5.2.17.

## AI Chatbot

UI elements:
- Header "Trợ lý AI" with robot icon and description.
- Chat bubbles: AI left, user right.
- Rich room recommendation cards with image, badge, price, title, distance, rationale block.
- Suggestion chips / quick replies.
- Input field and send button; requirements also mention microphone/voice input in prototype.

Behavior:
- Show prior conversation if available.
- User message is displayed and sent to backend with context.
- Backend filters room data, calls OpenAI with factual room context, returns text plus recommended rooms.
- Clicking recommendation opens room detail.
- Closing chat optionally saves current conversation session.

Source: UI spec 5.2.18; FR-10.

## Host Screens

Documented host screens include:
- Host overview dashboard with sidebar, verified account indicator, add-room button, nav items.
- Listing management.
- Create/edit listing.
- Revenue statistics.
- Transaction history.
- Chat inbox.

Source: UI spec 5.2.7 and screen map.

## Admin Screens

### Admin Dashboard

UI elements:
- Left sidebar.
- KPI cards: pending posts, new users, daily transactions, new complaints.
- Compact data grids: pending posts, recent transactions, complaints.
- "Create report" button.
- Quick account search.

Behavior:
- Search by email/phone.
- Create report exports overview CSV/PDF.
- Sidebar and "view all" navigate to management screens.

### User Management

UI elements:
- Search by name/email.
- Filters by role/status.
- Stats: total users, host accounts, locked accounts.
- User table and right-side action/search area.
- Export report button.

Behavior:
- Load paginated account list.
- Filter/search refreshes table.
- Avatar click navigates to account detail/identity review.

### Complaints / Violation Handling

UI elements:
- Status cards: Open, In Progress, Resolved, Closed.
- Complaint ticket table.
- Right-side filters, process checklist, activity timeline.

Behavior:
- Load reports, prioritize Open/high-priority items.
- Apply filters.
- Checklist saves internal investigation progress.
- Ticket code opens detail.

### Listing Approval

UI elements:
- Search by title/host.
- Status filter: pending, approved, rejected.
- Stats: total posts, pending, approved, rejected.
- Table with post id/title/host/submission date/status.
- Quick approve/reject icons.

Behavior:
- Load listings, prioritize pending.
- Filter/search reloads table.
- Detail link opens full review screen.

### Transaction Management

UI elements:
- Date range selector.
- Export report button.
- Revenue/cashflow chart.
- Transaction stats.
- Transaction table.

Behavior:
- Load current-month transaction data by default.
- Filter by date/status/payment method.
- Detail opens receipt/detail page for reconciliation.

### User Support

UI elements:
- Search and export.
- Support request table with pagination.
- Stats: pending requests, average resolution speed, satisfaction.

Behavior:
- Load support requests.
- Filter by status/category/search.
- Detail opens support request detail with evidence.

Source: UI spec 5.2.1-5.2.6.

## Cross References

- Business rules: [01 Business Rules](01-business-rules.md)
- User flows: [09 User Flows](09-user-flows.md)
- API expectations: [06 API Spec](06-api-spec.md)
