// This file acts as a Data Access Layer for our mock database.
// In a real application, this would be a Mongoose or other ORM model.
import { db } from '../config/db';
import { User as UserType, UserRole } from '../../types';

type UserCreationData = Omit<UserType, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };
type UserUpdateData = Partial<Omit<UserType, 'id' | 'password' | 'createdAt' | 'updatedAt'>>;

class User {
    static async findById(id: string): Promise<UserType | undefined> {
        const user = db.users.find(u => u.id === id);
        if (!user) return undefined;
        // Return a copy to prevent mutation of the original object
        return { ...user };
    }

    static async findByEmail(email: string): Promise<UserType | undefined> {
        const user = db.users.find(u => u.email === email);
        if (!user) return undefined;
        return { ...user };
    }

    static async findAll(filters: { role?: UserRole, status?: 'active' | 'inactive' }): Promise<Omit<UserType, 'password'>[]> {
        let filteredUsers = [...db.users];

        if (filters.role) {
            filteredUsers = filteredUsers.filter(u => u.role === filters.role);
        }
        if (filters.status) {
            filteredUsers = filteredUsers.filter(u => u.status === filters.status);
        }

        // Never return passwords
        return filteredUsers.map(({ password, ...user }) => user);
    }
    
    static async create(data: UserCreationData): Promise<UserType> {
         const newUser: UserType = {
             id: `user_${Date.now()}`,
             ...data,
             status: data.status || 'active',
             // createdAt: new Date(), // In a real DB, this would be handled
             // updatedAt: new Date(),
         };
         db.users.push(newUser);
         return { ...newUser };
    }
    
    static async update(id: string, data: UserUpdateData): Promise<Omit<UserType, 'password'> | null> {
        const userIndex = db.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return null;
        }
        
        const updatedUser = { ...db.users[userIndex], ...data };
        db.users[userIndex] = updatedUser;
        
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    
    static async delete(id: string): Promise<boolean> {
        const initialLength = db.users.length;
        db.users = db.users.filter(u => u.id !== id);
        return db.users.length < initialLength;
    }
}

export default User;
