-- RailCloud Database Initial Production Migration
-- PostgreSQL 16.x Compatible

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TrainClass" AS ENUM ('1A', '2A', '3A', 'SL', 'CC', 'EC');
CREATE TYPE "BerthType" AS ENUM ('LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER', 'WINDOW', 'AISLE');
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'BOOKED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLIST');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED');

-- Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL UNIQUE,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");

-- Stations Table
CREATE TABLE "stations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_stations_code" ON "stations"("code");
CREATE INDEX "idx_stations_city" ON "stations"("city");

-- Trains Table
CREATE TABLE "trains" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "trainNumber" VARCHAR(20) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'SUPERFAST_EXPRESS',
    "originStationId" UUID NOT NULL REFERENCES "stations"("id"),
    "destStationId" UUID NOT NULL REFERENCES "stations"("id"),
    "departureTime" VARCHAR(10) NOT NULL,
    "arrivalTime" VARCHAR(10) NOT NULL,
    "duration" VARCHAR(20) NOT NULL,
    "runsOnDays" TEXT[] NOT NULL,
    "rating" NUMERIC(2, 1) DEFAULT 4.5 NOT NULL,
    "pantryAvailable" BOOLEAN DEFAULT true NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_trains_number" ON "trains"("trainNumber");
CREATE INDEX "idx_trains_route" ON "trains"("originStationId", "destStationId");

-- Coaches Table
CREATE TABLE "coaches" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "trainId" UUID NOT NULL REFERENCES "trains"("id") ON DELETE CASCADE,
    "coachCode" VARCHAR(10) NOT NULL,
    "coachClass" "TrainClass" NOT NULL,
    "totalSeats" INTEGER NOT NULL DEFAULT 72,
    "baseFare" NUMERIC(10, 2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "uq_coach_train_code" UNIQUE ("trainId", "coachCode")
);
CREATE INDEX "idx_coaches_train" ON "coaches"("trainId");

-- Seats Table
CREATE TABLE "seats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "coachId" UUID NOT NULL REFERENCES "coaches"("id") ON DELETE CASCADE,
    "seatNumber" INTEGER NOT NULL,
    "berthType" "BerthType" NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "uq_seat_coach_number" UNIQUE ("coachId", "seatNumber")
);
CREATE INDEX "idx_seats_coach_status" ON "seats"("coachId", "status");

-- Bookings Table
CREATE TABLE "bookings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "pnr" VARCHAR(12) NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES "users"("id"),
    "trainId" UUID NOT NULL REFERENCES "trains"("id"),
    "travelDate" DATE NOT NULL,
    "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" VARCHAR(64) NOT NULL UNIQUE,
    "baseFare" NUMERIC(10, 2) NOT NULL,
    "reservationFee" NUMERIC(10, 2) NOT NULL,
    "superfastCharge" NUMERIC(10, 2) NOT NULL,
    "gstAmount" NUMERIC(10, 2) NOT NULL,
    "travelInsurance" NUMERIC(10, 2) NOT NULL DEFAULT 0.49,
    "totalAmount" NUMERIC(10, 2) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(20) NOT NULL,
    "cancelledAt" TIMESTAMP WITH TIME ZONE,
    "refundAmount" NUMERIC(10, 2),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_bookings_pnr" ON "bookings"("pnr");
CREATE INDEX "idx_bookings_user" ON "bookings"("userId");
CREATE INDEX "idx_bookings_train_date" ON "bookings"("trainId", "travelDate");

-- Critical Concurrency Table: Booking Seats allocation
CREATE TABLE "booking_seats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
    "seatId" UUID NOT NULL REFERENCES "seats"("id"),
    "travelDate" DATE NOT NULL,
    "allocatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "uq_seat_per_travel_date" UNIQUE ("seatId", "travelDate")
);

-- Payments Table
CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL REFERENCES "bookings"("id"),
    "idempotencyKey" VARCHAR(64) NOT NULL UNIQUE,
    "amount" NUMERIC(10, 2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "paymentMethod" VARCHAR(20) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionRef" VARCHAR(64) NOT NULL UNIQUE,
    "gatewayResponseCode" VARCHAR(50) NOT NULL DEFAULT '200_OK',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_payments_booking" ON "payments"("bookingId");
CREATE INDEX "idx_payments_tx" ON "payments"("transactionRef");
