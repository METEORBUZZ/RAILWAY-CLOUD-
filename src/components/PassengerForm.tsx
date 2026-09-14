import React from 'react';
import { User, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { SelectedSeatState } from '../types';

interface PassengerFormProps {
  seats: SelectedSeatState[];
  onUpdatePassenger: (seatId: string, field: string, value: any) => void;
  onRemoveSeat: (seatId: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  seats,
  onUpdatePassenger,
  onRemoveSeat,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">Passenger Details</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Enter traveller details matching government-issued photo ID
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          {seats.length} Traveller{seats.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Passenger rows */}
      <div className="space-y-3 sm:space-y-4">
        {seats.map((seat, index) => (
          <div
            key={seat.seatId}
            className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Seat {seat.coachCode}-{seat.seatNumber} ({seat.berthType})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveSeat(seat.seatId)}
                title="Remove passenger"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 sm:gap-3">
              {/* Full Name */}
              <div className="col-span-2 sm:col-span-5">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={seat.passengerName || ''}
                  onChange={(e) => onUpdatePassenger(seat.seatId, 'passengerName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Age */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Age"
                  value={seat.passengerAge || ''}
                  onChange={(e) => onUpdatePassenger(seat.seatId, 'passengerAge', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Gender */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  value={seat.passengerGender || 'MALE'}
                  onChange={(e) => onUpdatePassenger(seat.seatId, 'passengerGender', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Berth Preference */}
              <div className="col-span-2 sm:col-span-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Preference
                </label>
                <select
                  value={seat.berthPreference || seat.berthType}
                  onChange={(e) => onUpdatePassenger(seat.seatId, 'berthPreference', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="WINDOW">Window Seat</option>
                  <option value="AISLE">Aisle Seat</option>
                  <option value="LOWER">Lower Berth</option>
                  <option value="UPPER">Upper Berth</option>
                  <option value="NO_PREFERENCE">No Preference</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="pt-3.5 sm:pt-4 border-t border-slate-800 space-y-3">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-200">Contact & Ticket Dispatch Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email Address (For e-ticket PDF & notifications)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Mobile Number (For PNR SMS update)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
