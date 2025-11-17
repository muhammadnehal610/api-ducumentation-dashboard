// Fix: Alias express types to avoid conflicts with global types.
import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// NOTE: In a real serverless environment, you might not call db.connect() here,
// but ensure the connection is managed per-invocation or with a connection pool.
// For this mock, we initialize the data once.
import './config/db';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api', (req: ExpressRequest, res: ExpressResponse) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Simple Error Handler
app.use((err: Error, req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Something went wrong!' });
});

// This is the exported handler for serverless environments like Vercel
export default app;