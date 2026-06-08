# 00 Project Overview

## Purpose

Booking-Room is a web system for digitizing room search and room booking. It connects tenants/guests with hosts and uses Admin as a trusted third party for post approval, transaction monitoring, and dispute/support handling.

Traceability:
- `docs/system.md` sections 1-2.
- `docs/requirements/projectproposal.md` section "Phát biểu sơ lược dự án".
- `docs/requirements/requirementanalysis/04-tổng-quan-yêu-cầu.md` section "Stakeholders".

## Core Problems

- Tenants spend too much time filtering room information and worry about fake listings or deposit fraud.
- Hosts manage room information manually and need tools for listing, booking/deposit requests, and revenue tracking.
- The system needs transparent communication and transaction control through Admin.

## Core Solution

- Public room browsing and search.
- Authenticated tenant actions: chat, deposit booking, favorites, reviews, transaction history, support requests.
- Host listing management, deposit request handling, chat, transaction visibility, and revenue statistics.
- Admin approval/rejection of listings, account management, transaction monitoring, complaints, and support.
- AI chatbot support for room recommendations using actual room/location data, not hallucinated knowledge.

## Actors

| Actor | Description | Main Capabilities |
| --- | --- | --- |
| Guest / Tenant | Public visitor or logged-in room seeker. | Browse/search rooms publicly; after login can chat, deposit, review, favorite rooms, view transaction history. |
| Host | Room owner/provider. | Create/update rooms and listings, handle deposit requests, chat, view revenue/statistics. |
| Admin | System operator/trusted third party. | Approve/reject listings, lock/unlock users, verify hosts, monitor transactions, handle support/complaints. |
| External Providers | Third-party service providers. | Maps, payment gateway, email/SMS, AI, cloud hosting/storage. |

## Technology Stack

| Layer | Documented Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, App Router/route groups. |
| Backend | Node.js, Express.js. |
| Database | PostgreSQL, Knex.js migrations/query builder, Neon mentioned as cloud DB. |
| Auth | JWT; passwords hashed before storage. |
| Realtime | Socket.io / WebSocket secure channel. |
| Payment | VNPAY or Stripe sandbox; proposal also mentions ZaloPay sandbox in cost section. |
| Storage | AWS S3 or Cloudinary for room/static images. |
| Maps | Google Maps API or MapTiler/Mapbox alternatives in requirements. |
| AI | OpenAI API, GPT-3.5 or GPT-4 mini mentioned in NFR. |
| Email | Nodemailer. |

## Frontend Route Areas

Source: `docs/system.md` section 4.

| Area | Purpose |
| --- | --- |
| `app/auth/` | Public authentication pages. |
| `app/guest/` | Public room browsing pages: home, rooms, room detail. |
| `app/client/` | Logged-in tenant pages such as bookings and profile. |
| `app/host/` | Host management area. |
| `app/admin/` | Admin management area. |

## Cross References

- Business and security rules: [01 Business Rules](01-business-rules.md)
- Functional/non-functional requirements: [02 Requirements](02-requirements.md)
- Architecture: [04 Architecture](04-architecture.md)
- UI screens and behavior: [08 UI Specifications](08-ui-specifications.md)
- User journeys: [09 User Flows](09-user-flows.md)
