export type UserRole = 'frontend' | 'backend';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Password will be present in the mock DB, made optional to resolve global type conflicts
    role: UserRole;
    status: 'active' | 'inactive';
}

// Note: Other frontend-specific types from the original file have been removed
// as they are not needed by the backend.