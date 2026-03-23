# Next Desk Backend

Backend foundation for Next Desk, a chat-first AI hospitality platform for motels. This version focuses only on core motel/property management and reservations.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Clean MVC-style structure

## Features Included

- Manager signup and login
- JWT-protected routes
- Single-property ownership model per manager
- Property management
- Room type CRUD
- Room CRUD
- Reservation create/get/list/update/cancel
- Availability check by room type and date range
- Seed script with demo data

## Project Structure

```text
next-desk-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── reservationController.js
│   │   ├── roomController.js
│   │   └── roomTypeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── propertyAccess.js
│   ├── models/
│   │   ├── Property.js
│   │   ├── Reservation.js
│   │   ├── Room.js
│   │   ├── RoomType.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── reservationRoutes.js
│   │   ├── roomRoutes.js
│   │   └── roomTypeRoutes.js
│   ├── seed/
│   │   └── seed.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── generateReservationCode.js
│   │   ├── generateToken.js
│   │   └── validators.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Update `.env` if needed:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/next-desk
JWT_SECRET=replace-this-with-a-secure-secret
JWT_EXPIRES_IN=7d
```

4. Start MongoDB locally.

5. Seed demo data:

```bash
npm run seed
```

6. Start the API:

```bash
npm run dev
```

## Business Rules Implemented

- A manager can only access their own property data.
- Each manager can own one property in this first version.
- Guests book by room type first.
- Exact room assignment is optional.
- Reservation code is auto-generated.
- Basic validation is included for missing fields, invalid IDs, invalid dates, and guest capacity.

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Property

- `POST /api/properties`
- `GET /api/properties/me`
- `PUT /api/properties/me`

### Room Types

- `POST /api/room-types`
- `GET /api/room-types`
- `GET /api/room-types/:id`
- `PUT /api/room-types/:id`
- `DELETE /api/room-types/:id`

### Rooms

- `POST /api/rooms`
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`

### Reservations

- `GET /api/reservations/availability?roomTypeId=ROOM_TYPE_ID&checkInDate=2026-04-10&checkOutDate=2026-04-12`
- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `PUT /api/reservations/:id`
- `PATCH /api/reservations/:id/cancel`

## Authentication Header

Use this header for all protected routes:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Example Payloads

### Manager Signup

```json
{
  "name": "Jane Manager",
  "email": "jane@example.com",
  "password": "password123"
}
```

### Manager Login

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Create Property

```json
{
  "name": "Sunset Motel",
  "address": "45 Route 66, Tulsa, OK 74103",
  "phone": "+1-918-555-0134",
  "email": "frontdesk@sunsetmotel.com",
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "policies": "No smoking. Pets on request."
}
```

### Create Room Type

```json
{
  "name": "Standard Queen",
  "bedType": "1 Queen Bed",
  "capacity": 2,
  "basePrice": 99,
  "amenities": ["WiFi", "TV", "Mini Fridge"]
}
```

### Create Room

```json
{
  "roomTypeId": "ROOM_TYPE_ID",
  "roomNumber": "101",
  "floor": 1,
  "status": "available"
}
```

### Create Reservation

```json
{
  "guestName": "John Guest",
  "guestEmail": "john.guest@example.com",
  "guestPhone": "+1-317-555-0199",
  "roomTypeId": "ROOM_TYPE_ID",
  "roomId": "OPTIONAL_ROOM_ID",
  "checkInDate": "2026-04-10",
  "checkOutDate": "2026-04-12",
  "guestCount": 2,
  "totalAmount": 198,
  "paymentStatus": "pending",
  "reservationStatus": "confirmed"
}
```

### Update Reservation

```json
{
  "guestCount": 3,
  "paymentStatus": "paid",
  "roomId": "OPTIONAL_ROOM_ID"
}
```

## Demo Seed Data

After running `npm run seed`, use:

- Email: `manager@nextdesk.com`
- Password: `password123`

The seed creates:

- 1 property
- 3 room types
- 10 sample rooms
