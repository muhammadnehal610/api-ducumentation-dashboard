export type UserRole = 'frontend' | 'backend';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status: 'active' | 'inactive';
}

export type Page = 'Overview' | 'Modules' | 'Endpoints' | 'Endpoint Details' | 'Endpoint Form' | 'API Playground' | 'Schemas' | 'Models' | 'SchemaDetails' | 'Authentication' | 'Flows' | 'Error Codes' | 'Changelog' | 'Settings' | 'User Management';
export type AuthPage = 'login' | 'register';

export interface Breadcrumb {
    name: string;
    page: Page;
    params?: Record<string, any>;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
}

export interface Module {
    id: string;
    name: string;
    description?: string;
    serviceId: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Endpoint {
    id: string;
    method: HttpMethod;
    path: string;
    description: string;
    authRequired: boolean;
    serviceId: string;
    moduleId: string;
    headers?: Param[];
    queryParams?: Param[];
    bodyParams?: Param[];
    bodyExample?: string; // JSON string example for the request body
    successResponses?: ResponseExample[];
    errorResponses?: ResponseExample[];
}

export interface Param {
    id?: string | number; // Optional on frontend, required by DB
    name: string;
    type: string;
    required: boolean;
    description: string;
}

export interface ResponseExample {
    id?: string | number; // Optional on frontend, required by DB
    code: number;
    description: string;
    fields?: Param[]; // The schema for the response body
    body: Record<string, any>; // The example JSON body
}

export interface StatusCode {
    code: number;
    description: string;
}

export interface Schema {
    id: string;
    name: string;
    description?: string;
    serviceId: string;
    fields: SchemaField[];
}

export interface SchemaField {
    id: string;
    name: string;
    type: string;
    required: boolean;
    constraints: string;
    description: string;
}