// This file mocks a database connection and an in-memory store.
import { User } from '../../types';
import bcrypt from 'bcryptjs';

// Pre-hash passwords for dummy data
const hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

interface MockDB {
    users: User[];
}

// In-memory database
export const db: MockDB = {
    users: [
        { id: 'user_1', name: 'Frontend Dev', email: 'frontend@dev.com', password: hashPassword('password'), role: 'frontend', status: 'active' },
        { id: 'user_2', name: 'Backend Dev', email: 'backend@dev.com', password: hashPassword('password'), role: 'backend', status: 'active' },
        { id: 'user_3', name: 'Inactive User', email: 'inactive@dev.com', password: hashPassword('password'), role: 'frontend', status: 'inactive' },
    ]
};

// In a real application, you'd have a function like this:
/*
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
*/