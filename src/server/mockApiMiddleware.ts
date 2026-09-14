import type { Connect } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import { seedData } from '../../application/database/seed/seed.ts';

// In-memory Redis Distributed Lock Store (with TTL)
interface RedisLock {
  lockToken: string;
  seatId: string;
  userId: string;
  expiresAt: number;
}

const redisLocks = new Map<string, RedisLock>();
const postgresBookings = new Map<string, any>();
const postgresAllocatedSeats = new Map<string, string>(); // `allocated:${trainId}:${date}:${seatId}` -> bookingId
const idempotencyKeys = new Map<string, any>();
const rabbitMqEvents: Array<{ id: string; event: string; payload: any; timestamp: string }> = [];
const notificationHistory: any[] = [];

// Seed initial bookings for Rahul Sharma (demo user)
const initialPnr = 'PNR-8834921045';
const initialBooking = {
  id: 'bkg-demo-101',
  pnr: initialPnr,
  userId: 'usr-1001-user',
  trainId: '22436',
  trainNumber: '22436',
  trainName: 'Vande Bharat Express',
  originStation: { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi' },
  destinationStation: { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
  departureTime: '06:00',
  arrivalTime: '14:00',
  travelDate: '2026-09-22',
  bookingStatus: 'CONFIRMED',
  paymentStatus: 'SUCCESS',
  seats: [
    {
      id: 'bseat-init-1',
      seatNumber: 15,
      coachCode: 'C1',
      coachClass: 'CC',
      berthType: 'WINDOW',
      passengerName: 'Rahul Sharma',
      passengerAge: 29,
      passengerGender: 'MALE'
    },
    {
      id: 'bseat-init-2',
      seatNumber: 16,
      coachCode: 'C1',
      coachClass: 'CC',
      berthType: 'AISLE',
      passengerName: 'Ananya Sharma',
      passengerAge: 27,
      passengerGender: 'FEMALE'
    }
  ],
  fare: {
    baseFare: 3500,
    reservationFee: 80,
    superfastCharge: 90,
    gstAmount: 175,
    travelInsurance: 0.98,
    totalAmount: 3845.98
  },
  contactEmail: 'user@railcloud.internal',
  contactPhone: '+91 98765 43210',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  cancelledAt: null,
  refundAmount: null
};

postgresBookings.set(initialBooking.id, initialBooking);
postgresAllocatedSeats.set('allocated:22436:2026-09-22:C1-15', initialBooking.id);
postgresAllocatedSeats.set('allocated:22436:2026-09-22:C1-16', initialBooking.id);

rabbitMqEvents.push({
  id: 'evt-init-01',
  event: 'BOOKING_CONFIRMED',
  payload: { pnr: initialPnr, seats: 'C1-15, C1-16', amount: 3845.98 },
  timestamp: new Date(Date.now() - 86400000).toISOString()
});

export function createApiMiddleware(): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';
    if (!url.startsWith('/api')) {
      return next();
    }

    const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost:3000'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method || 'GET';

    res.setHeader('Content-Type', 'application/json');

    const sendJson = (status: number, data: any) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };

    const getBody = async (): Promise<any> => {
      return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch {
            resolve({});
          }
        });
      });
    };

    (async () => {
      // GET /api/health
      if (pathname === '/api/health') {
        return sendJson(200, {
          status: 'UP',
          cluster: 'kubeadm-ec2-ha',
          kubernetesVersion: 'v1.30.0',
          redisLockEngine: 'HEALTHY',
          postgresConnection: 'HEALTHY',
          rabbitmqExchange: 'HEALTHY',
          activeRedisLocks: redisLocks.size,
          totalCommittedBookings: postgresBookings.size,
          timestamp: new Date().toISOString()
        });
      }

      // GET /api/metrics (Prometheus scrape)
      if (pathname === '/api/metrics') {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        return res.end(`# HELP railcloud_http_requests_total Total HTTP requests handled
railcloud_http_requests_total{status="200"} 4821
railcloud_http_requests_total{status="409"} 14
# HELP railcloud_redis_seat_locks_active Currently held locks in Redis
railcloud_redis_seat_locks_active ${redisLocks.size}
# HELP railcloud_postgres_bookings_total Total committed bookings
railcloud_postgres_bookings_total ${postgresBookings.size}
`);
      }

      // AUTH ROUTES
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await getBody();
        const { email, password } = body;
        const user = seedData.demoUsers.find(u => u.email.toLowerCase() === email?.toLowerCase());

        if (!user || (password !== 'Pass@1234' && password !== 'Admin@Secure2026' && password !== 'password')) {
          return sendJson(401, { error: 'Invalid email or password' });
        }

        const token = `jwt.header.${btoa(JSON.stringify({ id: user.email, role: user.role, name: user.fullName }))}.signature`;
        return sendJson(200, {
          message: 'Login successful',
          user: { id: user.email, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role },
          token,
          refreshToken: `refresh.${Date.now()}`
        });
      }

      if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await getBody();
        const { email, fullName, phone } = body;
        if (!email || !fullName || !phone) {
          return sendJson(400, { error: 'All fields are required' });
        }
        const newUser = { id: email, email, fullName, phone, role: 'USER' };
        const token = `jwt.header.${btoa(JSON.stringify(newUser))}.signature`;
        return sendJson(201, {
          message: 'Account registered successfully',
          user: newUser,
          token,
          refreshToken: `refresh.${Date.now()}`
        });
      }

      if (pathname === '/api/auth/profile') {
        return sendJson(200, {
          user: {
            id: 'usr-1001-user',
            email: 'user@railcloud.internal',
            fullName: 'Rahul Sharma',
            phone: '+91 98765 43210',
            role: 'USER',
            walletBalance: 2450.00,
            loyaltyPoints: 340
          }
        });
      }

      // TRAIN CATALOG ROUTES
      if (pathname === '/api/trains' && method === 'GET') {
        return sendJson(200, { trains: seedData.trains, total: seedData.trains.length, stations: seedData.stations });
      }

      if (pathname === '/api/trains/search' && method === 'GET') {
        const from = parsedUrl.searchParams.get('from');
        const to = parsedUrl.searchParams.get('to');
        const trainClass = parsedUrl.searchParams.get('class');

        let matches = seedData.trains;
        if (from) {
          matches = matches.filter(t =>
            t.originCode.toLowerCase() === from.toLowerCase() ||
            t.schedule.some(s => s.stationCode.toLowerCase() === from.toLowerCase())
          );
        }
        if (to) {
          matches = matches.filter(t =>
            t.destCode.toLowerCase() === to.toLowerCase() ||
            t.schedule.some(s => s.stationCode.toLowerCase() === to.toLowerCase())
          );
        }
        if (trainClass && trainClass !== 'ALL') {
          matches = matches.filter(t => t.coaches.some(c => c.coachClass === trainClass));
        }

        return sendJson(200, {
          from,
          to,
          date: parsedUrl.searchParams.get('date'),
          count: matches.length,
          trains: matches
        });
      }

      if (pathname.startsWith('/api/trains/') && pathname.endsWith('/schedule')) {
        const id = pathname.replace('/api/trains/', '').replace('/schedule', '');
        const train = seedData.trains.find(t => t.trainNumber === id);
        if (!train) return sendJson(404, { error: 'Train not found' });
        return sendJson(200, { trainNumber: train.trainNumber, name: train.name, schedule: train.schedule });
      }

      if (pathname.startsWith('/api/trains/') && method === 'GET') {
        const id = pathname.replace('/api/trains/', '');
        const train = seedData.trains.find(t => t.trainNumber === id || t.name.toLowerCase().includes(id.toLowerCase()));
        if (!train) return sendJson(404, { error: 'Train not found' });
        return sendJson(200, { train });
      }

      // BOOKING CONCURRENCY & REDIS LOCK ROUTES
      // POST /api/bookings/lock-seat
      if (pathname === '/api/bookings/lock-seat' && method === 'POST') {
        const body = await getBody();
        const { trainId, date, seatIds = [], userId = 'anonymous' } = body;

        if (!trainId || !date || seatIds.length === 0) {
          return sendJson(400, { error: 'trainId, date, and seatIds are required' });
        }

        const now = Date.now();
        const ttlMs = 10 * 60 * 1000; // 10 minutes
        const lockToken = `lock_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        const newlyLocked: string[] = [];

        for (const seatId of seatIds) {
          const allocKey = `allocated:${trainId}:${date}:${seatId}`;
          if (postgresAllocatedSeats.has(allocKey)) {
            return sendJson(409, {
              success: false,
              error: 'Seat already booked',
              conflictSeatId: seatId,
              message: `Seat ${seatId} is already permanently booked in PostgreSQL.`
            });
          }

          const lockKey = `seat_lock:${trainId}:${date}:${seatId}`;
          const existingLock = redisLocks.get(lockKey);
          if (existingLock && existingLock.expiresAt > now && existingLock.userId !== userId) {
            // Rollback newly acquired
            for (const rk of newlyLocked) redisLocks.delete(rk);
            return sendJson(409, {
              success: false,
              error: 'Seat lock conflict',
              conflictSeatId: seatId,
              message: `Seat ${seatId} is currently held by another user in Redis. Lock expires in ${Math.round((existingLock.expiresAt - now) / 1000)}s.`
            });
          }

          redisLocks.set(lockKey, { lockToken, seatId, userId, expiresAt: now + ttlMs });
          newlyLocked.push(lockKey);
        }

        return sendJson(200, {
          success: true,
          lockToken,
          expiresAt: new Date(now + ttlMs).toISOString(),
          lockedSeats: seatIds,
          ttlSeconds: 600,
          message: 'Redis seat lock acquired successfully (TTL 10m)'
        });
      }

      // POST /api/bookings
      if (pathname === '/api/bookings' && method === 'POST') {
        const idempotencyKey = (req.headers['idempotency-key'] as string) || `idemp_${Date.now()}`;
        if (idempotencyKeys.has(idempotencyKey)) {
          return sendJson(200, idempotencyKeys.get(idempotencyKey));
        }

        const body = await getBody();
        const {
          trainId = '22436',
          trainNumber = '22436',
          trainName = 'Vande Bharat Express',
          travelDate = '2026-09-25',
          classType = 'CC',
          passengers = [],
          lockToken,
          userId = 'usr-1001-user',
          contactEmail = 'user@railcloud.internal',
          contactPhone = '+91 98765 43210',
          originStation = { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
          destinationStation = { code: 'BSB', name: 'Varanasi', city: 'Varanasi' },
          departureTime = '06:00',
          arrivalTime = '14:00'
        } = body;

        const count = passengers.length || 1;
        const baseRate = classType === 'EC' ? 3300 : classType === '1A' ? 4850 : classType === '2A' ? 2950 : classType === '3A' ? 2080 : 1750;
        const baseFare = baseRate * count;
        const reservationFee = 40 * count;
        const superfastCharge = 45 * count;
        const gstAmount = Math.round(baseFare * 0.05);
        const travelInsurance = Number((0.49 * count).toFixed(2));
        const totalAmount = baseFare + reservationFee + superfastCharge + gstAmount + travelInsurance;

        const pnr = `PNR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const bookingId = `bkg-${Math.random().toString(36).substring(2, 9)}`;

        const seats = passengers.map((p: any, i: number) => ({
          id: `bseat-${i + 1}`,
          seatNumber: p.seatNumber || (20 + i),
          coachCode: p.coachCode || 'C1',
          coachClass: classType,
          berthType: p.berthPreference || 'WINDOW',
          passengerName: p.name,
          passengerAge: p.age,
          passengerGender: p.gender
        }));

        const booking = {
          id: bookingId,
          pnr,
          userId,
          trainId,
          trainNumber,
          trainName,
          originStation,
          destinationStation,
          departureTime,
          arrivalTime,
          travelDate,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'SUCCESS',
          seats,
          fare: { baseFare, reservationFee, superfastCharge, gstAmount, travelInsurance, totalAmount },
          contactEmail,
          contactPhone,
          createdAt: new Date().toISOString(),
          cancelledAt: null,
          refundAmount: null
        };

        postgresBookings.set(bookingId, booking);

        for (const s of seats) {
          const seatKey = `${s.coachCode}-${s.seatNumber}`;
          postgresAllocatedSeats.set(`allocated:${trainId}:${travelDate}:${seatKey}`, bookingId);
          redisLocks.delete(`seat_lock:${trainId}:${travelDate}:${seatKey}`);
        }

        // RabbitMQ Events
        rabbitMqEvents.push({
          id: `evt-${Date.now()}-1`,
          event: 'BOOKING_CREATED',
          payload: { bookingId, pnr, totalAmount, userId },
          timestamp: new Date().toISOString()
        });
        rabbitMqEvents.push({
          id: `evt-${Date.now()}-2`,
          event: 'BOOKING_CONFIRMED',
          payload: { bookingId, pnr, email: contactEmail, seats: seats.map((s: any) => `${s.coachCode}-${s.seatNumber}`).join(', ') },
          timestamp: new Date().toISOString()
        });

        // Async Email Notification
        notificationHistory.push({
          id: `notif-${Date.now()}`,
          type: 'BOOKING_CONFIRMED',
          recipientEmail: contactEmail,
          title: `RailCloud: Booking Confirmed (PNR: ${pnr})`,
          content: `Your train booking for ${trainName} (${trainNumber}) on ${travelDate} is confirmed!`,
          status: 'SENT',
          timestamp: new Date().toISOString()
        });

        const resp = { message: 'Booking confirmed', booking };
        idempotencyKeys.set(idempotencyKey, resp);
        return sendJson(201, resp);
      }

      // GET /api/bookings/user/:userId
      if (pathname.startsWith('/api/bookings/user/')) {
        const uid = pathname.replace('/api/bookings/user/', '');
        const list = Array.from(postgresBookings.values()).filter(b => b.userId === uid);
        return sendJson(200, { bookings: list, count: list.length });
      }

      // GET /api/bookings/:id
      if (pathname.startsWith('/api/bookings/') && method === 'GET' && !pathname.includes('events') && !pathname.includes('simulate')) {
        const id = pathname.replace('/api/bookings/', '');
        const booking = Array.from(postgresBookings.values()).find(b => b.id === id || b.pnr === id);
        if (!booking) return sendJson(404, { error: 'Booking not found' });
        return sendJson(200, { booking });
      }

      // POST /api/bookings/:id/cancel
      if (pathname.includes('/cancel') && method === 'POST') {
        const id = pathname.replace('/api/bookings/', '').replace('/cancel', '');
        const booking = Array.from(postgresBookings.values()).find(b => b.id === id || b.pnr === id);
        if (!booking) return sendJson(404, { error: 'Booking not found' });

        if (booking.bookingStatus === 'CANCELLED') {
          return sendJson(400, { error: 'Booking is already cancelled' });
        }

        const refund = Math.round(booking.fare.totalAmount * 0.8);
        booking.bookingStatus = 'CANCELLED';
        booking.paymentStatus = 'REFUNDED';
        booking.cancelledAt = new Date().toISOString();
        booking.refundAmount = refund;

        for (const s of booking.seats) {
          const seatKey = `${s.coachCode}-${s.seatNumber}`;
          postgresAllocatedSeats.delete(`allocated:${booking.trainId}:${booking.travelDate}:${seatKey}`);
        }

        rabbitMqEvents.push({
          id: `evt-${Date.now()}`,
          event: 'BOOKING_CANCELLED',
          payload: { pnr: booking.pnr, refundAmount: refund },
          timestamp: new Date().toISOString()
        });

        return sendJson(200, { message: 'Booking cancelled', booking, refundAmount: refund });
      }

      // POST /api/bookings/simulate-concurrency
      if (pathname === '/api/bookings/simulate-concurrency' && method === 'POST') {
        const body = await getBody();
        const { trainId = '22436', date = '2026-09-25', seatId = 'C1-14', concurrentUsers = 8 } = body;
        const lockKey = `seat_lock:${trainId}:${date}:${seatId}`;
        const allocKey = `allocated:${trainId}:${date}:${seatId}`;

        redisLocks.delete(lockKey);
        postgresAllocatedSeats.delete(allocKey);

        const results: any[] = [];
        const promises = Array.from({ length: concurrentUsers }).map(async (_, idx) => {
          const userId = `concurrent-user-${idx + 1}`;
          const start = Date.now();
          const existing = redisLocks.get(lockKey);

          if (existing && existing.expiresAt > Date.now()) {
            results.push({
              userIndex: idx + 1,
              userId,
              lockStatus: 'CONFLICT_REJECTED',
              statusCode: 409,
              latencyMs: Math.floor(Math.random() * 8) + 2,
              message: 'Redis Distributed Lock: 409 Conflict (Key locked by user-1)'
            });
          } else {
            redisLocks.set(lockKey, {
              lockToken: `token_${Date.now()}`,
              seatId,
              userId,
              expiresAt: Date.now() + 60000
            });
            results.push({
              userIndex: idx + 1,
              userId,
              lockStatus: 'ACQUIRED',
              statusCode: 200,
              latencyMs: 2,
              message: 'Redis Distributed Lock: 200 OK (SET NX succeeded, TTL 60s)'
            });
          }
        });

        await Promise.all(promises);

        const winner = results.find(r => r.lockStatus === 'ACQUIRED');
        const conflicts = results.filter(r => r.lockStatus === 'CONFLICT_REJECTED').length;

        return sendJson(200, {
          summary: {
            concurrencyLevel: concurrentUsers,
            targetSeat: seatId,
            winnerUserId: winner?.userId,
            successfulLocks: winner ? 1 : 0,
            rejectedConflicts: conflicts,
            dataIntegrityPreserved: winner && conflicts === concurrentUsers - 1,
            architectureRule: 'Redis SET NX EX + Postgres Unique Constraint: Exactly 1 acquired, N-1 rejected.'
          },
          drillResults: results
        });
      }

      // GET /api/bookings/events (RabbitMQ feed)
      if (pathname === '/api/bookings/events') {
        return sendJson(200, { events: rabbitMqEvents.slice(-30).reverse() });
      }

      // PAYMENT ROUTES
      if (pathname === '/api/payments/create' && method === 'POST') {
        const body = await getBody();
        const { bookingId, amount, forceFailure } = body;
        if (forceFailure) {
          return sendJson(402, {
            error: 'Card declined by issuing bank (Simulated failure)',
            transactionRef: `tx_failed_${Date.now()}`
          });
        }
        return sendJson(200, {
          success: true,
          paymentId: `pay-${Date.now()}`,
          transactionRef: `TXN-RAIL-${Date.now()}`,
          amount,
          status: 'SUCCESS'
        });
      }

      // NOTIFICATION ROUTES
      if (pathname === '/api/notifications' && method === 'GET') {
        return sendJson(200, { notifications: notificationHistory.slice(-20).reverse() });
      }

      // Fallback
      return sendJson(404, { error: 'API endpoint not found', pathname });
    })();
  };
}
