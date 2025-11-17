import { Endpoint, Schema, User } from '@/types';

export const services = [
    'All Services', 'Auth Service', 'User Service', 'Payment Service', 'Notification Service', 'Admin API', 'Mobile API'
];

export let users: User[] = [
    { id: 'user_1', name: 'Frontend Dev', email: 'frontend@dev.com', password: 'password', role: 'frontend', status: 'active' },
    { id: 'user_2', name: 'Backend Dev', email: 'backend@dev.com', password: 'password', role: 'backend', status: 'active' },
    { id: 'user_3', name: 'Inactive User', email: 'inactive@dev.com', password: 'password', role: 'frontend', status: 'inactive' },
];

export let endpoints: Endpoint[] = [
    {
        id: 'get_user',
        method: 'GET',
        path: '/v1/users/{userId}',
        description: 'Retrieves a specific user by their unique ID.',
        module: 'User Service',
        authRequired: true,
        headers: [
            { name: 'X-Request-ID', type: 'string', required: false, description: 'Unique request identifier for tracing.' }
        ],
        queryParams: [
            { name: 'include_details', type: 'boolean', required: false, description: 'Include extended user details.' }
        ],
        successResponses: [
            {
                code: 200,
                description: 'User found and returned successfully.',
                fields: [
                    { name: 'id', type: 'string', required: true, description: 'User ID' },
                    { name: 'name', type: 'string', required: true, description: 'User\'s full name' },
                    { name: 'email', type: 'string', required: true, description: 'User\'s email address' },
                    { name: 'created_at', type: 'string', required: true, description: 'Timestamp of creation' },
                ],
                body: {
                    "id": "usr_12345",
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "created_at": "2023-10-27T10:00:00Z"
                }
            }
        ],
        errorResponses: [
            {
                code: 404,
                description: 'User with the specified ID not found.',
                fields: [
                    { name: 'error', type: 'object', required: true, description: 'Error details object' },
                ],
                body: {
                    "error": {
                        "code": "user_not_found",
                        "message": "The requested user does not exist."
                    }
                }
            },
            {
                code: 401,
                description: 'Authentication required. The provided token is invalid or expired.',
                fields: [
                     { name: 'error', type: 'object', required: true, description: 'Error details object' },
                ],
                body: {
                    "error": {
                        "code": "unauthorized",
                        "message": "Authentication required."
                    }
                }
            }
        ],
        successResponse: {}, // Deprecated
        errorResponse: {}, // Deprecated
        statusCodes: [
            { code: 200, description: 'User found and returned successfully.' },
            { code: 404, description: 'User with the specified ID not found.' },
            { code: 401, description: 'Authentication required.' }
        ]
    },
    {
        id: 'create_user',
        method: 'POST',
        path: '/v1/users',
        description: 'Creates a new user in the system.',
        module: 'User Service',
        authRequired: false,
        bodyParams: [
            { name: 'name', type: 'string', required: true, description: 'Full name of the user.' },
            { name: 'email', type: 'string', required: true, description: 'Unique email address.' },
            { name: 'password', type: 'string', required: true, description: 'User\'s password (min 8 characters).' }
        ],
        bodyExample: JSON.stringify({
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "password": "a_strong_password"
        }, null, 2),
        successResponses: [
            {
                code: 201,
                description: 'User created successfully.',
                 fields: [
                    { name: 'id', type: 'string', required: true, description: 'New User ID' },
                    { name: 'name', type: 'string', required: true, description: 'User\'s full name' },
                    { name: 'email', type: 'string', required: true, description: 'User\'s email address' },
                    { name: 'created_at', type: 'string', required: true, description: 'Timestamp of creation' },
                ],
                body: {
                    "id": "usr_67890",
                    "name": "Jane Smith",
                    "email": "jane.smith@example.com",
                    "created_at": "2023-10-27T10:05:00Z"
                }
            }
        ],
        errorResponses: [
            {
                code: 409,
                description: 'A user with this email address already exists.',
                 fields: [
                     { name: 'error', type: 'object', required: true, description: 'Error details object' },
                ],
                body: {
                    "error": {
                        "code": "email_already_exists",
                        "message": "A user with this email address already exists."
                    }
                }
            },
             {
                code: 400,
                description: 'Invalid input data provided. Check the request body for errors.',
                 fields: [
                     { name: 'error', type: 'object', required: true, description: 'Error details object' },
                ],
                body: {
                    "error": {
                        "code": "validation_failed",
                        "message": "The 'password' field must be at least 8 characters."
                    }
                }
            }
        ],
        successResponse: {}, // Deprecated
        errorResponse: {}, // Deprecated
        statusCodes: [
            { code: 201, description: 'User created successfully.' },
            { code: 400, description: 'Invalid input data provided.' },
            { code: 409, description: 'User with this email already exists.' }
        ]
    },
    {
        id: 'process_payment',
        method: 'POST',
        path: '/v1/payments',
        description: 'Processes a new payment transaction.',
        module: 'Payment Service',
        authRequired: true,
        bodyParams: [
            { name: 'amount', type: 'number', required: true, description: 'Payment amount in cents.' },
            { name: 'currency', type: 'string', required: true, description: 'ISO currency code (e.g., "usd").' },
            { name: 'source', type: 'string', required: true, description: 'Payment source token.' }
        ],
        bodyExample: JSON.stringify({
            "amount": 1000,
            "currency": "usd",
            "source": "tok_visa"
        }, null, 2),
        successResponses: [
             {
                code: 201,
                description: 'Payment processed successfully.',
                fields: [
                    { name: 'id', type: 'string', required: true, description: 'Payment transaction ID' },
                    { name: 'amount', type: 'number', required: true, description: 'Amount in cents' },
                    { name: 'currency', type: 'string', required: true, description: 'ISO currency code' },
                    { name: 'status', type: 'string', required: true, description: 'Transaction status' },
                    { name: 'created_at', type: 'string', required: true, description: 'Timestamp of transaction' },
                ],
                body: {
                    "id": "pay_abcde",
                    "amount": 1000,
                    "currency": "usd",
                    "status": "succeeded",
                    "created_at": "2023-10-27T11:00:00Z"
                }
            }
        ],
        errorResponses: [
            {
                code: 402,
                description: 'The payment was declined by the provider.',
                fields: [
                     { name: 'error', type: 'object', required: true, description: 'Error details object' },
                ],
                body: {
                     "error": {
                        "code": "payment_declined",
                        "message": "The payment was declined by the provider."
                    }
                }
            }
        ],
        successResponse: {}, // Deprecated
        errorResponse: {}, // Deprecated
        statusCodes: [
            { code: 201, description: 'Payment processed successfully.' },
            { code: 400, description: 'Invalid payment details.' },
            { code: 402, description: 'Payment declined.' }
        ]
    },
];

export let schemas: Schema[] = [
    {
        name: 'User',
        description: 'Represents a user account in the system.',
        fields: [
            { id: 'user-1', name: 'id', type: 'string', required: true, constraints: 'uuid', description: 'Unique identifier for the user.' },
            { id: 'user-2', name: 'name', type: 'string', required: true, constraints: 'max: 255', description: 'Full name of the user.' },
            { id: 'user-3', name: 'email', type: 'string', required: true, constraints: 'email, unique', description: 'User\'s email address.' },
            { id: 'user-4', name: 'created_at', type: 'datetime', required: true, constraints: 'iso8601', description: 'Timestamp of user creation.' }
        ]
    },
    {
        name: 'Payment',
        description: 'Represents a financial transaction.',
        fields: [
            { id: 'payment-1', name: 'id', type: 'string', required: true, constraints: 'prefixed (pay_)', description: 'Unique identifier for the payment.' },
            { id: 'payment-2', name: 'amount', type: 'integer', required: true, constraints: 'min: 50', description: 'Amount in the smallest currency unit (e.g., cents).' },
            { id: 'payment-3', name: 'currency', type: 'string', required: true, constraints: '3-letter ISO code', description: 'Currency of the payment.' },
            { id: 'payment-4', name: 'status', type: 'enum', required: true, constraints: 'succeeded, failed, pending', description: 'The current status of the payment.' },
            { id: 'payment-5', name: 'created_at', type: 'datetime', required: true, constraints: 'iso8601', description: 'Timestamp of payment creation.' }
        ]
    }
];

export let errorCodes = [
    { code: 400, meaning: 'Bad Request', context: 'The server could not understand the request due to invalid syntax.' },
    { code: 401, meaning: 'Unauthorized', context: 'The client must authenticate itself to get the requested response.' },
    { code: 403, meaning: 'Forbidden', context: 'The client does not have access rights to the content.' },
    { code: 404, meaning: 'Not Found', context: 'The server can not find the requested resource.' },
    { code: 500, meaning: 'Internal Server Error', context: 'The server has encountered a situation it doesn\'t know how to handle.' }
];

export const changelogItems = [
    { version: 'v2.1.0', date: '2023-10-25', changes: [
        { type: 'new', description: 'Added `DELETE /v1/users/{userId}` endpoint for admins.' },
        { type: 'update', description: 'The `GET /v1/users/{userId}` endpoint now accepts an `include_details` query parameter.' }
    ]},
    { version: 'v2.0.0', date: '2023-09-01', changes: [
        { type: 'breaking', description: 'API v2 released. The ` /users` endpoint is now `/v1/users`.' },
        { type: 'new', description: 'Introduced the Payment Service with `POST /v1/payments` endpoint.' }
    ]}
];