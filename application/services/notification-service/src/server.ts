import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

interface NotificationLog {
  id: string;
  type: string;
  recipientEmail: string;
  title: string;
  content: string;
  status: 'SENT' | 'FAILED' | 'RETRYING';
  retryCount: number;
  timestamp: string;
}

const notificationsHistory: NotificationLog[] = [];

// Dead Letter Queue (DLQ) simulation store
const deadLetterQueue: Array<{ payload: any; reason: string; timestamp: string }> = [];

// Template builder
function generateEmailContent(type: string, data: any): { title: string; content: string } {
  switch (type) {
    case 'BOOKING_CONFIRMED':
      return {
        title: `RailCloud: Booking Confirmed (PNR: ${data.pnr})`,
        content: `Dear Passenger, your train reservation for PNR ${data.pnr} is CONFIRMED. Seats: ${data.seats || 'Assigned'}. Have a safe journey!`
      };
    case 'PAYMENT_SUCCESS':
      return {
        title: `RailCloud: Payment Receipt for PNR ${data.pnr}`,
        content: `Payment of ₹${data.amount} via ${data.paymentMethod || 'Online'} was successfully received. Ref: ${data.transactionRef}.`
      };
    case 'BOOKING_CANCELLED':
      return {
        title: `RailCloud: Booking Cancelled (PNR: ${data.pnr})`,
        content: `Your reservation for PNR ${data.pnr} has been cancelled. Refund of ₹${data.refundAmount} has been initiated to your original payment method.`
      };
    case 'PAYMENT_FAILED':
      return {
        title: `RailCloud: Payment Failed Alert`,
        content: `Your transaction for Booking ${data.bookingId} could not be completed. Your temporary seat lock will expire in 10 minutes unless retry succeeds.`
      };
    default:
      return {
        title: `RailCloud System Notification`,
        content: JSON.stringify(data)
      };
  }
}

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'notification-service',
    sentCount: notificationsHistory.length,
    dlqCount: deadLetterQueue.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP notifications_sent_total Total notifications sent
notifications_sent_total ${notificationsHistory.length}
# HELP dead_letter_queue_messages Current messages in dead letter exchange
dead_letter_queue_messages ${deadLetterQueue.length}
`);
});

// POST /api/notifications/email
app.post('/api/notifications/email', (req: Request, res: Response) => {
  const { type, recipientEmail, recipientPhone, data = {} } = req.body;

  if (!type || !recipientEmail) {
    return res.status(400).json({ error: 'Missing type or recipientEmail' });
  }

  const { title, content } = generateEmailContent(type, data);

  const log: NotificationLog = {
    id: `notif-${uuidv4()}`,
    type,
    recipientEmail,
    title,
    content,
    status: 'SENT',
    retryCount: 0,
    timestamp: new Date().toISOString()
  };

  notificationsHistory.push(log);
  console.log(`[Notification:Dispatched] ${type} sent to ${recipientEmail}`);

  return res.status(201).json({
    message: 'Notification queued and sent via async worker',
    notification: log
  });
});

// GET /api/notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  return res.json({
    notifications: notificationsHistory.slice(-50).reverse(),
    deadLetterQueue
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`[notification-service] Running on port ${PORT}`));
}

export default app;
