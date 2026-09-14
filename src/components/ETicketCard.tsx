import React from 'react';
import {
  Train as TrainIcon,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  FileText
} from 'lucide-react';
import { Booking } from '../types';

interface ETicketCardProps {
  booking: Booking;
  onDownloadTicket?: () => void;
  onBookAnother?: () => void;
}

export const ETicketCard: React.FC<ETicketCardProps> = ({
  booking,
  onDownloadTicket,
  onBookAnother
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 w-full max-w-full overflow-hidden">
      {/* Confirmation Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Booking Confirmed & Seat Allocated
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-300/90 break-all">
              E-Ticket dispatched to{' '}
              <span className="font-mono underline">{booking.contactEmail}</span>
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block shrink-0">
          <span className="text-xs text-slate-400">Status</span>
          <p className="text-sm font-bold text-emerald-400">CONFIRMED</p>
        </div>
      </div>

      {/* Realistic Railway E-Ticket Card */}
      <div className="bg-slate-900 border sm:border-2 border-slate-700/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative w-full">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <TrainIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white truncate">
                  {booking.trainName}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30 shrink-0">
                  #{booking.trainNumber}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Indian Railways Electronic Reservation Slip (ERS)
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider block">
              Passenger Name Record (PNR)
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono tracking-wider">
              {booking.pnr}
            </span>
          </div>
        </div>

        {/* Train Schedule Timeline */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>DEPARTURE</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {booking.departureTime}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 truncate">
                {booking.originStation.name} ({booking.originStation.code})
              </p>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{booking.travelDate}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-2 md:py-0">
              <span className="text-xs text-slate-400">Direct Express</span>
              <div className="w-full flex items-center gap-2 my-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <TrainIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Class: {booking.seats[0]?.coachClass || 'CC'}</span>
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-center justify-start md:justify-end gap-1.5 text-xs text-emerald-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>ARRIVAL</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {booking.arrivalTime}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 truncate">
                {booking.destinationStation.name} ({booking.destinationStation.code})
              </p>
              <div className="flex items-center justify-start md:justify-end gap-1 text-[11px] sm:text-xs text-slate-400 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{booking.travelDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Seats Table */}
        <div className="p-3.5 sm:p-6 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Confirmed Passenger Allocation
          </h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap min-w-[420px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] sm:text-xs text-slate-400">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-2">Passenger Name</th>
                  <th className="pb-2 pr-2">Age / Gender</th>
                  <th className="pb-2 pr-2">Coach</th>
                  <th className="pb-2 pr-2">Seat No</th>
                  <th className="pb-2 pr-2">Berth</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {booking.seats.map((seat, i) => (
                  <tr key={seat.id || i} className="hover:bg-slate-800/30">
                    <td className="py-2.5 pr-2 text-slate-500">{i + 1}</td>
                    <td className="py-2.5 pr-2 font-sans font-medium text-slate-200">
                      {seat.passengerName}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-400">
                      {seat.passengerAge} / {seat.passengerGender}
                    </td>
                    <td className="py-2.5 pr-2 text-blue-400 font-bold">
                      {seat.coachCode}
                    </td>
                    <td className="py-2.5 pr-2 text-white font-bold">
                      {seat.seatNumber}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-300">
                      {seat.berthType}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">
                      CNF / {seat.coachCode}-{seat.seatNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code & Total Paid */}
        <div className="p-4 sm:p-6 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Digital Verification QR
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 max-w-[220px]">
                Scan with TTE handheld terminal to validate digital identity and seat assignment.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] sm:text-xs text-slate-400">Total Fare Paid</span>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{booking.fare.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
              Payment Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          onClick={onBookAnother}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
        >
          Book Another Journey
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Print / Save E-Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
