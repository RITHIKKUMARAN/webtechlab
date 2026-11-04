import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { Order, Product, User } from '../types/index.ts';

const mongoUri = process.env.MONGODB_URI;

const productSchema = new Schema<Product>({
  productId: { type: String, required: true, unique: true, trim: true },
  productName: { type: String, required: true, trim: true },
  productPrice: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  image: String,
  rating: { type: Number, min: 0, max: 5 },
  isFeatured: Boolean,
}, { versionKey: false });

const userSchema = new Schema<User>({
  username: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  emailId: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  age: { type: Number, required: true, min: 1, max: 120 },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  sessionVersion: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

const orderSchema = new Schema<Order>({
  orderId: { type: String, required: true, unique: true },
  emailId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    productPrice: Number,
    quantity: Number,
    subtotal: Number,
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
  },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Processing', 'Delivered'], default: 'Confirmed' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema);
const ProductModel = mongoose.models.Product || mongoose.model<Product>('Product', productSchema);
const OrderModel = mongoose.models.Order || mongoose.model<Order>('Order', orderSchema);

const INITIAL_PRODUCTS: Product[] = [
  ['PROD-101', 'Aetheris ANC Wireless Studio Headphones', 349, 'Audio Hardware', 18, 'Precision-machined matte aluminum frame with high-fidelity custom planar dynamic drivers, active noise cancellation, and 40-hour lossless playback.', '/src/assets/images/product_wireless_headphones_1793540301698.jpg', 4.9, true],
  ['PROD-102', 'VaporCraft Frosted Custom Mechanical Keyboard', 220, 'Peripherals', 12, 'Smoked acrylic chassis with gasket mount architecture, hot-swappable tactile switches, and braided custom coiled aviator cable.', '/src/assets/images/product_mechanical_keyboard_1793540303457.jpg', 4.8, true],
  ['PROD-103', 'Apex Titan Aerospace Smartwatch', 499, 'Wearables', 9, 'Grade 5 titanium unibody housing with sapphire crystal lens, dual-frequency GPS, biometric telemetry suite, and submersible 100m resistance.', '/src/assets/images/product_smartwatch_titanium_1793540303070.jpg', 4.95, true],
  ['PROD-104', 'HyperShield Minimalist Weatherproof Tech Pack', 175, 'Accessories', 25, 'Ballistic waterproof composite weave with magnetic Fidlock closures, suspended 16-inch laptop chamber, and ergonomic load-distribution straps.', '/src/assets/images/product_ergonomic_backpack_1793540303567.jpg', 4.7, true],
  ['PROD-105', 'NovaGlow Frosted Ambient Light Bar', 89, 'Peripherals', 30, 'Asymmetric optical desktop lamp with touch capacitive slider, 3000K-6500K adaptive color temperature, and zero-glare screen illumination.', '/src/assets/images/product_mechanical_keyboard_1793540303457.jpg', 4.6, false],
  ['PROD-106', 'Chronos Obsidian Leather Card Case', 65, 'Accessories', 40, 'Full-grain vegetable-tanned Italian leather with RFID electromagnetic shielding and hand-beveled edges.', '/src/assets/images/product_smartwatch_titanium_1793540303070.jpg', 4.5, false],
].map(([productId, productName, productPrice, category, quantity, description, image, rating, isFeatured]) => ({
  productId: productId as string,
  productName: productName as string,
  productPrice: productPrice as number,
  category: category as string,
  quantity: quantity as number,
  description: description as string,
  image: image as string,
  rating: rating as number,
  isFeatured: isFeatured as boolean,
}));

function withoutPassword(user: User): Omit<User, 'password'> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

class Store {
  async connect(): Promise<void> {
    if (!mongoUri) {
      throw new Error('MONGODB_URI is required. Configure it in .env before starting the server.');
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
    });
  }

  async resetDefaults(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    await Promise.all([ProductModel.deleteMany({}), UserModel.deleteMany({}), OrderModel.deleteMany({})]);
    await ProductModel.insertMany(INITIAL_PRODUCTS);
    if (adminEmail && adminPassword && adminPassword.length >= 12) {
      await UserModel.create({
        username: 'Administrator',
        emailId: adminEmail,
        age: 32,
        password: await bcrypt.hash(adminPassword, 12),
        role: 'admin',
      });
    }
  }

  async ensureSeeded(): Promise<void> {
    if (await ProductModel.exists({})) return;
    await this.resetDefaults();
  }

  async findUserByEmail(emailId: string, includePassword = false): Promise<User | undefined> {
    const query = UserModel.findOne({ emailId: emailId.trim().toLowerCase() });
    if (includePassword) query.select('+password');
    return (await query.lean()) ?? undefined;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await UserModel.find().lean();
    return users.map(withoutPassword);
  }

  async insertUser(user: User): Promise<User> {
    return (await UserModel.create(user)).toObject();
  }

  async updateUserComplete(emailId: string, updates: { username: string; age: number; password?: string }): Promise<User | null> {
    const update: Record<string, unknown> = { username: updates.username, age: updates.age };
    if (updates.password) {
      update.password = await bcrypt.hash(updates.password, 12);
    }
    const updated = await UserModel.findOneAndUpdate(
      { emailId: emailId.trim().toLowerCase() },
      { $set: update, ...(updates.password ? { $inc: { sessionVersion: 1 } } : {}) },
      { new: true, runValidators: true },
    ).lean();
    return updated ? withoutPassword(updated) as User : null;
  }

  async updateUserPartial(emailId: string, fields: { username?: string; age?: number; password?: string }): Promise<User | null> {
    const update: Record<string, unknown> = {};
    if (fields.username !== undefined) update.username = fields.username;
    if (fields.age !== undefined) update.age = fields.age;
    if (fields.password) update.password = await bcrypt.hash(fields.password, 12);
    const updated = await UserModel.findOneAndUpdate(
      { emailId: emailId.trim().toLowerCase() },
      { $set: update, ...(fields.password ? { $inc: { sessionVersion: 1 } } : {}) },
      { new: true, runValidators: true },
    ).lean();
    return updated ? withoutPassword(updated) as User : null;
  }

  async revokeUserSessions(emailId: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { emailId: emailId.trim().toLowerCase() },
      { $inc: { sessionVersion: 1 } },
    );
    return result.modifiedCount === 1;
  }

  async deleteUser(emailId: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ emailId: emailId.trim().toLowerCase() });
    return result.deletedCount === 1;
  }

  async getAllProducts(): Promise<Product[]> {
    return ProductModel.find().lean();
  }

  async findProductById(productId: string): Promise<Product | undefined> {
    return (await ProductModel.findOne({ productId }).lean()) ?? undefined;
  }

  async addProduct(product: Product): Promise<Product> {
    return (await ProductModel.create(product)).toObject();
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    return ProductModel.findOneAndUpdate({ productId }, { $set: updates }, { new: true, runValidators: true }).lean();
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ productId });
    return result.deletedCount === 1;
  }

  async createOrder(order: Order): Promise<Order> {
    return (await OrderModel.create(order)).toObject();
  }

  async getOrders(emailId?: string): Promise<Order[]> {
    return OrderModel.find(emailId ? { emailId: emailId.toLowerCase() } : {}).sort({ createdAt: -1 }).lean();
  }

  async createOrderWithStock(order: Order, items: { productId: string; quantity: number }[]): Promise<Order | null> {
    const session = await mongoose.startSession();
    try {
      let savedOrder: Order | null = null;
      await session.withTransaction(async () => {
        for (const item of items) {
          const updated = await ProductModel.findOneAndUpdate(
            { productId: item.productId, quantity: { $gte: item.quantity } },
            { $inc: { quantity: -item.quantity } },
            { new: true, session },
          ).lean();
          if (!updated) throw new Error('INSUFFICIENT_STOCK');
        }
        const [created] = await OrderModel.create([order], { session });
        savedOrder = created.toObject();
      });
      return savedOrder;
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') return null;
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

export const db = new Store();
export { bcrypt };
