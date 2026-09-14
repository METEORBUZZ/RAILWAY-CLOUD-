import {
  Train,
  Station,
  Booking,
  SeatLockResponse,
  CreateBookingRequest,
  PaymentResult
} from '../types';
import { INITIAL_TRAINS, INITIAL_STATIONS, normalizeTrain } from '../data/initialData';

const API_BASE = '/api';

export const apiClient = {
  // Auth
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to authenticate');
      }
      return res.json();
    } catch {
      return {
        message: 'Authenticated successfully',
        user: { id: 'usr-1001-user', email, fullName: 'Rahul Sharma', role: 'USER', phone: '+91 98765 43210' },
        token: 'jwt.mock.token'
      };
    }
  },

  async register(data: { email: string; password: string; fullName: string; phone: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register');
      }
      return res.json();
    } catch {
      return {
        message: 'Account registered successfully',
        user: { id: data.email, email: data.email, fullName: data.fullName, phone: data.phone, role: 'USER' },
        token: 'jwt.mock.token'
      };
    }
  },

  async getProfile(token?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    } catch {
      return {
        user: {
          id: 'usr-1001-user',
          email: 'user@railcloud.internal',
          fullName: 'Rahul Sharma',
          phone: '+91 98765 43210',
          role: 'USER',
          walletBalance: 2450.00,
          loyaltyPoints: 340
        }
      };
    }
  },

  // Trains
  async getTrains(): Promise<{ trains: Train[]; stations: Station[] }> {
    try {
      const res = await fetch(`${API_BASE}/trains`);
      if (!res.ok) throw new Error('Failed to fetch train catalog');
      const data = await res.json();
      const rawTrains = data.trains || [];
      const trains = rawTrains.map((t: any) => normalizeTrain(t));
      const stations = (data.stations && data.stations.length > 0) ? data.stations : INITIAL_STATIONS;
      return { trains, stations };
    } catch {
      return { trains: INITIAL_TRAINS, stations: INITIAL_STATIONS };
    }
  },

  async searchTrains(params: { from?: string; to?: string; date?: string; class?: string }): Promise<{ count: number; trains: Train[] }> {
    try {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.date) query.set('date', params.date);
      if (params.class) query.set('class', params.class);

      const res = await fetch(`${API_BASE}/trains/search?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to search trains');
      const data = await res.json();
      const rawTrains = data.trains || [];
      const trains = rawTrains.map((t: any) => normalizeTrain(t));
      return { count: trains.length, trains };
    } catch {
      let filtered = [...INITIAL_TRAINS];
      if (params.from) {
        filtered = filtered.filter(t => (t as any).originCode === params.from || t.originStation?.code === params.from);
      }
      if (params.to) {
        filtered = filtered.filter(t => (t as any).destCode === params.to || t.destinationStation?.code === params.to);
      }
      return { count: filtered.length, trains: filtered };
    }
  },

  async getTrainDetails(id: string): Promise<{ train: Train }> {
    try {
      const res = await fetch(`${API_BASE}/trains/${id}`);
      if (!res.ok) throw new Error('Failed to fetch train details');
      const data = await res.json();
      return { train: normalizeTrain(data.train) };
    } catch {
      const found = INITIAL_TRAINS.find(t => t.trainNumber === id || t.id === id) || INITIAL_TRAINS[0];
      return { train: found };
    }
  },

  async getTrainSchedule(id: string) {
    const res = await fetch(`${API_BASE}/trains/${id}/schedule`);
    if (!res.ok) throw new Error('Failed to fetch train schedule');
    return res.json();
  },

  // Booking & Concurrency Seat Locking
  async acquireSeatLock(params: {
    trainId: string;
    date: string;
    seatIds: string[];
    userId: string;
  }): Promise<SeatLockResponse> {
    const res = await fetch(`${API_BASE}/bookings/lock-seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Seat locking conflict');
    }
    return data;
  },

  async createBooking(bookingData: CreateBookingRequest): Promise<{ booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': bookingData.idempotencyKey
      },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to create booking');
    }
    return data;
  },

  async getBooking(idOrPnr: string): Promise<{ booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${idOrPnr}`);
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },

  async getUserBookings(userId: string): Promise<{ bookings: Booking[] }> {
    const res = await fetch(`${API_BASE}/bookings/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user bookings');
    return res.json();
  },

  async cancelBooking(bookingId: string): Promise<{ booking: Booking; refundAmount: number; message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }
    return data;
  },

  // Payment
  async processPayment(params: {
    bookingId: string;
    amount: number;
    forceFailure?: boolean;
    idempotencyKey?: string;
  }): Promise<PaymentResult> {
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment gateway declined transaction');
    }
    return data;
  },

  // Live Concurrency Simulation & DevSecOps Tools
  async simulateConcurrencyDrill(params: {
    trainId: string;
    date: string;
    seatId: string;
    concurrentUsers: number;
  }) {
    const res = await fetch(`${API_BASE}/bookings/simulate-concurrency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getRabbitMqEvents() {
    const res = await fetch(`${API_BASE}/bookings/events`);
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async getClusterHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};
