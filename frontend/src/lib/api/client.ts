const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  data?: any
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
    const { data, headers: customHeaders, ...rest } = options

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    const config: RequestInit = {
      ...rest,
      headers,
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw {
        response: {
          status: response.status,
          data: error,
        },
      }
    }

    const responseData = await response.json()
    return { data: responseData }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_URL)
