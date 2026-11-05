import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { parse as parseCookies, serialize as serializeCookie } from 'cookie';
import path from 'path';
import { z } from 'zod';
import { db, bcrypt } from './src/server/db.ts';
import { Order, Product, User } from './src/types/index.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
const getJwtSecret = (): string => {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured and at least 32 characters long.');
  }
  return JWT_SECRET;
};

type AuthUser = Pick<User, 'emailId' | 'username' | 'role' | 'sessionVersion'>;
type AuthRequest = Request & { user?: AuthUser };

const publicUser = (user: User): Omit<User, 'password'> => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const SESSION_COOKIE = 'lumina_session';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 15 * 60,
};

const tokenFor = (user: AuthUser): string => jwt.sign(user, getJwtSecret(), {
  algorithm: 'HS256',
  expiresIn: '15m',
});

const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const cookies = parseCookies(req.headers.cookie || '');
  const cookieToken = cookies[SESSION_COOKIE];
  const header = req.header('authorization');
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookieToken || bearerToken;
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || !payload.emailId || !payload.role || !payload.username || typeof payload.sessionVersion !== 'number') {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }
    const currentUser = await db.findUserByEmail(String(payload.emailId));
    if (!currentUser || currentUser.sessionVersion !== payload.sessionVersion) {
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    req.user = {
      emailId: currentUser.emailId,
      username: currentUser.username,
      role: currentUser.role,
      sessionVersion: currentUser.sessionVersion,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges are required.' });
    return;
  }
  next();
};

const asyncRoute = (handler: (req: AuthRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => handler(req as AuthRequest, res).catch(next);

const userInput = z.object({
  username: z.string().trim().min(2).max(80),
  emailId: z.string().trim().email().max(254),
  age: z.coerce.number().int().min(1).max(120),
  password: z.string().min(8).max(128),
});
const profileInput = z.object({
  username: z.string().trim().min(2).max(80),
  age: z.coerce.number().int().min(1).max(120),
  password: z.string().min(8).max(128).optional(),
});
const patchInput = profileInput.partial().refine(value => Object.keys(value).length > 0, 'At least one field is required.');
const productInput = z.object({
  productId: z.string().trim().min(1).max(40).optional(),
  productName: z.string().trim().min(2).max(160),
  productPrice: z.coerce.number().finite().min(0),
  category: z.string().trim().min(2).max(80),
  quantity: z.coerce.number().int().min(0),
  description: z.string().trim().min(2).max(1000),
  image: z.string().trim().max(500).optional(),
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '32kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'Too many login attempts. Try again later.' } }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'northstar-supply',
    configuration: {
      jwt: Boolean(JWT_SECRET && JWT_SECRET.length >= 32),
      mongo: Boolean(process.env.MONGODB_URI),
    },
  });
});

let databaseReady: Promise<void> | null = null;
app.use('/api', async (_req, res, next) => {
  try {
    getJwtSecret();
    databaseReady ??= db.connect().then(() => db.ensureSeeded());
    await databaseReady;
    next();
  } catch (error) {
    databaseReady = null;
    console.error('Database connection failed:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('JWT_SECRET')) {
      res.status(503).json({ error: 'Server authentication is not configured. Add a JWT_SECRET of at least 32 characters in Vercel.' });
      return;
    }
    res.status(503).json({ error: 'Database is temporarily unavailable. Check the MONGODB_URI environment variable.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lumina-luxe' });
});

app.post('/api/users', asyncRoute(async (req, res) => {
  const parsed = userInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid registration details.', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const data = parsed.data;
  if (await db.findUserByEmail(data.emailId)) {
    res.status(409).json({ error: 'That email address is already registered.' });
    return;
  }
  const user = await db.insertUser({
    ...data,
    emailId: data.emailId.toLowerCase(),
    password: await bcrypt.hash(data.password, 12),
    role: 'user',
  });
  const safeUser = publicUser(user);
  res.append('Set-Cookie', serializeCookie(SESSION_COOKIE, tokenFor(safeUser), cookieOptions));
  res.status(201).json({ message: `Successfully registered! Welcome, ${safeUser.username}.`, user: safeUser });
}));

app.post('/api/login', asyncRoute(async (req, res) => {
  const parsed = z.object({ emailId: z.string().trim().email(), password: z.string().min(1).max(128) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Email ID and password are required.' });
    return;
  }
  const user = await db.findUserByEmail(parsed.data.emailId, true);
  if (!user || !user.password || !(await bcrypt.compare(parsed.data.password, user.password))) {
    res.status(401).json({ error: 'Invalid email ID or password.' });
    return;
  }
  const safeUser = publicUser(user);
  res.append('Set-Cookie', serializeCookie(SESSION_COOKIE, tokenFor(safeUser), cookieOptions));
  res.json({ message: `Login successful. Welcome back, ${safeUser.username}!`, user: safeUser });
}));

app.post('/api/logout', auth, asyncRoute(async (req, res) => {
  await db.revokeUserSessions(req.user!.emailId);
  res.append('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 }));
  res.json({ message: 'Logged out successfully.' });
}));

app.get('/api/session', auth, asyncRoute(async (req, res) => {
  const user = await db.findUserByEmail(req.user!.emailId);
  if (!user) {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
    return;
  }
  res.json({ user: publicUser(user) });
}));

app.get('/api/products', asyncRoute(async (_req, res) => {
  const products = await db.getAllProducts();
  res.json({ total: products.length, products });
}));

app.get('/api/products/preview', (_req, res) => {
  res.redirect('/api/products');
});

const profileEmail = (req: AuthRequest): string => req.user?.emailId || '';
const ensureOwnProfile = (req: AuthRequest, res: Response, emailId: string): boolean => {
  if (req.user?.role !== 'admin' && emailId.trim().toLowerCase() !== profileEmail(req).toLowerCase()) {
    res.status(403).json({ error: 'You may only modify your own profile.' });
    return false;
  }
  return true;
};

app.get('/api/users', auth, asyncRoute(async (req, res) => {
  const emailId = String(req.query.emailId || '');
  if (!emailId || !ensureOwnProfile(req, res, emailId)) return;
  const user = await db.findUserByEmail(emailId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: publicUser(user) });
}));

app.put('/api/users', auth, asyncRoute(async (req, res) => {
  const emailId = String(req.query.emailId || '');
  if (!emailId || !ensureOwnProfile(req, res, emailId)) return;
  const parsed = profileInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Complete profile details are required.', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const user = await db.updateUserComplete(emailId, parsed.data);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ message: 'User profile completely updated successfully.', user: publicUser(user) });
}));

app.patch('/api/users', auth, asyncRoute(async (req, res) => {
  const emailId = String(req.query.emailId || '');
  if (!emailId || !ensureOwnProfile(req, res, emailId)) return;
  const parsed = patchInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'At least one valid profile field is required.', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const user = await db.updateUserPartial(emailId, parsed.data);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ message: 'Selected user profile fields updated successfully.', user: publicUser(user) });
}));

app.delete('/api/users', auth, asyncRoute(async (req, res) => {
  const emailId = String(req.query.emailId || '');
  if (!emailId || !ensureOwnProfile(req, res, emailId)) return;
  if (!(await db.deleteUser(emailId))) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ message: 'User registration record deleted successfully.' });
}));

app.post('/api/checkout', auth, asyncRoute(async (req, res) => {
  const schema = z.object({
    items: z.array(z.object({ productId: z.string().trim().min(1), quantity: z.coerce.number().int().min(1).max(100) })).min(1).max(50),
    shippingAddress: z.object({
      fullName: z.string().trim().min(2).max(120),
      address: z.string().trim().min(5).max(300),
      city: z.string().trim().min(2).max(80),
      postalCode: z.string().trim().min(3).max(20),
      phone: z.string().trim().min(7).max(30),
    }),
    paymentMethod: z.string().trim().min(2).max(50),
  }).safeParse(req.body);
  if (!schema.success) {
    res.status(400).json({ error: 'Invalid checkout details.' });
    return;
  }
  const { items, shippingAddress, paymentMethod } = schema.data;
  const products = await Promise.all(items.map(item => db.findProductById(item.productId)));
  if (products.some(product => !product)) {
    res.status(400).json({ error: 'One or more products were not found.' });
    return;
  }
  const orderItems = items.map((item, index) => {
    const product = products[index] as Product;
    return { productId: product.productId, productName: product.productName, productPrice: product.productPrice, quantity: item.quantity, subtotal: product.productPrice * item.quantity };
  });
  const order: Order = {
    orderId: `ORD-${cryptoRandomId()}`,
    emailId: profileEmail(req),
    username: req.user?.username || '',
    items: orderItems,
    totalAmount: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
    shippingAddress,
    paymentMethod,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };
  const savedOrder = await db.createOrderWithStock(order, items);
  if (!savedOrder) {
    res.status(409).json({ error: 'Stock changed while checking out. Please review your cart and try again.' });
    return;
  }
  res.status(201).json({ message: 'Order placed successfully! Inventory updated.', order: savedOrder });
}));

app.get('/api/orders', auth, asyncRoute(async (req, res) => {
  res.json({ orders: await db.getOrders(req.user?.role === 'admin' ? undefined : profileEmail(req)) });
}));

app.post('/api/products', auth, adminOnly, asyncRoute(async (req, res) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product details.', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const product = await db.addProduct({
    ...parsed.data,
    productId: parsed.data.productId || `PROD-${Date.now()}`,
    rating: 5,
    isFeatured: false,
  });
  res.status(201).json({ message: 'Product added successfully.', product });
}));

app.put('/api/products/:productId', auth, adminOnly, asyncRoute(async (req, res) => {
  const parsed = productInput.omit({ productId: true }).partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product details.' });
    return;
  }
  const product = await db.updateProduct(req.params.productId, parsed.data);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({ message: 'Product updated successfully.', product });
}));

app.delete('/api/products/:productId', auth, adminOnly, asyncRoute(async (req, res) => {
  if (!(await db.deleteProduct(req.params.productId))) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({ message: 'Product deleted successfully.' });
}));

app.get('/api/admin/users', auth, adminOnly, asyncRoute(async (_req, res) => {
  const users = await db.getAllUsers();
  res.json({ total: users.length, users });
}));

app.post('/api/admin/reset-db', auth, adminOnly, asyncRoute(async (_req, res) => {
  await db.resetDefaults();
  res.json({ message: 'Database reset to initial seed records successfully.' });
}));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

function cryptoRandomId(): string {
  return `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}`;
}

export { app };

async function startServer(): Promise<void> {
  await db.connect();
  await db.ensureSeeded();
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html')));
  }
  app.listen(PORT, () => console.log(`Lumina Luxe Server active at http://localhost:${PORT}`));
}

if (!process.env.VERCEL) {
  startServer().catch(error => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
}
