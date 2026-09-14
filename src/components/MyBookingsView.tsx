import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Train,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Booking } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onViewTicket,
  onCancelBooking,
  isCancelling
}) => {
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            My Railway Bookings
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            View allocated seats, download tickets, or process refunds
          </p>
        </div>
        <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          {bookings.length} Registered Booking{bookings.length === 1 ? '' : 's'}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Ticket className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-300">No Bookings Found</h3>
          <p className="text-xs text-slate-500">
            You haven't reserved any train journeys yet. Search trains to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {bookings.map((b) => {
            const isCancelled = b.bookingStatus === 'CANCELLED';

            return (
              <div
                key={b.id}
                className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3 sm:space-y-4 w-full overflow-hidden"
              >
                {/* Card Top */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                      <Train className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base truncate">
                          {b.trainName}
                        </span>
                        <span className="font-mono text-xs text-slate-400 shrink-0">
                          #{b.trainNumber}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        Booked on {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">PNR NUMBER</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-amber-400">{b.pnr}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${
                        isCancelled
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Stations & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-500 block">From</span>
                    <span className="text-sm sm:text-base font-bold text-slate-100 truncate block">{b.originStation.name}</span>
                    <span className="text-[11px] sm:text-xs text-slate-400 block">{b.departureTime} • {b.travelDate}</span>
                  </div>

                  <div className="text-left md:text-center text-[11px] sm:text-xs text-slate-400 py-1 md:py-0 border-y border-slate-800/50 md:border-0">
                    <ArrowRight className="hidden md:block w-4 h-4 mx-auto text-blue-400 mb-1" />
                    <span className="font-mono">Seats: {b.seats.map(s => `${s.coachCode}-${s.seatNumber}`).join(', ')}</span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] sm:text-xs text-slate-500 block">To</span>
                    <span className="text-sm sm:text-base font-bold text-slate-100 truncate block">{b.destinationStation.name}</span>
                    <span className="text-[11px] sm:text-xs text-slate-400 block">{b.arrivalTime} • {b.travelDate}</span>
                  </div>
                </div>

                {/* Card Footer actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-slate-400">Total Paid:</span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm">
                      ₹{b.fare.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {b.refundAmount && (
                      <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[11px] border border-rose-500/20">
                        Refunded: ₹{b.refundAmount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-view-ticket-${b.pnr}`}
                      onClick={() => onViewTicket(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30 transition-colors cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Ticket</span>
                    </button>

                    {!isCancelled && (
                      <button
                        id={`btn-cancel-modal-${b.pnr}`}
                        onClick={() => setSelectedBookingForCancel(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30 transition-colors cursor-pointer text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Cancel Booking #{selectedBookingForCancel.pnr}?
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Cancellation will immediately release your allocated seats ({selectedBookingForCancel.seats.map(s => `${s.coachCode}-${s.seatNumber}`).join(', ')}) and initiate an 80% refund of the fare.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Original Fare:</span>
                <span>₹{selectedBookingForCancel.fare.totalAmount}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold">
                <span>Estimated Refund (80%):</span>
                <span>₹{Math.round(selectedBookingForCancel.fare.totalAmount * 0.8)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                id="btn-confirm-cancel-ticket"
                disabled={isCancelling}
                onClick={async () => {
                  await onCancelBooking(selectedBookingForCancel.id);
                  setSelectedBookingForCancel(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
