import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Initialize mock DB
import './config/db';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Simple Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Something went wrong!' });
});

// Start the server for local development
const PORT = process.env.PORT || 5001;
// This check ensures we only run the server when running the file directly
// and not when it's imported by a serverless function handler.
if (process.env.NODE_ENV !== 'production' || require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}


// This is the exported handler for serverless environments like Vercel
export default app;