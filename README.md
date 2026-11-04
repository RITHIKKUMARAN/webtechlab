# Lumina Luxe Shopping Application

This project implements the Exercise-8 shopping application with React, Express, MongoDB, and Mongoose.

## Setup

1. Install MongoDB locally or create a MongoDB deployment.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters. Every public registration creates a standard user; optional `ADMIN_EMAIL` and `ADMIN_PASSWORD` variables can bootstrap one administrator without exposing credentials in the client.
4. Install dependencies and start the application:

```powershell
npm install
npm run dev
```

For production, build the client and run the same Node server:

```powershell
npm run build
$env:NODE_ENV="production"
npm start
```

Set `PORT` and `APP_URL` to match your hosting provider. The health check is available at `/health`. The server seeds products and, when optional administrator variables are present, the configured administrator account on an empty database. It does not start with a missing database or JWT configuration.

## Required API operations

- `POST /api/users` - register a standard user
- `POST /api/login` - issue a signed, expiring JWT
- `GET /api/products` - retrieve products with a Bearer JWT
- `PUT /api/users?emailId=...` - replace editable profile fields
- `PATCH /api/users?emailId=...` - update selected profile fields
- `DELETE /api/users?emailId=...` - delete the authenticated user's registration

Product management and all-user listing are restricted to the configured administrator. Passwords are bcrypt-hashed, response payloads never include password hashes, profile operations are ownership checked, and request bodies are schema validated.
