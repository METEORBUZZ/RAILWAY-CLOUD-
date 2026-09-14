import React, { useState } from 'react';
import {
  Train as TrainIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Radio,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  User
} from 'lucide-react';
import { Train, Station, Coach, TrainOperationalStatus } from '../types';
import { generateSeatsForCoach } from '../data/initialData';

interface AdminTrainManagementProps {
  trains: Train[];
  stations: Station[];
  currentUser: any;
  onUpdateTrain: (updatedTrain: Train) => void;
  onAddTrain: (newTrain: Train) => void;
  onDeleteTrain: (trainId: string) => void;
  showAlert: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminTrainManagement: React.FC<AdminTrainManagementProps> = ({
  trains,
  stations,
  currentUser,
  onUpdateTrain,
  onAddTrain,
  onDeleteTrain,
  showAlert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrainOperationalStatus>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusModalTrain, setStatusModalTrain] = useState<Train | null>(null);
  const [editModalTrain, setEditModalTrain] = useState<Train | null>(null);
  const [deleteConfirmTrain, setDeleteConfirmTrain] = useState<Train | null>(null);

  // Status Modal Form State
  const [newStatus, setNewStatus] = useState<TrainOperationalStatus>('ON_TIME');
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [platformNumber, setPlatformNumber] = useState<string>('1');
  const [statusRemark, setStatusRemark] = useState<string>('');

  // Add Train Form State
  const [formTrainNumber, setFormTrainNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('VANDE_BHARAT');
  const [formOriginCode, setFormOriginCode] = useState(stations[0]?.code || 'NDLS');
  const [formOriginName, setFormOriginName] = useState(stations[0]?.name || 'New Delhi');
  const [formDestCode, setFormDestCode] = useState(stations[1]?.code || 'BSB');
  const [formDestName, setFormDestName] = useState(stations[1]?.name || 'Varanasi');
  const [formDepartureTime, setFormDepartureTime] = useState('06:00');
  const [formArrivalTime, setFormArrivalTime] = useState('14:00');
  const [formDuration, setFormDuration] = useState('8h 00m');
  const [formPlatform, setFormPlatform] = useState('1');
  const [formPantry, setFormPantry] = useState(true);
  const [formRunningDays, setFormRunningDays] = useState<string[]>([
    'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
  ]);
  const [formCoachPreset, setFormCoachPreset] = useState<string>('VANDE_BHARAT');

  // Open status modal
  const handleOpenStatusModal = (train: Train) => {
    setStatusModalTrain(train);
    setNewStatus(train.status || 'ON_TIME');
    setDelayMinutes(train.delayMinutes || 0);
    setPlatformNumber(train.platform || '1');
    setStatusRemark(train.statusRemark || '');
  };

  // Submit status update
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalTrain) return;

    const updated: Train = {
      ...statusModalTrain,
      status: newStatus,
      delayMinutes: newStatus === 'DELAYED' ? Number(delayMinutes) : 0,
      platform: platformNumber,
      statusRemark: statusRemark.trim() || (newStatus === 'ON_TIME' ? 'Service operating on schedule' : undefined)
    };

    onUpdateTrain(updated);
    setStatusModalTrain(null);
    showAlert('success', `Train #${updated.trainNumber} status updated to ${newStatus}`);
  };

  // Submit Add Train
  const handleSaveNewTrain = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTrainNumber.trim() || !formName.trim()) {
      showAlert('error', 'Train number and name are required.');
      return;
    }

    if (formOriginCode === formDestCode) {
      showAlert('error', 'Origin and destination stations cannot be identical.');
      return;
    }

    if (trains.some(t => t.trainNumber === formTrainNumber.trim())) {
      showAlert('error', `Train #${formTrainNumber.trim()} already exists in the system.`);
      return;
    }

    const originStation = {
      id: `stn-${formOriginCode.toLowerCase()}`,
      code: formOriginCode.toUpperCase(),
      name: formOriginName.trim() || `${formOriginCode.toUpperCase()} Junction`,
      city: formOriginName.trim() || formOriginCode.toUpperCase(),
      state: 'India'
    };

    const destStation = {
      id: `stn-${formDestCode.toLowerCase()}`,
      code: formDestCode.toUpperCase(),
      name: formDestName.trim() || `${formDestCode.toUpperCase()} Junction`,
      city: formDestName.trim() || formDestCode.toUpperCase(),
      state: 'India'
    };

    // Generate coaches according to preset
    let generatedCoaches: Coach[] = [];
    if (formCoachPreset === 'VANDE_BHARAT') {
      generatedCoaches = [
        {
          id: `${formTrainNumber}-E1`,
          coachCode: 'E1',
          coachClass: 'EC',
          totalSeats: 52,
          availableSeats: 48,
          fare: 3300,
          baseFare: 3300,
          seats: generateSeatsForCoach('E1', 'EC', 52)
        },
        {
          id: `${formTrainNumber}-C1`,
          coachCode: 'C1',
          coachClass: 'CC',
          totalSeats: 78,
          availableSeats: 65,
          fare: 1750,
          baseFare: 1750,
          seats: generateSeatsForCoach('C1', 'CC', 78)
        },
        {
          id: `${formTrainNumber}-C2`,
          coachCode: 'C2',
          coachClass: 'CC',
          totalSeats: 78,
          availableSeats: 70,
          fare: 1750,
          baseFare: 1750,
          seats: generateSeatsForCoach('C2', 'CC', 78)
        }
      ];
    } else if (formCoachPreset === 'RAJDHANI') {
      generatedCoaches = [
        {
          id: `${formTrainNumber}-H1`,
          coachCode: 'H1',
          coachClass: '1A',
          totalSeats: 24,
          availableSeats: 20,
          fare: 4850,
          baseFare: 4850,
          seats: generateSeatsForCoach('H1', '1A', 24)
        },
        {
          id: `${formTrainNumber}-A1`,
          coachCode: 'A1',
          coachClass: '2A',
          totalSeats: 48,
          availableSeats: 42,
          fare: 2950,
          baseFare: 2950,
          seats: generateSeatsForCoach('A1', '2A', 48)
        },
        {
          id: `${formTrainNumber}-B1`,
          coachCode: 'B1',
          coachClass: '3A',
          totalSeats: 64,
          availableSeats: 55,
          fare: 2080,
          baseFare: 2080,
          seats: generateSeatsForCoach('B1', '3A', 64)
        }
      ];
    } else {
      // Superfast
      generatedCoaches = [
        {
          id: `${formTrainNumber}-A1`,
          coachCode: 'A1',
          coachClass: '2A',
          totalSeats: 48,
          availableSeats: 40,
          fare: 3100,
          baseFare: 3100,
          seats: generateSeatsForCoach('A1', '2A', 48)
        },
        {
          id: `${formTrainNumber}-B1`,
          coachCode: 'B1',
          coachClass: '3A',
          totalSeats: 64,
          availableSeats: 58,
          fare: 2120,
          baseFare: 2120,
          seats: generateSeatsForCoach('B1', '3A', 64)
        },
        {
          id: `${formTrainNumber}-S1`,
          coachCode: 'S1',
          coachClass: 'SL',
          totalSeats: 72,
          availableSeats: 60,
          fare: 780,
          baseFare: 780,
          seats: generateSeatsForCoach('S1', 'SL', 72)
        }
      ];
    }

    const newTrain: Train = {
      id: formTrainNumber.trim(),
      trainNumber: formTrainNumber.trim(),
      name: formName.trim(),
      type: formType,
      originCode: formOriginCode.toUpperCase(),
      destCode: formDestCode.toUpperCase(),
      originName: formOriginName.trim() || originStation.name,
      destName: formDestName.trim() || destStation.name,
      originStation,
      destinationStation: destStation,
      departureTime: formDepartureTime,
      arrivalTime: formArrivalTime,
      duration: formDuration,
      runsOnDays: formRunningDays,
      runningDays: formRunningDays,
      rating: 4.8,
      pantryAvailable: formPantry,
      cleanlinessScore: 4.9,
      averageSpeedKmH: formType === 'VANDE_BHARAT' ? 130 : 110,
      platform: formPlatform,
      status: 'ON_TIME',
      coaches: generatedCoaches,
      managedBy: currentUser?.fullName || 'System Admin',
      managedById: currentUser?.id || 'sys-admin'
    };

    onAddTrain(newTrain);
    setIsAddModalOpen(false);
    showAlert('success', `Train #${newTrain.trainNumber} - ${newTrain.name} added to the fleet!`);

    // Reset form
    setFormTrainNumber('');
    setFormName('');
  };

  // Toggle running days in add form
  const toggleDay = (day: string) => {
    if (formRunningDays.includes(day)) {
      if (formRunningDays.length > 1) {
        setFormRunningDays(formRunningDays.filter(d => d !== day));
      }
    } else {
      setFormRunningDays([...formRunningDays, day]);
    }
  };

  // Filter trains
  const filteredTrains = trains.filter(t => {
    const matchSearch =
      t.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.originName && t.originName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.destName && t.destName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.originCode && t.originCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.destCode && t.destCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const currentStatus = t.status || 'ON_TIME';
    const matchStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  // Calculate stats
  const totalTrainsCount = trains.length;
  const onTimeCount = trains.filter(t => !t.status || t.status === 'ON_TIME').length;
  const delayedCount = trains.filter(t => t.status === 'DELAYED').length;
  const cancelledCount = trains.filter(t => t.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-in fade-in w-full max-w-full">
      {/* Top Banner with Admin Clearance */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                Train Fleet & Operations Management
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Manage operational status, live delays, platform allocations, and add new trains to the railway network
            </p>
          </div>
        </div>

        <button
          id="btn-admin-add-train"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Train</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Fleet Trains</span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{totalTrainsCount}</p>
          <span className="text-[10px] text-blue-400">Scheduled Services</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">On-Time Services</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{onTimeCount}</p>
          <span className="text-[10px] text-emerald-400/90 font-medium">
            {totalTrainsCount > 0 ? Math.round((onTimeCount / totalTrainsCount) * 100) : 100}% Punctuality
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Delayed Services</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{delayedCount}</p>
          <span className="text-[10px] text-amber-400/90">Under Monitoring</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Cancelled Services</span>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">{cancelledCount}</p>
          <span className="text-[10px] text-rose-400/90">Temporary Disruption</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by train number, name, or station code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['ALL', 'ON_TIME', 'DELAYED', 'CANCELLED', 'RUNNING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Trains' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trains Operations List */}
      <div className="space-y-3.5">
        {filteredTrains.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <TrainIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Trains Matched</h4>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or add a new train.</p>
          </div>
        ) : (
          filteredTrains.map((train) => {
            const currentStatus = train.status || 'ON_TIME';
            const isDelayed = currentStatus === 'DELAYED';
            const isCancelled = currentStatus === 'CANCELLED';

            return (
              <div
                key={train.id || train.trainNumber}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3.5 w-full overflow-hidden"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono font-bold text-xs sm:text-sm shrink-0">
                      #{train.trainNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {train.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {train.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Runs: {((train as any).runningDays || train.runsOnDays || []).join(', ')} • {train.coaches?.length || 0} Coaches
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Managed by: {train.managedBy || 'System Admin'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
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
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isDelayed ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : isCancelled ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Radio className="w-3.5 h-3.5" />
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

                    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800">
                      Platform {(train as any).platform || '1'}
                    </span>
                  </div>
                </div>

                {/* Route & Timing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Departure</span>
                    <span className="text-sm font-bold text-white">{train.departureTime}</span>
                    <span className="text-slate-300 block truncate">
                      {(train as any).originName || train.originStation?.name || train.originCode}
                    </span>
                  </div>

                  <div className="text-left sm:text-center text-slate-400 py-1 sm:py-0 border-y sm:border-0 border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">Duration</span>
                    <span className="font-semibold text-slate-200">{train.duration || '8h 00m'}</span>
                    <span className="text-[11px] text-slate-400 block">Speed: {(train as any).averageSpeedKmH || 120} km/h</span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 block">Arrival</span>
                    <span className="text-sm font-bold text-white">{train.arrivalTime}</span>
                    <span className="text-slate-300 block truncate">
                      {(train as any).destName || train.destinationStation?.name || train.destCode}
                    </span>
                  </div>
                </div>

                {/* Live Remarks & Operational Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    {train.statusRemark ? (
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] text-slate-400">Notice:</span>
                        <span className="text-xs text-amber-300/90 font-medium truncate">{train.statusRemark}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No special bulletin active</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`btn-manage-status-${train.trainNumber}`}
                      onClick={() => handleOpenStatusModal(train)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Manage Status</span>
                    </button>

                    <button
                      id={`btn-delete-train-${train.trainNumber}`}
                      onClick={() => setDeleteConfirmTrain(train)}
                      title="Decommission train"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: UPDATE TRAIN STATUS & PLATFORM */}
      {statusModalTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Update Status: #{statusModalTrain.trainNumber}
                </h3>
                <p className="text-xs text-slate-400">{statusModalTrain.name}</p>
              </div>
              <button
                onClick={() => setStatusModalTrain(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Operational Running Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ON_TIME', 'DELAYED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newStatus === st
                          ? st === 'ON_TIME'
                            ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500'
                            : st === 'DELAYED'
                            ? 'bg-amber-600/30 text-amber-300 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-rose-600/30 text-rose-300 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {st === 'ON_TIME' ? 'On Time' : st === 'DELAYED' ? 'Delayed' : 'Cancelled'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delay Minutes (only if Delayed) */}
              {newStatus === 'DELAYED' && (
                <div className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <label className="block text-xs font-semibold text-amber-300">
                    Delay Duration (Minutes)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[15, 30, 45, 60, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDelayMinutes(mins)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          delayMinutes === mins
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    placeholder="Custom delay in minutes"
                  />
                </div>
              )}

              {/* Platform assignment */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Assigned Platform Number
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {['1', '2', '3', '4', '5', '6', '16'].map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => setPlatformNumber(pf)}
                      className={`w-9 h-9 rounded-xl font-mono text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        platformNumber === pf
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Remark / Public Announcement */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Public Broadcast Announcement / Remark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signal delay at Kanpur Central. Expected on Pf 16."
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusModalTrain(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Save & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW TRAIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Add New Train Service to Fleet
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Commission a new train schedule and configure coaches
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTrain} className="space-y-3.5">
              {/* Row 1: Train Number & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Train Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20902"
                    value={formTrainNumber}
                    onChange={(e) => setFormTrainNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Train Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vande Bharat Express"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Train Type & Coach Configuration Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Train Classification
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      setFormType(e.target.value);
                      if (e.target.value === 'VANDE_BHARAT') setFormCoachPreset('VANDE_BHARAT');
                      else if (e.target.value === 'RAJDHANI') setFormCoachPreset('RAJDHANI');
                      else setFormCoachPreset('SUPERFAST');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="VANDE_BHARAT">Vande Bharat Express (High Speed)</option>
                    <option value="RAJDHANI">Rajdhani Express (Premium AC)</option>
                    <option value="SHATABDI">Shatabdi Express (Intercity AC)</option>
                    <option value="SUPERFAST">Superfast Express</option>
                    <option value="EXPRESS">Mail / Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Coach & Seating Preset
                  </label>
                  <select
                    value={formCoachPreset}
                    onChange={(e) => setFormCoachPreset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="VANDE_BHARAT">Vande Bharat (1x EC, 2x CC)</option>
                    <option value="RAJDHANI">Rajdhani Sleeper (1x 1A, 1x 2A, 1x 3A)</option>
                    <option value="SUPERFAST">Superfast Mix (1x 2A, 1x 3A, 1x SL)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Origin and Destination Stations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Origin Station *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Code (e.g. NDLS)"
                      value={formOriginCode}
                      onChange={(e) => setFormOriginCode(e.target.value.toUpperCase())}
                      className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 uppercase"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Station Name"
                      value={formOriginName}
                      onChange={(e) => setFormOriginName(e.target.value)}
                      className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Destination Station *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Code (e.g. BSB)"
                      value={formDestCode}
                      onChange={(e) => setFormDestCode(e.target.value.toUpperCase())}
                      className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 uppercase"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Station Name"
                      value={formDestName}
                      onChange={(e) => setFormDestName(e.target.value)}
                      className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Departure, Arrival, Duration & Platform */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="06:00"
                    value={formDepartureTime}
                    onChange={(e) => setFormDepartureTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="14:00"
                    value={formArrivalTime}
                    onChange={(e) => setFormArrivalTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="8h 00m"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 mb-1">
                    Platform Pf
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Running Days */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Operational Running Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                    const isSelected = formRunningDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Pantry toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Onboard Pantry Car Available</span>
                <button
                  type="button"
                  onClick={() => setFormPantry(!formPantry)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    formPantry
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {formPantry ? 'Yes, Included' : 'No Pantry'}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  Commission & Add Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Decommission Train #{deleteConfirmTrain.trainNumber}?
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <span className="font-semibold text-white">{deleteConfirmTrain.name}</span> from the fleet? This train will no longer appear in search results or schedules.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTrain(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Keep Train
              </button>
              <button
                onClick={() => {
                  onDeleteTrain(deleteConfirmTrain.id || deleteConfirmTrain.trainNumber);
                  setDeleteConfirmTrain(null);
                  showAlert('info', `Train #${deleteConfirmTrain.trainNumber} has been removed from the fleet.`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
