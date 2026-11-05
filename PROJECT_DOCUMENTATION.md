# Northstar Supply

## 1. Project overview

Northstar Supply is a full-stack MERN-style technology marketplace. Visitors can browse and search the catalog without signing in. Authentication is required for cart operations, checkout, profile operations, order history, and administrator functions.

The application includes:

- A React storefront with search, category filtering, sorting, product detail cards, cart, checkout, orders, profile management, and an admin dashboard.
- An Express API for authentication, products, profiles, checkout, orders, and administration.
- MongoDB persistence through Mongoose.
- Cookie-based JWT sessions with database-backed session revocation.
- 500 deterministic catalog products and one local image asset per product.
- A canvas-based scratch-card offer that applies a client-side cart coupon.
- Vercel deployment support through a serverless Express entrypoint.

## 2. Technology stack

### Frontend

- **React 19**: component-based user interface.
- **TypeScript**: type safety for components, API data, and domain models.
- **Vite**: local development server and production bundler.
- **Tailwind CSS 4**: utility styling.
- **Lucide React**: interface icons.
- **Motion**: animation support.
- **HTML Canvas API**: scratch-card interaction.
- **Browser localStorage**: cart persistence between page reloads.

### Backend

- **Node.js** with **Express**: HTTP server and API routes.
- **Mongoose**: MongoDB schemas, validation, queries, and transactions.
- **Zod**: request-body validation and input constraints.
- **bcryptjs**: password hashing and password verification.
- **jsonwebtoken**: signed session tokens.
- **cookie**: secure cookie parsing and serialization.
- **Helmet**: security-related HTTP headers.
- **CORS**: controlled browser-origin access.
- **express-rate-limit**: global and login-specific rate limiting.

### Deployment

- **Vercel**: production hosting.
- `api/index.ts`: exports the Express app as a Vercel function.
- `vercel.json`: routes API requests to the serverless function and non-API requests to the React SPA.
- **MongoDB Atlas**: hosted database.

## 3. Application structure

Important files:

- `server.ts`: Express app, middleware, authentication, API routes, and local/Vercel startup.
- `api/index.ts`: Vercel serverless entrypoint.
- `src/server/db.ts`: Mongoose schemas, seed catalog, user persistence, product operations, and checkout stock updates.
- `src/types/index.ts`: shared `Product`, `User`, `Order`, and cart types.
- `src/App.tsx`: storefront composition, catalog loading, filtering, product detail modal, and view switching.
- `src/context/AuthContext.tsx`: session restoration, login, registration, and logout.
- `src/context/CartContext.tsx`: cart state, totals, coupons, and localStorage persistence.
- `src/components/AdminPanel.tsx`: administrator product, user, and order controls.
- `src/components/CheckoutModal.tsx`: shipping form, checkout request, and receipt.
- `src/components/ZeptoScratchCard.tsx`: scratch interaction and offer application.
- `src/components/ApiTester.tsx`: interactive Exercise-8 endpoint tester.
- `public/products/`: local product image assets.
- `scripts/generate-product-images.mjs`: generates the 500 product SVG assets.

## 4. Where frontend, backend, and database connect

The request path is:

```text
React component
  -> fetch('/api/...')
  -> Express route in server.ts
  -> auth/admin middleware and Zod validation
  -> Store method in src/server/db.ts
  -> Mongoose model
  -> MongoDB Atlas
  -> JSON response
  -> React state update and UI re-render
```

### Exact connection points

| Connection | File and line | What happens |
|---|---|---|
| Vercel frontend to backend | `vercel.json:10-13` | Routes `/api/*` browser requests to the serverless API function. |
| Vercel API entrypoint | `api/index.ts:1-3` | Exports the Express app to Vercel. |
| Express app import | `server.ts:1-14` | Creates the Express application and imports the database store. |
| MongoDB startup connection | `server.ts:135-137` | Connects to MongoDB and runs catalog/admin initialization before API work. |
| MongoDB connection implementation | `src/server/db.ts:125-136` | Calls `mongoose.connect(process.env.MONGODB_URI, ...)`. |
| Frontend app bootstrap | `src/main.tsx:1-10` | Mounts the React application into the `root` element. |
| Frontend API base | `src/App.tsx:64-69` | Fetches the public product catalog from `/api/products`. |

### Frontend to backend connection

The frontend and API use relative URLs such as `/api/login` and `/api/products`. This means the browser sends requests to the same domain where the app is deployed. In development, Vite serves the frontend through `server.ts`; in Vercel, `vercel.json` sends `/api/*` requests to `api/index.ts`, which exports the Express app.

The main frontend request locations are:

| Feature | Frontend file | Request |
|---|---|---|
| Restore session after reload | `src/context/AuthContext.tsx:31` | `GET /api/session` |
| Login | `src/context/AuthContext.tsx:45-65` | `POST /api/login` |
| Register | `src/context/AuthContext.tsx:67-89` | `POST /api/users` |
| Logout | `src/context/AuthContext.tsx:91` | `POST /api/logout` |
| Browse catalog | `src/App.tsx:64-69` | `GET /api/products` |
| Load admin data | `src/components/AdminPanel.tsx:33-59` | Products, users, and orders requests |
| Add/edit products | `src/components/AdminPanel.tsx:100-116` | `POST` or `PUT /api/products` |
| Delete products | `src/components/AdminPanel.tsx:128-137` | `DELETE /api/products/:productId` |
| Reset database | `src/components/AdminPanel.tsx:148-159` | `POST /api/admin/reset-db` |
| Checkout | `src/components/CheckoutModal.tsx:61-75` | `POST /api/checkout` |
| View orders | `src/components/OrdersView.tsx:19-31` | `GET /api/orders` |
| Complete profile | `src/components/ProfileManagement.tsx:51-73` | `PUT /api/users?emailId=...` |
| Partial profile | `src/components/ProfileManagement.tsx:103-125` | `PATCH /api/users?emailId=...` |
| Delete profile | `src/components/ProfileManagement.tsx:140-157` | `DELETE /api/users?emailId=...` |
| Exercise endpoint testing | `src/components/ApiTester.tsx:134-157` | Dynamic request selected in the console |

### Backend route connection

All API route definitions are in `server.ts`:

```text
server.ts:170  POST   /api/users
server.ts:192  POST   /api/login
server.ts:208  POST   /api/logout
server.ts:214  GET    /api/session
server.ts:223  GET    /api/products
server.ts:241  GET    /api/users
server.ts:252  PUT    /api/users
server.ts:268  PATCH  /api/users
server.ts:284  DELETE /api/users
server.ts:294  POST   /api/checkout
server.ts:339  GET    /api/orders
server.ts:343  POST   /api/products
server.ts:358  PUT    /api/products/:productId
server.ts:372  DELETE /api/products/:productId
server.ts:380  GET    /api/admin/users
server.ts:385  POST   /api/admin/reset-db
```

`server.ts` is responsible for:

1. Receiving the HTTP request.
2. Running security middleware such as Helmet, CORS, body-size limits, and rate limits.
3. Connecting to MongoDB through `db.connect()` before API work.
4. Checking JWT sessions through `auth`.
5. Checking administrator role through `adminOnly`.
6. Validating request bodies with Zod.
7. Calling a database method from `db.ts`.
8. Returning a JSON status and response.

### Backend to database connection

The connection is created in `src/server/db.ts`:

```ts
await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 8000,
  maxPoolSize: 5,
});
```

The three Mongoose models are declared near the top of `db.ts`:

- `UserModel` uses the Users collection.
- `ProductModel` uses the Products collection.
- `OrderModel` uses the Orders collection.

`server.ts` initializes the database before API routes continue:

```ts
databaseReady ??= db.connect().then(() => db.ensureSeeded());
await databaseReady;
```

This connection is reused by later requests instead of opening a new connection for every browser request.

## 5. Fetch, create, update, and delete flows

### Product browsing fetch

The catalog request starts in `src/App.tsx`:

```ts
const res = await fetch('/api/products', {
  method: 'GET',
  headers,
});
const data = await res.json();
setProducts(data.products || []);
```

The request reaches `server.ts`, which calls:

```ts
const products = await db.getAllProducts();
```

The database method runs:

```ts
return ProductModel.find().lean();
```

The returned JSON is stored in React state, then search, filtering, sorting, and rendering happen in the browser.

### Admin creates a product

The form in `src/components/AdminPanel.tsx` sends:

```ts
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
});
```

The route in `server.ts` uses `auth` and `adminOnly`, validates the payload with `productInput`, and calls:

```ts
await db.addProduct(product);
```

The database method creates the MongoDB document:

```ts
await ProductModel.create(product);
```

After a successful response, the admin panel calls `fetchData()` again so the product table reflects the new record.

### Admin updates a product or price

The same form switches to `PUT` when an existing product is being edited:

```text
PUT /api/products/:productId
```

The server validates the partial product data and calls:

```ts
ProductModel.findOneAndUpdate(
  { productId },
  { $set: updates },
  { new: true, runValidators: true },
)
```

Changing the price is therefore a normal product update: the frontend sends the new `productPrice`, and Mongoose writes only the supplied fields with `$set`.

### Admin deletes a product

The Delete button sends:

```text
DELETE /api/products/:productId
```

The backend calls:

```ts
ProductModel.deleteOne({ productId });
```

The server returns `404` when no matching product exists and a success message when the document is deleted.

### Profile update and delete

`ProfileManagement.tsx` sends `PUT`, `PATCH`, or `DELETE` requests to `/api/users?emailId=...`.

- `PUT` replaces the editable profile fields.
- `PATCH` changes only selected fields.
- `DELETE` removes the user document.

The backend checks that the requested email belongs to the authenticated user unless the caller is an admin. Password changes are hashed with bcrypt and increment `sessionVersion`.

### Checkout and database update

`CheckoutModal.tsx` sends product IDs and quantities to `POST /api/checkout`. The server retrieves current products from MongoDB, calculates prices from database values, then calls:

```ts
db.createOrderWithStock(order, items);
```

Inside that method:

```ts
ProductModel.findOneAndUpdate(
  { productId: item.productId, quantity: { $gte: item.quantity } },
  { $inc: { quantity: -item.quantity } },
  { new: true, session },
);
```

After every stock update succeeds, the order is inserted using the same MongoDB transaction:

```ts
OrderModel.create([order], { session });
```

If any requested item is out of stock, the transaction fails and the order is not created. This is the main inventory update path.

### Authentication fetches

`AuthContext.tsx` owns authentication requests:

- `GET /api/session`: restores the user from the HttpOnly cookie.
- `POST /api/login`: verifies the bcrypt password and receives a new cookie.
- `POST /api/users`: creates a bcrypt-hashed user and receives a new cookie.
- `POST /api/logout`: revokes the database session version and clears the cookie.

The browser sends cookies with `credentials: 'include'`. The JWT itself is not read by frontend JavaScript.

## 6. API request lifecycle example

For an admin changing a product price:

```text
1. Admin edits price in AdminPanel.tsx.
2. AdminPanel.tsx sends PUT /api/products/PROD-101.
3. Express receives the request in server.ts.
4. auth verifies the HttpOnly JWT and current sessionVersion.
5. adminOnly verifies role === 'admin'.
6. Zod validates productPrice.
7. db.updateProduct() runs ProductModel.findOneAndUpdate().
8. MongoDB Atlas updates the Products document.
9. Express returns the updated product as JSON.
10. AdminPanel.tsx calls fetchData().
11. React renders the updated price in the table.
```

## 7. Frontend behavior

### Public catalog browsing

The catalog is public. The frontend calls:

```text
GET /api/products
```

Visitors can:

- Search by product name, product ID, or description.
- Filter by category.
- Sort by featured status, price, stock, name, or product ID.
- Open a product detail card.
- View the product image, full description, stock, category, price, and add-to-cart action.

Adding to cart requires authentication. The product card and drag-to-cart interaction open the sign-in modal for unauthenticated visitors.

### Product detail card

The grid card is intentionally compact. Clicking a product opens a wider responsive detail card:

- Left side: product image.
- Right side: product ID, category, stock, product name, full description, price, and add-to-cart button.
- On small screens, the two columns stack vertically.

### Cart

Cart state is maintained in `CartContext`.

The cart supports:

- Add product.
- Remove product.
- Increase or decrease quantity.
- Stock-based quantity limits.
- Subtotal calculation.
- Coupon discount calculation.
- Final total calculation.
- localStorage persistence.

The cart stores product snapshots in the browser under the `lumina_cart_storage` key. The server remains authoritative during checkout: it looks up current product prices and stock instead of trusting browser totals.

### Scratch card offer

The scratch card is implemented in `ZeptoScratchCard.tsx` using an HTML canvas.

1. When the offer opens, a reward is selected from a local reward pool.
2. The canvas is sized to its displayed dimensions.
3. A metallic gradient and instructional text are drawn over the hidden reward.
4. Mouse or touch events calculate pointer coordinates relative to the canvas.
5. A circular brush uses `destination-out` compositing to erase the foil.
6. Pointer movement is interpolated between events so fast dragging does not leave gaps.
7. Transparent pixels are sampled on a grid to estimate scratch percentage.
8. At 32% revealed pixels, the card auto-reveals the remaining content.
9. The reward code can be applied to the cart.

Available client-side codes include:

- `LUMINA20`: 20% discount.
- `MERNSTACK`: 15% discount.

The reward pool also contains a `LUMINA50` entry, but the current cart coupon handler does not apply that code. A production discount system should move coupon validation to the server.

## 8. Authentication and sessions

### Registration

`POST /api/users` validates:

- Username: 2–80 characters.
- Email: valid email, maximum 254 characters.
- Age: integer from 1 to 120.
- Password: 8–128 characters.

The password is hashed using bcrypt with cost factor 12 before being stored. The response excludes the password and creates a secure session cookie.

### Login

`POST /api/login` validates the email and password, loads the password field explicitly from MongoDB, and compares the submitted password with bcrypt.

On success:

- A JWT is created with HS256.
- The JWT contains the user email, username, role, and session version.
- The token is stored in the `lumina_session` HttpOnly cookie.
- The cookie is configured with `SameSite=Strict`, `Secure` in production, root path, and a seven-day lifetime.

The browser never stores the JWT in localStorage. The frontend only stores an internal session marker and user display data in React state.

### Session restoration after reload

When the React app starts, `AuthContext` calls:

```text
GET /api/session
```

with `credentials: 'include'`. The browser automatically sends the HttpOnly cookie. The server verifies the JWT and checks the current MongoDB user's `sessionVersion`.

### Session revocation

Logout and password changes increment `sessionVersion` in MongoDB. Existing JWTs then fail the database session-version check even if their cryptographic expiry has not been reached.

## 9. Authorization

There are two authorization levels:

- **Authenticated user**: cart checkout, profile operations, order history, and session operations.
- **Admin user**: product CRUD, all order visibility, user list, and database reset.

The server—not only the frontend—enforces these permissions:

```text
auth -> adminOnly -> administrator route
```

The frontend displays the Admin badge and dashboard navigation only when the authenticated user's database role is `admin`.

## 10. Admin account configuration

Configure these Vercel environment variables:

```env
ADMIN_USERNAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password-at-least-12-characters
```

The administrator signs in using `ADMIN_EMAIL`, not `ADMIN_USERNAME`.

During database initialization:

1. If the configured admin email does not exist, an admin user is created.
2. The password is bcrypt-hashed before insertion.
3. If the account exists, its role is enforced as `admin`.
4. The configured password is compared against the stored hash.
5. A new hash is written only if the configured password changed.
6. Session versions are incremented when the password changes.

## 11. Product catalog and images

The catalog begins with six base products. The application generates 494 additional deterministic products:

- Product IDs range from `PROD-101` through `PROD-600`.
- Names vary by base product, finish, and edition.
- Prices and quantities vary deterministically.
- Descriptions include category-specific details.
- Every product has a separate local SVG asset.

The image generator is run with:

```bash
npm run generate:product-images
```

The generated files are stored under `public/products/` and are served at paths such as:

```text
/products/PROD-101.svg
```

On initialization, `ensureSeeded()` inserts missing catalog records and migrates older broken image paths to the correct local product image paths.

## 12. Product administration

The admin dashboard uses protected endpoints:

```text
POST   /api/products
PUT    /api/products/:productId
DELETE /api/products/:productId
```

The admin can:

- Add a product.
- Edit product name.
- Edit price.
- Edit category.
- Edit quantity.
- Edit description.
- Delete a product.

Product request bodies are validated with Zod. Prices must be finite and non-negative, quantities must be non-negative integers, and text fields have length limits.

## 13. Checkout, payment, and MongoDB updates

### Important payment note

The current application does not connect to Stripe, Razorpay, PayPal, or a banking provider. The payment method is currently a checkout selection, with Cash on Delivery (COD) as the default. It records the selected method in the order document but does not process a real card or online payment.

### Checkout request

The frontend sends:

```text
POST /api/checkout
```

The request includes:

- Product IDs and quantities.
- Full name.
- Street address.
- City.
- Postal code.
- Phone number.
- Selected payment method.

The server validates all fields, then looks up every product in MongoDB. It does not trust browser-supplied product prices or totals.

### Stock-safe order transaction

The server creates an order through `createOrderWithStock()`:

1. A MongoDB session is started.
2. Each requested product is updated with a conditional filter:

```text
productId matches and quantity >= requested quantity
```

3. Stock is decremented with `$inc`.
4. If any product lacks sufficient stock, the transaction aborts.
5. If all stock updates succeed, the order is inserted in the same transaction.
6. The transaction is committed.
7. A receipt is returned to the frontend.

This prevents overselling when multiple checkout requests compete for the same stock.

### Order data

Orders store:

- Order ID.
- User email and username.
- Purchased product snapshots.
- Product prices at checkout time.
- Quantities and subtotals.
- Total amount.
- Shipping address.
- Payment method.
- Status.
- Creation timestamp.

## 14. MongoDB collections

### Users

Stores:

- Username.
- Lowercase unique email.
- Age.
- Bcrypt password hash.
- Role (`user` or `admin`).
- Session version.
- Creation timestamp.

Password fields use `select: false` by default and are explicitly selected only for password comparison.

### Products

Stores:

- Product ID.
- Product name.
- Price.
- Category.
- Quantity.
- Description.
- Image path.
- Rating.
- Featured flag.

### Orders

Stores the order snapshot and delivery/payment information described above.

## 15. API routes

### Public routes

```text
GET /api/health
GET /api/products
POST /api/users
POST /api/login
```

### Authenticated routes

```text
POST   /api/logout
GET    /api/session
GET    /api/users?emailId=...
PUT    /api/users?emailId=...
PATCH  /api/users?emailId=...
DELETE /api/users?emailId=...
POST   /api/checkout
GET    /api/orders
```

### Admin routes

```text
POST   /api/products
PUT    /api/products/:productId
DELETE /api/products/:productId
GET    /api/admin/users
POST   /api/admin/reset-db
```

The API console in the frontend demonstrates the six Exercise-8 routes:

```text
POST   /api/users
POST   /api/login
GET    /api/products
PUT    /api/users
PATCH  /api/users
DELETE /api/users
```

## 16. Security controls

- Zod validation on registration, login, profile, product, and checkout input.
- Mongoose typed queries; no raw SQL.
- No password returned in user responses.
- bcrypt password hashing with cost factor 12.
- HttpOnly session cookie.
- SameSite Strict cookie policy.
- Secure cookie in production.
- HS256 JWT algorithm allow-list.
- JWT expiration.
- Database session-version revocation.
- Helmet security headers.
- CORS restricted to `APP_URL`.
- Global API rate limiting.
- Stricter login rate limiting.
- Express JSON body size limit.
- Admin authorization on server-side routes.
- User profile ownership checks.
- MongoDB transaction for stock decrement and order creation.
- Safe generic production error responses that do not return database credentials or connection strings.

## 17. Environment variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=at-least-32-random-characters
APP_URL=https://your-production-domain.vercel.app
ADMIN_USERNAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=at-least-12-characters
```

Do not commit real values. In Vercel, configure variables for the correct environment, especially **Production**, then redeploy.

For MongoDB Atlas:

1. Create a database user.
2. URL-encode special characters in the database username/password.
3. Add the required Vercel network access rule.
4. Confirm the database name in the connection string.
5. Redeploy after changing variables.

## 18. Local development and validation

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Type-check:

```bash
npm run lint
```

Build production assets:

```bash
npm run build
```

Generate or regenerate product images:

```bash
npm run generate:product-images
```

## 19. Known limitations and future improvements

1. **Real payments**: integrate a provider such as Razorpay or Stripe instead of recording COD/payment selection only.
2. **Server-side coupons**: validate coupon eligibility and discount limits on the server.
3. **Catalog pagination**: load products in pages instead of returning all 500 records at once.
4. **Image upload management**: allow admins to upload product images rather than entering arbitrary image paths.
5. **Order status workflow**: add protected admin actions for Processing, Delivered, and cancellation states.
6. **Cart revalidation**: refresh stale localStorage product snapshots before opening checkout.
7. **Automated tests**: add API integration tests for authentication, admin authorization, checkout transactions, and session revocation.
8. **CSRF strategy**: if cross-site access is ever required, add an explicit CSRF token design; the current same-origin and SameSite setup is intentionally restrictive.
