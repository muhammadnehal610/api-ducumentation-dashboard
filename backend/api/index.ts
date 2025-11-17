
// FIX: Add a reference to Node.js types to resolve type errors for `require` and `module`.
/// <reference types="node" />
import dotenv from 'dotenv';
dotenv.config();

// FIX: Use a single default import for express and named imports for types to resolve type conflicts.
import express, { Request, Response, ErrorRequestHandler } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import endpointRoutes from './routes/endpoints';
import serviceRoutes from './routes/services';
import moduleRoutes from './routes/modules';
import schemaRoutes from './routes/modelSchemas';
import errorCodeRoutes from './routes/errorCodes';
import changelogRoutes from './routes/changelog';
import overviewCardRoutes from './routes/overviewCards';
import connectDB from './config/db';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// FIX: Use explicit types from the express import.
app.get('/api', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/endpoints', endpointRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/error-codes', errorCodeRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/overview-cards', overviewCardRoutes);


// Simple Error Handler
// FIX: Use explicit types from the express import.
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Something went wrong!' });
};
app.use(errorHandler);


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