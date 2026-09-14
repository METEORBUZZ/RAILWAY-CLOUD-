import React from 'react';
import { Clock, ArrowRight, ShieldCheck, Zap, Info, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Radio } from 'lucide-react';
import { Train } from '../types';

interface TrainCardProps {
  train: Train;
  travelDate: string;
  selectedClass: string;
  onSelectTrainAndClass: (train: Train, coachClass: string) => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({
  train,
  travelDate,
  selectedClass,
  onSelectTrainAndClass
}) => {
  const isCancelled = train.status === 'CANCELLED';
  const isDelayed = train.status === 'DELAYED';
  const currentStatus = train.status || 'ON_TIME';

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'VANDE_BHARAT':
        return 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border-blue-500/40';
      case 'RAJDHANI':
        return 'bg-gradient-to-r from-red-600/30 to-rose-600/30 text-rose-300 border-rose-500/40';
      case 'SHATABDI':
        return 'bg-gradient-to-r from-cyan-600/30 to-teal-600/30 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getAvailabilityColor = (avail: number) => {
    if (avail > 15) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (avail > 0) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-slate-700 p-3.5 sm:p-5 transition-all shadow-lg hover:shadow-xl w-full max-w-full overflow-hidden">
      {/* Top row: Train Number, Name & Type */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs sm:text-sm shrink-0">
            #{train.trainNumber}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
              {train.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-slate-400">
              <span>Runs: {((train as any).runningDays || train.runsOnDays || ['MON', 'WED', 'FRI']).join(', ')}</span>
              <span>•</span>
              <span>{(train as any).averageSpeedKmH || (train.type === 'VANDE_BHARAT' ? 130 : 110)} km/h</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Train Status Badge */}
          <span
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1.5 ${
              currentStatus === 'ON_TIME'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : isDelayed
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : isCancelled
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {currentStatus === 'ON_TIME' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : isDelayed ? (
              <Clock className="w-3 h-3" />
            ) : isCancelled ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <Radio className="w-3 h-3" />
            )}
            <span>
              {currentStatus === 'ON_TIME'
                ? 'On Time'
                : isDelayed
                ? `Delayed (+${train.delayMinutes || 15}m)`
                : isCancelled
                ? 'Cancelled'
                : currentStatus}
            </span>
          </span>

          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getBadgeStyle(train.type || 'SUPERFAST')}`}>
            {(train.type || 'EXPRESS').replace('_', ' ')}
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] bg-slate-800 text-slate-400 border border-slate-700">
            {train.coaches?.length || 0} Coaches
          </span>
        </div>
      </div>

      {/* Admin Broadcast Notice if active */}
      {train.statusRemark && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2 text-[11px] text-amber-300/90">
          <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-400">Notice:</span>
          <span className="truncate">{train.statusRemark}</span>
        </div>
      )}

      {/* Middle row: Station Timelines */}
      <div className="grid grid-cols-3 items-center py-4 sm:py-5 gap-2">
        <div className="min-w-0">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight block">
            {train.departureTime || '06:00'}
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 truncate" title={(train as any).originName || train.originStation?.name}>
            {(train as any).originName || train.originStation?.name || (train as any).originCode || 'Origin'}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">
            ({(train as any).originCode || train.originStation?.code || 'ORIG'}) • Pf {(train as any).platform || 1}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center px-1 sm:px-4 text-center min-w-0">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 mb-1">
            <Clock className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="truncate">{train.duration || '8h 00m'}</span>
          </div>
          <div className="w-full flex items-center gap-1">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 ring-2 sm:ring-4 ring-blue-500/20" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
            {isCancelled ? 'Service Cancelled' : isDelayed ? `Revised Pf ${(train as any).platform || 1}` : 'Direct Express'}
          </span>
        </div>

        <div className="text-right min-w-0">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight block">
            {train.arrivalTime || '14:00'}
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 truncate" title={(train as any).destName || train.destinationStation?.name}>
            {(train as any).destName || train.destinationStation?.name || (train as any).destCode || 'Destination'}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">
            ({(train as any).destCode || train.destinationStation?.code || 'DEST'})
          </p>
        </div>
      </div>

      {/* Bottom row: Coach Class Cards with Live Availability */}
      {isCancelled ? (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
          Ticket reservations suspended: This service is temporarily cancelled by Railway Operations.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 pt-2">
          {(train.coaches || []).map((coach: any) => {
            const avail = coach.availableSeats ?? Math.floor((coach.totalSeats || 72) * 0.45);
            const isSelected = selectedClass === coach.coachClass;
            const fare = coach.fare ?? coach.baseFare ?? 1500;

            return (
              <div
                key={coach.id || coach.coachCode}
                onClick={() => onSelectTrainAndClass(train, coach.coachClass)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100">
                    {coach.coachCode}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {coach.coachClass}
                  </span>
                </div>

                <div className="my-2">
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded border inline-block ${getAvailabilityColor(avail)}`}>
                    {avail > 0 ? `AVL ${avail}` : 'WL 8'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-400">Fare</span>
                  <span className="font-bold text-white">₹{fare}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
