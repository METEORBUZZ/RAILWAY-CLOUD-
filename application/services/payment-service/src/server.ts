import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// Interface abstraction for Payment Gateway
interface IPaymentGateway {
  name: string;
  processPayment(amount: number, currency: string, metadata: any): Promise<{ success: boolean; transactionRef: string; error?: string }>;
}

// Production-ready Mock Payment Gateway Implementation
class MockPaymentGateway implements IPaymentGateway {
  name = 'MockRailwayGateway';

  async processPayment(amount: number, currency: string, metadata: any) {
    // Latency simulation (200-500ms)
    await new Promise(r => setTimeout(r, 200));

    if (metadata?.forceFailure) {
      return {
        success: false,
        transactionRef: `tx_failed_${uuidv4().substring(0, 8)}`,
        error: 'Card declined by issuing bank (Simulated Test Failure)'
      };
    }

    return {
      success: true,
      transactionRef: `tx_rail_${Date.now()}_${uuidv4().substring(0, 6)}`
    };
  }
}

const paymentGateway = new MockPaymentGateway();
const paymentLedger = new Map<string, any>();
const idempotencyStore = new Map<string, any>();

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'payment-service',
    activeGateway: paymentGateway.name,
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP payment_transactions_total Total payment transactions
payment_transactions_total{status="SUCCESS"} ${Array.from(paymentLedger.values()).filter(p => p.status === 'SUCCESS').length}
payment_transactions_total{status="FAILED"} ${Array.from(paymentLedger.values()).filter(p => p.status === 'FAILED').length}
`);
});

// POST /api/payments/create
app.post('/api/payments/create', async (req: Request, res: Response) => {
  const { bookingId, amount, currency = 'INR', idempotencyKey = uuidv4(), paymentMethod = 'CARD', forceFailure = false } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: 'Missing bookingId or amount' });
  }

  // Idempotency check
  if (idempotencyStore.has(idempotencyKey)) {
    console.log(`[Payment:IdempotencyHit] Duplicate payment avoided for key: ${idempotencyKey}`);
    return res.status(200).json(idempotencyStore.get(idempotencyKey));
  }

  const result = await paymentGateway.processPayment(amount, currency, { bookingId, forceFailure });

  const paymentRecord = {
    paymentId: `pay-${uuidv4()}`,
    bookingId,
    amount,
    currency,
    paymentMethod,
    status: result.success ? 'SUCCESS' : 'FAILED',
    transactionRef: result.transactionRef,
    errorMessage: result.error || null,
    idempotencyKey,
    createdAt: new Date().toISOString()
  };

  paymentLedger.set(paymentRecord.paymentId, paymentRecord);
  idempotencyStore.set(idempotencyKey, paymentRecord);

  if (!result.success) {
    return res.status(402).json({
      error: 'Payment failed',
      payment: paymentRecord
    });
  }

  return res.status(200).json({
    message: 'Payment processed successfully',
    payment: paymentRecord
  });
});

// POST /api/payments/verify
app.post('/api/payments/verify', (req: Request, res: Response) => {
  const { paymentId, transactionRef } = req.body;
  const payment = paymentLedger.get(paymentId);
  if (!payment || payment.transactionRef !== transactionRef) {
    return res.status(404).json({ error: 'Payment verification failed: Invalid transaction reference' });
  }
  return res.json({ verified: true, payment });
});

// GET /api/payments/:id
app.get('/api/payments/:id', (req: Request, res: Response) => {
  const payment = paymentLedger.get(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  return res.json({ payment });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`[payment-service] Running on port ${PORT}`));
}

export default app;
