import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'railcloud_super_secret_jwt_key_prod_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'railcloud_refresh_secret_key_prod_2026';

app.use(cors());
app.use(express.json());

// In-memory mock DB / cache for standalone service testing
const usersDb = new Map<string, any>([
  ['user@railcloud.internal', {
    id: 'usr-1001-user',
    email: 'user@railcloud.internal',
    passwordHash: bcrypt.hashSync('Pass@1234', 10),
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    role: 'USER'
  }],
  ['admin@railcloud.internal', {
    id: 'usr-9001-admin',
    email: 'admin@railcloud.internal',
    passwordHash: bcrypt.hashSync('Admin@Secure2026', 10),
    fullName: 'Priya Iyer',
    phone: '+91 98111 22334',
    role: 'ADMIN'
  }]
]);

// Health & Metrics
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{service="auth-service",status="200"} 1243
http_requests_total{service="auth-service",status="401"} 18
`);
});

// Authentication Routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, fullName, phone } = req.body;
  if (!email || !password || !fullName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (usersDb.has(email)) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    passwordHash,
    fullName,
    phone,
    role: 'USER'
  };

  usersDb.set(email, newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: newUser.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: 'User registered successfully',
    user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, phone: newUser.phone, role: newUser.role },
    token,
    refreshToken
  });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = usersDb.get(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return res.status(200).json({
    message: 'Login successful',
    user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role },
    token,
    refreshToken
  });
});

app.post('/api/auth/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = Array.from(usersDb.values()).find(u => u.id === payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token missing' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = Array.from(usersDb.values()).find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
      user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role }
    });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[auth-service] Running on port ${PORT}`);
  });
}

export default app;
