const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

interface ApiError {
  message: string
  status: number
  details?: any
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    console.log('🌐 API Request:', url)

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
      console.log('🔑 Token adicionado')
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      console.log('📤 Enviando requisição...')
      const response = await fetch(url, config)
      console.log('📥 Resposta recebida:', response.status, response.statusText)

      let data
      try {
        data = await response.json()
        console.log('📊 Dados parseados:', data)
      } catch (parseError) {
        // Se não conseguir fazer parse do JSON, retorna resposta vazia
        console.log('⚠️ Resposta sem JSON body')
        data = {}
      }

      if (!response.ok) {
        const apiError: ApiError = {
          message: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          details: data,
        }
        const error: any = new Error(apiError.message)
        error.response = { data, status: response.status }
        error.status = response.status
        throw error
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error('❌ API request failed:', error)
      throw error
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  }

  private removeAuthToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ access: string; refresh: string }>(
      '/token/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )

    this.setAuthToken(response.data.access)
    return response
  }

  async register(userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
  }) {
    return this.request('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    this.removeAuthToken()
  }

  // Events methods
  async getEvents(params?: {
    page?: number
    limit?: number
    category?: string
    city?: string
    latitude?: number
    longitude?: number
    radius?: number
  }) {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    // Adicionar timestamp para evitar cache
    searchParams.append('_t', Date.now().toString())

    const queryString = searchParams.toString()
    const endpoint = `/events/?${queryString}`

    return this.request(endpoint)
  }

  async getEvent(id: number) {
    return this.request(`/events/${id}/`)
  }

  async createEvent(eventData: any) {
    return this.request('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(id: number, eventData: any) {
    return this.request(`/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(id: number) {
    return this.request(`/events/${id}/`, {
      method: 'DELETE',
    })
  }

  async joinEvent(id: number) {
    return this.request(`/events/${id}/join/`, {
      method: 'POST',
    })
  }

  async leaveEvent(id: number) {
    return this.request(`/events/${id}/leave/`, {
      method: 'POST',
    })
  }

  async checkInEvent(id: number) {
    return this.request(`/events/${id}/check_in/`, {
      method: 'POST',
    })
  }

  async getEventStats(id: number) {
    return this.request(`/events/${id}/stats/`)
  }

  async getMyEvents() {
    return this.request('/events/my_events/')
  }

  async getNearbyEvents(
    latitude: number,
    longitude: number,
    radius: number = 10
  ) {
    return this.request(
      `/events/nearby/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    )
  }

  // Event Report methods
  async getEventReport(eventId: number) {
    return this.request(`/events/${eventId}/report/`)
  }

  async createEventReport(
    eventId: number,
    reportData: {
      total_participants?: number
      total_hours?: number
      trash_collected_kg?: number
      trees_planted?: number
      area_cleaned_m2?: number
      recyclable_material_kg?: number
      summary?: string
      challenges?: string
      achievements?: string
    }
  ) {
    return this.request(`/events/${eventId}/report/`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async updateEventReport(
    eventId: number,
    reportData: {
      total_participants?: number
      total_hours?: number
      trash_collected_kg?: number
      trees_planted?: number
      area_cleaned_m2?: number
      recyclable_material_kg?: number
      summary?: string
      challenges?: string
      achievements?: string
    }
  ) {
    return this.request(`/events/${eventId}/report/`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    })
  }

  // Categories methods
  async getCategories() {
    return this.request('/events/categories/')
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile/')
  }

  async updateProfile(profileData: any) {
    return this.request('/users/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
  }

  async getUserStats() {
    return this.request('/users/stats/')
  }

  async getLeaderboard(category?: string) {
    const params = category ? `?category=${category}` : ''
    return this.request(`/users/leaderboard/${params}`)
  }

  async getUserRank(category?: string) {
    const params = category ? `?category=${category}` : ''
    return this.request(`/users/rank/${params}`)
  }
}

// Create and export the API client instance
export const api = new ApiClient(API_BASE_URL)

// Export types
export type { ApiResponse, ApiError }
