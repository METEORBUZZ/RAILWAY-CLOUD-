import React from 'react';
import { Receipt, ShieldCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { SelectedSeatState, Train } from '../types';

interface FareBreakdownProps {
  train: Train;
  coachClass: string;
  selectedSeats: SelectedSeatState[];
  onProceedToPayment: () => void;
  canProceed: boolean;
}

export const FareBreakdown: React.FC<FareBreakdownProps> = ({
  train,
  coachClass,
  selectedSeats,
  onProceedToPayment,
  canProceed
}) => {
  const count = selectedSeats.length || 1;
  const baseRate = coachClass === 'EC' ? 3300 : coachClass === '1A' ? 4850 : coachClass === '2A' ? 2950 : coachClass === '3A' ? 2080 : 1750;

  const baseFare = baseRate * count;
  const reservationFee = 40 * count;
  const superfastCharge = 45 * count;
  const gstAmount = Math.round(baseFare * 0.05);
  const travelInsurance = Number((0.49 * count).toFixed(2));
  const totalAmount = baseFare + reservationFee + superfastCharge + gstAmount + travelInsurance;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800">
        <Receipt className="w-5 h-5 text-blue-400 shrink-0" />
        <h3 className="text-sm sm:text-base font-bold text-white">Itemized Fare Breakdown</h3>
      </div>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-slate-300">
          <span className="truncate pr-2">Base Fare ({count} × ₹{baseRate})</span>
          <span className="font-mono font-medium shrink-0">₹{baseFare.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="truncate pr-2">Reservation Service Charge</span>
          <span className="font-mono shrink-0">₹{reservationFee}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="truncate pr-2">Superfast Express Surcharge</span>
          <span className="font-mono shrink-0">₹{superfastCharge}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="truncate pr-2">GST (5% Ministry of Railways)</span>
          <span className="font-mono shrink-0">₹{gstAmount}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="truncate pr-2">Travel Insurance (₹0.49/traveller)</span>
          <span className="font-mono shrink-0">₹{travelInsurance}</span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-sm sm:text-base font-bold text-white">Total Payable Amount</span>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Includes all taxes and surcharges</p>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-400 font-mono">
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <button
        id="btn-proceed-payment"
        type="button"
        disabled={!canProceed || selectedSeats.length === 0}
        onClick={onProceedToPayment}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>Proceed to Secure Payment</span>
        <ArrowRight className="w-4 h-4 shrink-0" />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 pt-1 text-center">
        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
        <span>PCI-DSS & 256-bit SSL Bank Grade Encryption</span>
      </div>
    </div>
  );
};
