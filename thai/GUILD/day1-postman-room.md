# Day 1 — Postman quick requests for Rooms (scaffold)

Base URL: `http://localhost:5000`

Sequence to verify route skeletons (Day 1):

1) Login (seed accounts)

- Method: POST
- URL: `/api/auth/login`
- Body JSON:

```json
{
  "identifier": "landlord1",
  "password": "Password@123"
}
```

Copy the `accessToken` from response.

2) Public: list rooms (should return 501 skeleton until implemented)

- Method: GET
- URL: `/api/rooms`

3) Public: get room detail (example room id placeholder)

- Method: GET
- URL: `/api/rooms/<roomId>`

4) Host: create room (uses Bearer access token)

- Method: POST
- URL: `/api/rooms`
- Headers: `Authorization: Bearer <accessToken>`
- Body JSON (example):

```json
{
  "title": "Sample room title",
  "description": "Short description",
  "price": 200000,
  "location": "Hanoi"
}
```

Notes:
- The current Day 1 implementation provides route skeletons that return a 501-style message. Implementations for DB and business logic will follow in Day 2+ tasks.
- Use the seeded credentials from `thai/GUILD/day1-human-read.md`.
