// Using relative URL for serverless proxying
const API_URL = '/api';

export class ApiError extends Error {
  public data: any;
  constructor(message: string, data: any) {
    super(message);
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  // Fix: Allow `body` to be of type `any` to permit passing JSON objects, which are then stringified.
  { body, ...customConfig }: Omit<RequestInit, 'body'> & { body?: any } = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'An API error occurred', data);
  }
  
  return data as T;
}
