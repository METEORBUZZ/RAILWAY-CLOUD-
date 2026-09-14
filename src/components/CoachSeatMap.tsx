import React, { useState, useEffect } from 'react';
import { Lock, Check, ShieldAlert, Zap, Clock, Info, ShieldCheck } from 'lucide-react';
import { Coach, Seat, SelectedSeatState } from '../types';

interface CoachSeatMapProps {
  coach: Coach;
  travelDate: string;
  selectedSeats: SelectedSeatState[];
  onToggleSeat: (seat: Seat, coach: Coach) => void;
  redisLockActive: boolean;
  lockExpiresAt: string | null;
  onAcquireLockClick: () => void;
  isLocking: boolean;
}

export const CoachSeatMap: React.FC<CoachSeatMapProps> = ({
  coach,
  travelDate,
  selectedSeats,
  onToggleSeat,
  redisLockActive,
  lockExpiresAt,
  onAcquireLockClick,
  isLocking
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!lockExpiresAt) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(lockExpiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // Group seats into rows of 4 or 5 according to layout
  const rows: Seat[][] = [];
  const itemsPerRow = coach.coachClass === 'EC' || coach.coachClass === '1A' ? 4 : 5;

  const totalSeats = coach?.totalSeats || 50;
  const seatsList: Seat[] = (coach?.seats && coach.seats.length > 0)
    ? coach.seats
    : Array.from({ length: totalSeats }, (_, idx) => {
        const seatNum = idx + 1;
        const berthTypesCC = ['WINDOW', 'MIDDLE', 'AISLE', 'AISLE', 'WINDOW'];
        const berthTypesEC = ['WINDOW', 'AISLE', 'AISLE', 'WINDOW'];
        const berthTypesSleeper = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];
        const pool = (coach.coachClass === 'EC' || coach.coachClass === '1A')
          ? berthTypesEC
          : (coach.coachClass === 'CC' ? berthTypesCC : berthTypesSleeper);
        return {
          id: `${coach.coachCode}-${seatNum}`,
          seatNumber: seatNum,
          berthType: pool[(seatNum - 1) % pool.length],
          isBooked: seatNum === 3 || seatNum === 14 || seatNum === 27,
          isLocked: seatNum === 7
        };
      });

  for (let i = 0; i < seatsList.length; i += itemsPerRow) {
    rows.push(seatsList.slice(i, i + itemsPerRow));
  }

  const getSeatStatus = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seatId === `${coach.coachCode}-${seat.seatNumber}`);
    if (isSelected) return 'SELECTED';
    if (seat.isBooked) return 'BOOKED_POSTGRES';
    if (seat.isLocked) return 'LOCKED_REDIS';
    return 'AVAILABLE';
  };

  const getSeatStyles = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400';
      case 'BOOKED_POSTGRES':
        return 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60';
      case 'LOCKED_REDIS':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-300 cursor-not-allowed animate-pulse';
      case 'AVAILABLE':
      default:
        return 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200 cursor-pointer';
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
      {/* Header with Coach info & Lock Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-base sm:text-lg font-bold text-white">
              Coach {coach.coachCode}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {coach.coachClass} Class
            </span>
            <span className="text-xs text-slate-400">
              Total Seats: {coach.totalSeats}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Click available seats to choose your spots. Seats are temporarily held for 10 minutes during checkout.
          </p>
        </div>

        {/* Lock Timer / Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {redisLockActive && timeLeft !== null && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
              <span className="hidden xs:inline">Seats Held: </span>
              <span className="font-mono font-bold text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {selectedSeats.length > 0 && !redisLockActive && (
            <button
              id="btn-acquire-redis-lock"
              onClick={onAcquireLockClick}
              disabled={isLocking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLocking ? 'Holding...' : `Hold Seats (${selectedSeats.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-3 sm:py-4 text-[11px] sm:text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border bg-slate-900 border-slate-700 shrink-0" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border bg-blue-600 border-blue-400 shrink-0" />
          <span className="text-blue-300 font-semibold">Your Selection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border bg-amber-500/20 border-amber-500/50 text-amber-300 shrink-0" />
          <span className="text-amber-300">Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border bg-slate-800 border-slate-700 shrink-0" />
          <span className="text-slate-500">Occupied</span>
        </div>
      </div>

      {/* Coach Layout Body */}
      <div className="py-4 sm:py-6 overflow-x-auto w-full">
        <div className="w-full max-w-2xl mx-auto border sm:border-2 border-slate-700/80 rounded-2xl p-3 sm:p-6 bg-slate-950/70 relative">
          {/* Coach Front Nose / Direction */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 border-b border-slate-800 text-[10px] sm:text-xs text-slate-500 font-mono">
            <span>ENGINE ◄</span>
            <span className="font-bold text-slate-300">COACH {coach.coachCode}</span>
            <span>REAR ►</span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {rows.map((row, rowIdx) => {
              // 3 seats on left, aisle, 2 seats on right (or 2 and 2)
              const leftSeats = row.slice(0, coach.coachClass === 'EC' ? 2 : 3);
              const rightSeats = row.slice(coach.coachClass === 'EC' ? 2 : 3);

              return (
                <div key={`row-${rowIdx}`} className="flex items-center justify-between gap-2 sm:gap-6">
                  {/* Left Bay */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {leftSeats.map((seat) => {
                      const status = getSeatStatus(seat);
                      const isClickable = status === 'AVAILABLE' || status === 'SELECTED';

                      return (
                        <button
                          key={seat.id}
                          id={`seat-btn-${coach.coachCode}-${seat.seatNumber}`}
                          disabled={!isClickable}
                          onClick={() => onToggleSeat(seat, coach)}
                          title={`Seat ${seat.seatNumber} (${seat.berthType})`}
                          className={`w-8 h-8 sm:w-10 sm:h-9 md:w-11 md:h-10 rounded-md sm:rounded-lg border flex flex-col items-center justify-center font-mono transition-all ${getSeatStyles(status)}`}
                        >
                          <span className="font-bold text-[9px] sm:text-[11px] leading-tight">
                            {seat.seatNumber}
                          </span>
                          <span className="text-[7px] sm:text-[8px] opacity-75 leading-tight">
                            {seat.berthType.slice(0, 2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="h-6 sm:h-8 border-r border-dashed border-slate-800 flex items-center justify-center px-1 sm:px-2">
                    <span className="text-[8px] sm:text-[10px] text-slate-600 font-mono rotate-90">AISLE</span>
                  </div>

                  {/* Right Bay */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {rightSeats.map((seat) => {
                      const status = getSeatStatus(seat);
                      const isClickable = status === 'AVAILABLE' || status === 'SELECTED';

                      return (
                        <button
                          key={seat.id}
                          id={`seat-btn-${coach.coachCode}-${seat.seatNumber}`}
                          disabled={!isClickable}
                          onClick={() => onToggleSeat(seat, coach)}
                          title={`Seat ${seat.seatNumber} (${seat.berthType})`}
                          className={`w-8 h-8 sm:w-10 sm:h-9 md:w-11 md:h-10 rounded-md sm:rounded-lg border flex flex-col items-center justify-center font-mono transition-all ${getSeatStyles(status)}`}
                        >
                          <span className="font-bold text-[9px] sm:text-[11px] leading-tight">
                            {seat.seatNumber}
                          </span>
                          <span className="text-[7px] sm:text-[8px] opacity-75 leading-tight">
                            {seat.berthType.slice(0, 2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
