// k6 Load Testing Script for Cloud-Native Railway Booking Platform
// Tests autoscaling threshold from 2 pods up to 10 pods under heavy load

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Normal baseline: 2 Pods
    { duration: '1m',  target: 100 }, // Ramp-up: Trigger HPA scaling to 5 Pods
    { duration: '2m',  target: 300 }, // Peak rush traffic: Scale up to 10 Pods
    { duration: '30s', target: 0 },   // Cool down: Verify scale-down stabilization
  ],
  thresholds: {
    http_req_duration: ['p(95)<350'], // 95% of requests must complete below 350ms
    http_req_failed: ['rate<0.01'],    // Error rate must remain below 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000/api';

export default function () {
  // 1. Train Search
  const searchRes = http.get(`${BASE_URL}/trains/search?from=NDLS&to=BSB&date=2026-09-20&class=CC`);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
  });

  // 2. Train Details & Schedule
  const detailsRes = http.get(`${BASE_URL}/trains/22436`);
  check(detailsRes, {
    'details status 200': (r) => r.status === 200,
  });

  // 3. Health check probe
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  });

  sleep(1);
}
