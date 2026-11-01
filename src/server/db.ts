import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Product, User, Order } from '../types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Password security using SHA-256 + cryptographic salt
export function hashPassword(password: string, salt: string = 'lumina_salt_sec'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(password: string, storedHash: string, salt: string = 'lumina_salt_sec'): boolean {
  const computed = hashPassword(password, salt);
  return computed === storedHash;
}

// Initial sample seed data using our high fidelity generated images
const INITIAL_PRODUCTS: Product[] = [
  {
    productId: 'PROD-101',
    productName: 'Aetheris ANC Wireless Studio Headphones',
    productPrice: 349,
    category: 'Audio Hardware',
    quantity: 18,
    description: 'Precision-machined matte aluminum frame with high-fidelity custom planar dynamic drivers, active noise cancellation, and 40-hour lossless playback.',
    image: '/src/assets/images/product_wireless_headphones_1793540301698.jpg',
    rating: 4.9,
    isFeatured: true,
  },
  {
    productId: 'PROD-102',
    productName: 'VaporCraft Frosted Custom Mechanical Keyboard',
    productPrice: 220,
    category: 'Peripherals',
    quantity: 12,
    description: 'Smoked acrylic chassis with gasket mount architecture, hot-swappable tactile switches, and braided custom coiled aviator cable.',
    image: '/src/assets/images/product_mechanical_keyboard_1793540303457.jpg',
    rating: 4.8,
    isFeatured: true,
  },
  {
    productId: 'PROD-103',
    productName: 'Apex Titan Aerospace Smartwatch',
    productPrice: 499,
    category: 'Wearables',
    quantity: 9,
    description: 'Grade 5 titanium unibody housing with sapphire crystal lens, dual-frequency GPS, biometric telemetry suite, and submersible 100m resistance.',
    image: '/src/assets/images/product_smartwatch_titanium_1793540303070.jpg',
    rating: 4.95,
    isFeatured: true,
  },
  {
    productId: 'PROD-104',
    productName: 'HyperShield Minimalist Weatherproof Tech Pack',
    productPrice: 175,
    category: 'Accessories',
    quantity: 25,
    description: 'Ballistic waterproof composite weave with magnetic Fidlock closures, suspended 16-inch laptop chamber, and ergonomic load-distribution straps.',
    image: '/src/assets/images/product_ergonomic_backpack_1793540303567.jpg',
    rating: 4.7,
    isFeatured: true,
  },
  {
    productId: 'PROD-105',
    productName: 'NovaGlow Frosted Ambient Light Bar',
    productPrice: 89,
    category: 'Peripherals',
    quantity: 30,
    description: 'Asymmetric optical desktop lamp with touch capacitive slider, 3000K-6500K adaptive color temperature, and zero-glare screen illumination.',
    image: '/src/assets/images/product_mechanical_keyboard_1793540303457.jpg',
    rating: 4.6,
    isFeatured: false,
  },
  {
    productId: 'PROD-106',
    productName: 'Chronos Obsidian Leather Card Case',
    productPrice: 65,
    category: 'Accessories',
    quantity: 40,
    description: 'Full-grain vegetable-tanned Italian leather with RFID electromagnetic shielding and hand-beveled edges.',
    image: '/src/assets/images/product_smartwatch_titanium_1793540303070.jpg',
    rating: 4.5,
    isFeatured: false,
  }
];

const INITIAL_USERS: User[] = [
  {
    username: 'Raghavendra',
    emailId: 'user@example.com',
    age: 24,
    password: hashPassword('user123'),
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    username: 'Administrator',
    emailId: 'admin@shop.com',
    age: 32,
    password: hashPassword('admin123'),
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
];

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
}

class Store {
  private data: DatabaseSchema = {
    products: [],
    users: [],
    orders: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.resetDefaults();
      }
    } catch (e) {
      console.warn('Database fallback to defaults:', e);
      this.resetDefaults();
    }
  }

  public resetDefaults() {
    this.data = {
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      orders: []
    };
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database store:', err);
    }
  }

  // --- Users Collection Methods (Matching Mongoose/MongoDB semantics) ---
  public findUserByEmail(emailId: string): User | undefined {
    return this.data.users.find(u => u.emailId.trim().toLowerCase() === emailId.trim().toLowerCase());
  }

  public getAllUsers(): Omit<User, 'password'>[] {
    return this.data.users.map(({ password, ...rest }) => rest);
  }

  public insertUser(user: User): User {
    const cleanEmail = user.emailId.trim().toLowerCase();
    const newUser: User = {
      ...user,
      emailId: cleanEmail,
      createdAt: new Date().toISOString(),
      role: user.role || 'user'
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserComplete(emailId: string, updates: Partial<User>): User | null {
    const cleanEmail = emailId.trim().toLowerCase();
    const index = this.data.users.findIndex(u => u.emailId.toLowerCase() === cleanEmail);
    if (index === -1) return null;

    const existing = this.data.users[index];
    const updatedUser: User = {
      ...existing,
      username: updates.username !== undefined ? updates.username : existing.username,
      age: updates.age !== undefined ? Number(updates.age) : existing.age,
      password: updates.password ? hashPassword(updates.password) : existing.password,
    };

    this.data.users[index] = updatedUser;
    this.save();
    return updatedUser;
  }

  public updateUserPartial(emailId: string, fields: Partial<User>): User | null {
    const cleanEmail = emailId.trim().toLowerCase();
    const index = this.data.users.findIndex(u => u.emailId.toLowerCase() === cleanEmail);
    if (index === -1) return null;

    const existing = this.data.users[index];
    if (fields.username !== undefined) existing.username = fields.username;
    if (fields.age !== undefined) existing.age = Number(fields.age);
    if (fields.password) existing.password = hashPassword(fields.password);
    if (fields.role && ['user', 'admin'].includes(fields.role)) existing.role = fields.role;

    this.data.users[index] = existing;
    this.save();
    return existing;
  }

  public deleteUser(emailId: string): boolean {
    const cleanEmail = emailId.trim().toLowerCase();
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.emailId.toLowerCase() !== cleanEmail);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Products Collection Methods ---
  public getAllProducts(): Product[] {
    return this.data.products;
  }

  public findProductById(productId: string): Product | undefined {
    return this.data.products.find(p => p.productId === productId);
  }

  public addProduct(product: Product): Product {
    this.data.products.push(product);
    this.save();
    return product;
  }

  public updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.productId === productId);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(productId: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.productId !== productId);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public decrementStock(items: { productId: string; quantity: number }[]): boolean {
    // Verify all stock first
    for (const item of items) {
      const prod = this.findProductById(item.productId);
      if (!prod || prod.quantity < item.quantity) {
        return false;
      }
    }
    // Deduct
    for (const item of items) {
      const prod = this.findProductById(item.productId);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
      }
    }
    this.save();
    return true;
  }

  // --- Orders Collection Methods ---
  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public getOrders(emailId?: string): Order[] {
    if (emailId) {
      const clean = emailId.trim().toLowerCase();
      return this.data.orders.filter(o => o.emailId.toLowerCase() === clean);
    }
    return this.data.orders;
  }
}

export const db = new Store();
