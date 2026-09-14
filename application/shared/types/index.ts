export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type TrainClass = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC';
export type BerthPreference = 'LOWER' | 'MIDDLE' | 'UPPER' | 'SIDE_LOWER' | 'SIDE_UPPER' | 'WINDOW' | 'AISLE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
}

export interface TrainScheduleStop {
  stationId: string;
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  dayNumber: number;
  distanceKm: number;
  platform: string;
}

export interface TrainCoach {
  id: string;
  trainId: string;
  coachCode: string; // e.g. B1, B2, A1, S1, C1
  coachClass: TrainClass;
  totalSeats: number;
  availableSeats: number;
  baseFare: number;
}

export interface TrainSeat {
  id: string;
  coachId: string;
  coachCode: string;
  coachClass: TrainClass;
  seatNumber: number;
  berthType: BerthPreference;
  status: SeatStatus;
  lockedUntil?: string | null;
  lockedBy?: string | null;
  price: number;
}

export interface Train {
  id: string;
  trainNumber: string;
  name: string;
  type: 'VANDE_BHARAT' | 'RAJDHANI_EXPRESS' | 'SUPERFAST_EXPRESS' | 'SHATABDI_EXPRESS' | 'MAIL_EXPRESS';
  originStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOnDays: string[]; // ['MON', 'TUE', ...]
  coaches: TrainCoach[];
  schedule: TrainScheduleStop[];
  rating: number;
  pantryAvailable: boolean;
  cleanlinessScore: number;
}

export interface PassengerInput {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  berthPreference: BerthPreference;
  concession?: 'NONE' | 'SENIOR_CITIZEN' | 'STUDENT' | 'ARMED_FORCES';
  seatId?: string;
  seatNumber?: number;
  coachCode?: string;
}

export interface SeatLockRequest {
  trainId: string;
  date: string;
  seatIds: string[];
  userId: string;
}

export interface SeatLockResponse {
  success: boolean;
  lockToken: string;
  expiresAt: string;
  lockedSeats: string[];
  message: string;
}

export interface CreateBookingRequest {
  trainId: string;
  trainNumber?: string;
  trainName?: string;
  originStation?: Station | { code: string; name: string; city: string };
  destinationStation?: Station | { code: string; name: string; city: string };
  departureTime?: string;
  arrivalTime?: string;
  travelDate: string;
  classType: string;
  passengers: PassengerInput[];
  lockToken?: string;
  idempotencyKey: string;
  contactEmail: string;
  contactPhone: string;
  userId?: string;
}

export interface BookingFareBreakup {
  baseFare: number;
  reservationFee: number;
  superfastCharge: number;
  gstAmount: number;
  travelInsurance: number;
  totalAmount: number;
}

export interface BookingSeat {
  id: string;
  seatNumber: number;
  coachCode: string;
  coachClass: TrainClass;
  berthType: BerthPreference;
  passengerName: string;
  passengerAge: number;
  passengerGender: string;
}

export interface Booking {
  id: string;
  pnr: string;
  userId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  originStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  seats: BookingSeat[];
  fare: BookingFareBreakup;
  paymentId?: string;
  transactionRef?: string;
  createdAt: string;
  cancelledAt?: string | null;
  refundAmount?: number | null;
}

export interface PaymentCreateRequest {
  bookingId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  paymentMethod: 'CARD' | 'UPI' | 'NETBANKING';
}

export interface PaymentResult {
  paymentId: string;
  transactionRef: string;
  status: PaymentStatus;
  amount: number;
  idempotencyKey: string;
  timestamp: string;
  gatewayResponseCode: string;
}

export interface NotificationPayload {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
  recipientEmail: string;
  recipientPhone: string;
  bookingPnr: string;
  title: string;
  content: string;
  timestamp: string;
}
