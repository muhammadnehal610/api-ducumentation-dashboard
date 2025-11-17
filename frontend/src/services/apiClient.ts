const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Please check your .env.local file.");
}

export class ApiError extends Error {
  public data: any;
  constructor(message: string, data: any) {
    super(message);
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'An API error occurred', data);
  }
  
  return data as T;
}
