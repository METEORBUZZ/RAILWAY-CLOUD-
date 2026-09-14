import React, { useState } from 'react';
import {
  Ticket,
  Search,
  Users,
  Train,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  FileText,
  DollarSign
} from 'lucide-react';
import { Booking } from '../types';

interface AdminBookingsViewProps {
  bookings: Booking[];
}

export const AdminBookingsView: React.FC<AdminBookingsViewProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const pnrMatch = b.pnr?.toLowerCase().includes(q);
    const trainMatch = b.trainName?.toLowerCase().includes(q) || b.trainNumber?.toLowerCase().includes(q);
    const passengerMatch = b.seats?.some(s => s.passengerName?.toLowerCase().includes(q));
    const stationMatch =
      ((b.originStation as any)?.name?.toLowerCase()?.includes(q)) ||
      ((b.destinationStation as any)?.name?.toLowerCase()?.includes(q));

    return pnrMatch || trainMatch || passengerMatch || stationMatch;
  });

  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.bookingStatus === 'CONFIRMED') {
      return sum + (b.fare?.totalAmount || 0);
    }
    return sum;
  }, 0);

  const confirmedCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const cancelledCount = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-full">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shadow-md shrink-0">
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
              Central Passenger Reservations Manifest
            </h2>
            <p className="text-xs text-slate-300">
              Network-wide booking ledger, PNR audit logs, seat occupancy, and revenue reconciliation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold">
            {bookings.length} Total Bookings
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Gross Ticket Revenue</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Confirmed transactions</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Confirmed Reservations</span>
          <p className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{confirmedCount}</p>
          <span className="text-[10px] text-blue-400/80">Active electronic tickets</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Cancelled / Refunded</span>
          <p className="text-xl sm:text-2xl font-black text-slate-400 font-mono">{cancelledCount}</p>
          <span className="text-[10px] text-rose-400/80">Returned to seat pool</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter bookings by PNR, train name, number, or passenger name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Reservations Found</h4>
            <p className="text-xs text-slate-500">
              {searchTerm ? 'No tickets match the search query.' : 'No passenger bookings have been recorded yet.'}
            </p>
          </div>
        ) : (
          filtered.map((b) => {
            const isConfirmed = b.bookingStatus === 'CONFIRMED';

            return (
              <div
                key={b.id || b.pnr}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      PNR: {b.pnr}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      #{b.trainNumber} {b.trainName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{b.bookingStatus}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                      ₹{b.fare?.totalAmount || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Route</span>
                    <span className="text-slate-200 font-medium">
                      {(b.originStation as any)?.name || (b.originStation as any)?.code || 'Origin'} →{' '}
                      {(b.destinationStation as any)?.name || (b.destinationStation as any)?.code || 'Dest'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Travel Date & Time</span>
                    <span className="text-slate-200 font-medium">
                      {b.travelDate} ({b.departureTime})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Reserved Seats</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {b.seats?.map((seat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800"
                        >
                          {seat.coachCode}-{seat.seatNumber} ({seat.passengerName || 'Traveller'})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
