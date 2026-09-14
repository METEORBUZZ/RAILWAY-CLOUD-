import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Lock,
  X,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmPayment: (simulateFailure: boolean) => Promise<void>;
  isProcessing: boolean;
  idempotencyKey: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirmPayment,
  isProcessing,
  idempotencyKey
}) => {
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment(simulateFailure);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Payment Gateway</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              RailCloud Secure Microservices Payment Service
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Idempotency Key Ribbon */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Idempotency Key:</span>
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] text-blue-400 truncate max-w-[180px] sm:max-w-[200px]">
            {idempotencyKey}
          </span>
        </div>

        {/* Method Switcher */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMethod('UPI')}
            className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              method === 'UPI'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="truncate">UPI</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('CARD')}
            className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              method === 'CARD'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="truncate">Card</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('NETBANKING')}
            className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              method === 'NETBANKING'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span className="truncate">Netbank</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('WALLET')}
            className={`p-2 sm:p-3 rounded-xl border flex flex-col items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              method === 'WALLET'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="truncate">Wallet</span>
          </button>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'UPI' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="w-24 h-24 mx-auto bg-white rounded-lg p-2 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <p className="text-xs text-slate-400">
                Scan QR using any UPI app (GPay, PhonePe, Paytm, BHIM)
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-center text-slate-200"
                />
              </div>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    defaultValue="09/28"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    defaultValue="824"
                    maxLength={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">Select Bank</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
              </select>
            </div>
          )}

          {method === 'WALLET' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">RailCloud Cash Wallet</p>
                <p className="text-xs text-slate-400">Available Balance: ₹2,450.00</p>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                Instant Debit
              </span>
            </div>
          )}

          {/* Test Scenario Toggle: Simulate Failure */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  DevSecOps Failure Drill
                </p>
                <p className="text-[11px] text-amber-400/80">
                  Simulate bank 402 decline & compensation
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-confirm-pay"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                simulateFailure
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
              } disabled:opacity-50`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Payment via Payment Service...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Pay ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
