const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private walletAddress: string | null = null;

  setWallet(address: string | null) {
    this.walletAddress = address;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.walletAddress && { Authorization: `Wallet ${this.walletAddress}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async getNonce(walletAddress: string) {
    return this.request<{ nonce: string }>('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }

  async verifySignature(walletAddress: string, signature: string, nonce: string) {
    return this.request<{ authenticated: boolean }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, nonce }),
    });
  }

  // Salons
  async getSalons(params?: { city?: string; search?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<any[]>(`/salons${query ? `?${query}` : ''}`);
  }

  async getSalon(id: string) {
    return this.request<any>(`/salons/${id}`);
  }

  async getSalonByWallet(walletAddress: string) {
    return this.request<any>(`/salons/wallet/${walletAddress}`);
  }

  async registerSalon(data: {
    name: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
  }) {
    return this.request<any>('/salons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSalon(id: string, data: any) {
    return this.request<any>(`/salons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSalonReservations(id: string, params?: { status?: string; from?: string; to?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<any[]>(`/salons/${id}/reservations${query ? `?${query}` : ''}`);
  }

  async getSalonEarnings(id: string) {
    return this.request<any>(`/salons/${id}/earnings`);
  }

  // Services
  async getServices(params?: { category?: string; salonId?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<any[]>(`/services${query ? `?${query}` : ''}`);
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  async createService(data: {
    salonId: string;
    name: string;
    description?: string;
    priceLamports: string;
    priceDisplay: number;
    durationMinutes: number;
    category: string;
  }) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reservations
  async getMyReservations(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any[]>(`/reservations/my${query}`);
  }

  async getAvailableSlots(salonId: string, serviceId: string, date: string) {
    return this.request<{ time: string; available: boolean }[]>(
      `/reservations/slots?salonId=${salonId}&serviceId=${serviceId}&date=${date}`
    );
  }

  async createReservation(data: {
    salonId: string;
    serviceId: string;
    appointmentTime: string;
    transactionHash?: string;
  }) {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmReservation(id: string, transactionHash: string) {
    return this.request<any>(`/reservations/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  }

  async cancelReservation(id: string, transactionHash?: string) {
    return this.request<any>(`/reservations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  }

  async completeReservation(id: string, transactionHash?: string) {
    return this.request<any>(`/reservations/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  }

  async markNoShow(id: string, transactionHash?: string) {
    return this.request<any>(`/reservations/${id}/no-show`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  }
}

export const api = new ApiClient();
export default api;


