import React from 'react';
import { Search, ArrowLeftRight, Calendar, Users, Train as TrainIcon, Sparkles } from 'lucide-react';
import { Station, SearchFilterState } from '../types';

interface SearchWidgetProps {
  stations: Station[];
  filter: SearchFilterState;
  setFilter: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  onSearch: () => void;
  loading: boolean;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  stations,
  filter,
  setFilter,
  onSearch,
  loading
}) => {
  const handleSwap = () => {
    setFilter(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 sm:p-5 shadow-2xl w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <TrainIcon className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-white truncate">
            Find Trains & Reserve Seats
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="hidden xs:inline">Vande Bharat & Rajdhani</span>
            <span>Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* From Station */}
        <div className="md:col-span-3 min-w-0">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Origin Station
          </label>
          <select
            id="select-from-station"
            value={filter.fromStation}
            onChange={(e) => setFilter(prev => ({ ...prev, fromStation: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 sm:px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all truncate"
          >
            {stations.map(st => (
              <option key={`from-${st.code}`} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center py-1 md:pb-1">
          <button
            id="btn-swap-stations"
            type="button"
            onClick={handleSwap}
            title="Swap stations"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all transform hover:rotate-180 duration-200 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Station */}
        <div className="md:col-span-3 min-w-0">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Destination Station
          </label>
          <select
            id="select-to-station"
            value={filter.toStation}
            onChange={(e) => setFilter(prev => ({ ...prev, toStation: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 sm:px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all truncate"
          >
            {stations.map(st => (
              <option key={`to-${st.code}`} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Travel Date */}
        <div className="md:col-span-2 min-w-0">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Date of Journey
          </label>
          <div className="relative">
            <input
              id="input-travel-date"
              type="date"
              value={filter.travelDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilter(prev => ({ ...prev, travelDate: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 sm:px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Class Selector */}
        <div className="md:col-span-2 min-w-0">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Class
          </label>
          <select
            id="select-train-class"
            value={filter.trainClass}
            onChange={(e) => setFilter(prev => ({ ...prev, trainClass: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all truncate"
          >
            <option value="ALL">All Classes</option>
            <option value="EC">Executive Anubhuti (EC)</option>
            <option value="CC">AC Chair Car (CC)</option>
            <option value="1A">AC First Class (1A)</option>
            <option value="2A">AC 2 Tier (2A)</option>
            <option value="3A">AC 3 Tier (3A)</option>
            <option value="SL">Sleeper (SL)</option>
          </select>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-1">
          <button
            id="btn-search-trains"
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="w-full h-[42px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
