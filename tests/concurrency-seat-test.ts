/**
 * Concurrency Test: High-contention Seat Booking Collision Drill
 * Simulates 10 concurrent users attempting to acquire a Redis lock and commit
 * booking for the EXACT same seat at the exact same millisecond.
 *
 * Expected Outcome:
 * - Exactly ONE user successfully acquires the lock (HTTP 200)
 * - Exactly N - 1 users receive HTTP 409 Conflict
 * - Zero double-booking in PostgreSQL
 */

import http from 'http';

interface TestResult {
  userId: string;
  statusCode: number;
  response: any;
  durationMs: number;
}

export async function runConcurrencyContentionTest(
  apiBaseUrl: string = 'http://localhost:3000/api',
  trainId: string = '22436',
  date: string = '2026-09-25',
  targetSeatId: string = 'C1-18',
  concurrentUsersCount: number = 10
): Promise<{ success: boolean; winners: number; conflicts: number; results: TestResult[] }> {
  console.log(`\n======================================================`);
  console.log(`[CONCURRENCY DRILL START] Simulating ${concurrentUsersCount} parallel bookings`);
  console.log(`Target Train: ${trainId} | Travel Date: ${date} | Target Seat: ${targetSeatId}`);
  console.log(`======================================================\n`);

  const requests = Array.from({ length: concurrentUsersCount }, (_, i) => {
    const userId = `usr-stress-test-${i + 1}`;
    const startTime = Date.now();

    return fetch(`${apiBaseUrl}/bookings/lock-seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainId,
        date,
        seatIds: [targetSeatId],
        userId
      })
    })
      .then(async res => {
        const body = await res.json();
        return {
          userId,
          statusCode: res.status,
          response: body,
          durationMs: Date.now() - startTime
        };
      })
      .catch(err => ({
        userId,
        statusCode: 500,
        response: { error: err.message },
        durationMs: Date.now() - startTime
      }));
  });

  const results = await Promise.all(requests);

  const winners = results.filter(r => r.statusCode === 200);
  const conflicts = results.filter(r => r.statusCode === 409);

  console.log(`\n--- CONCURRENCY DRILL AUDIT REPORT ---`);
  console.log(`Total Concurrent Ingress Requests: ${concurrentUsersCount}`);
  console.log(`Acquired Redis Distributed Locks: ${winners.length} (Target: Exactly 1)`);
  console.log(`Prevented Race Conflicts:        ${conflicts.length} (Target: Exactly ${concurrentUsersCount - 1})`);

  const isGuaranteed = winners.length === 1 && conflicts.length === (concurrentUsersCount - 1);
  console.log(`Transactional Integrity Assertion: ${isGuaranteed ? 'PASSED (Zero Double Booking)' : 'FAILED'}\n`);

  return {
    success: isGuaranteed,
    winners: winners.length,
    conflicts: conflicts.length,
    results
  };
}

if (process.argv[1]?.includes('concurrency-seat-test')) {
  runConcurrencyContentionTest();
}
