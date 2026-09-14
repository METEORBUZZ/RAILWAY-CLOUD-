import type {
  Station,
  TrainScheduleStop,
  TrainClass,
  BerthPreference,
  BookingStatus,
  PaymentStatus,
  BookingSeat,
  BookingFareBreakup,
  User,
  UserRole,
  SeatLockRequest,
  SeatLockResponse,
  CreateBookingRequest,
  PaymentResult
} from '../application/shared/types/index.ts';

export type {
  Station,
  TrainScheduleStop,
  TrainClass,
  BerthPreference,
  BookingStatus,
  PaymentStatus,
  BookingSeat,
  BookingFareBreakup,
  User,
  UserRole,
  SeatLockRequest,
  SeatLockResponse,
  CreateBookingRequest,
  PaymentResult
};

export interface Seat {
  id: string;
  seatNumber: number;
  berthType: string;
  isBooked?: boolean;
  isLocked?: boolean;
}

export interface Coach {
  id: string;
  coachCode: string;
  coachClass: string;
  totalSeats: number;
  availableSeats: number;
  fare: number;
  baseFare?: number;
  seats: Seat[];
}

export type TrainOperationalStatus = 'ON_TIME' | 'DELAYED' | 'RUNNING' | 'CANCELLED' | 'RESCHEDULED' | 'DEPARTED';

export interface Train {
  id: string;
  trainNumber: string;
  name: string;
  type: string;
  originCode?: string;
  destCode?: string;
  originName?: string;
  destName?: string;
  originCity?: string;
  destCity?: string;
  originStation?: Station;
  destinationStation?: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOnDays: string[];
  runningDays?: string[];
  coaches: Coach[];
  schedule?: TrainScheduleStop[];
  rating: number;
  pantryAvailable: boolean;
  cleanlinessScore?: number;
  averageSpeedKmH?: number;
  platform?: string;
  status?: TrainOperationalStatus;
  delayMinutes?: number;
  statusRemark?: string;
  managedBy?: string;
  managedById?: string;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  originStation: Station | { code: string; name: string; city: string };
  destinationStation: Station | { code: string; name: string; city: string };
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  seats: BookingSeat[];
  fare: BookingFareBreakup;
  contactEmail?: string;
  contactPhone?: string;
  paymentId?: string;
  transactionRef?: string;
  createdAt: string;
  cancelledAt?: string | null;
  refundAmount?: number | null;
}

export interface SearchFilterState {
  fromStation: string;
  toStation: string;
  travelDate: string;
  trainClass: string;
  quota: 'GENERAL' | 'TATKAL' | 'LADIES' | 'SENIOR_CITIZEN';
}

export interface SelectedSeatState {
  seatId: string;
  seatNumber: number;
  coachCode: string;
  coachClass: string;
  berthType: string;
  fare: number;
  passengerName?: string;
  passengerAge?: number;
  passengerGender?: 'MALE' | 'FEMALE' | 'OTHER';
  berthPreference?: string;
}

