---
name: host-integration-status
description: What of the Host (landlord) UX is wired to the backend vs still on mock data
metadata:
  type: project
---

Host UX (branch `develop`) frontend↔backend integration, done 2026-06-19 (Phase 0–3 of the agreed scope).

**Wired to real API:**
- `frontend/services/hostRoomService.ts` — listMyRooms / getMyRoomById (resolved from the list; no GET-by-id route because a bare `GET /:id` on the host router would collide with the public `GET /api/rooms/:id`, since that router is also mounted at `/api/rooms`) / createRoom / updateRoom / deleteRoom, plus `mapToHostListing` & `mapToDashboardRoom`.
- `frontend/services/hostBookingService.ts` — listDeposits + updateDepositDecision (ACCEPTED/REJECTED), `mapToPendingRequest`.
- Pages: `HostListingsPage`, `HostCreateRoomPage` (added a Giá&Chi phí section + real upload), `HostEditRoomPage`, `HostDashboardPage` (stats + room list + pending approvals).
- One additive backend tweak: `roomRepository.findByLandlord` now returns latest `approval_status` + cost/description fields (host-only function).

**Still on MOCK (deferred — need NEW host-specific backend):**
- Transactions (`HostTransactionsPage`, transaction detail) — backend has no host transaction LIST endpoint, only tenant `/my` and admin all.
- Revenue (`HostRevenuePage` + dashboard RevenueChart) — no aggregation endpoint exists.
- Messages (`HostMessagesPage`) — could reuse shared `/api/conversations` (requireAuth only).

**Gotchas:** host deposit approval only works when deposit.status === 'CONFIRMED' (tenant already paid). Backend createRoom requires ≥3 images + monthly_rent + deposit_amount. room_type is stored as the Vietnamese label string.
