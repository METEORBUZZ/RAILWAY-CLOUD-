import { Train, Station, Coach, Seat } from '../types';

export const INITIAL_STATIONS: Station[] = [
  { id: 'stn-ndls', code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi' },
  { id: 'stn-mmct', code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { id: 'stn-hwh', code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { id: 'stn-mas', code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { id: 'stn-sbc', code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka' },
  { id: 'stn-adi', code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { id: 'stn-bsb', code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { id: 'stn-pnbe', code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' }
];

export function generateSeatsForCoach(coachCode: string, coachClass: string, totalSeats: number): Seat[] {
  const isEC = coachClass === 'EC' || coachClass === '1A';
  const isCC = coachClass === 'CC';
  const berthTypesEC = ['WINDOW', 'AISLE', 'AISLE', 'WINDOW'];
  const berthTypesCC = ['WINDOW', 'MIDDLE', 'AISLE', 'AISLE', 'WINDOW'];
  const berthTypesSleeper = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER'];

  const pool = isEC ? berthTypesEC : isCC ? berthTypesCC : berthTypesSleeper;

  return Array.from({ length: totalSeats }, (_, idx) => {
    const seatNumber = idx + 1;
    return {
      id: `${coachCode}-${seatNumber}`,
      seatNumber,
      berthType: pool[(seatNumber - 1) % pool.length],
      isBooked: seatNumber === 3 || seatNumber === 14 || seatNumber === 27,
      isLocked: seatNumber === 7
    };
  });
}

export function normalizeTrain(raw: any): Train {
  const trainNumber = String(raw.trainNumber || raw.id || '22436');
  const originCode = raw.originCode || raw.originStation?.code || 'NDLS';
  const destCode = raw.destCode || raw.destinationStation?.code || 'BSB';

  const originStation = raw.originStation || INITIAL_STATIONS.find(s => s.code === originCode) || {
    id: `stn-${originCode.toLowerCase()}`,
    code: originCode,
    name: `${originCode} Station`,
    city: originCode,
    state: 'India'
  };

  const destinationStation = raw.destinationStation || INITIAL_STATIONS.find(s => s.code === destCode) || {
    id: `stn-${destCode.toLowerCase()}`,
    code: destCode,
    name: `${destCode} Station`,
    city: destCode,
    state: 'India'
  };

  const coaches: Coach[] = (raw.coaches || []).map((c: any) => {
    const code = c.coachCode || 'C1';
    const cClass = c.coachClass || 'CC';
    const totalSeats = c.totalSeats || 78;
    const fare = c.fare ?? c.baseFare ?? 1500;
    return {
      id: c.id || `${trainNumber}-${code}`,
      coachCode: code,
      coachClass: cClass,
      totalSeats,
      availableSeats: c.availableSeats ?? Math.max(12, Math.floor(totalSeats * 0.45)),
      fare,
      baseFare: fare,
      seats: (c.seats && c.seats.length > 0) ? c.seats : generateSeatsForCoach(code, cClass, totalSeats)
    };
  });

  return {
    id: trainNumber,
    trainNumber,
    name: raw.name || `Express ${trainNumber}`,
    type: raw.type || 'VANDE_BHARAT',
    originCode,
    destCode,
    originName: raw.originName || originStation.name,
    destName: raw.destName || destinationStation.name,
    originStation,
    destinationStation,
    departureTime: raw.departureTime || '06:00',
    arrivalTime: raw.arrivalTime || '14:00',
    duration: raw.duration || '8h 00m',
    runsOnDays: raw.runsOnDays || raw.runningDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    runningDays: raw.runningDays || raw.runsOnDays || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    rating: raw.rating || 4.8,
    pantryAvailable: raw.pantryAvailable ?? true,
    cleanlinessScore: raw.cleanlinessScore || 4.9,
    averageSpeedKmH: raw.averageSpeedKmH || (raw.type === 'VANDE_BHARAT' ? 130 : 115),
    platform: raw.platform || (raw.schedule?.[0]?.platform) || '1',
    coaches,
    schedule: raw.schedule || []
  } as unknown as Train;
}

export const INITIAL_TRAINS: Train[] = [
  normalizeTrain({
    trainNumber: '22436',
    name: 'Vande Bharat Express',
    type: 'VANDE_BHARAT',
    originCode: 'NDLS',
    destCode: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    runsOnDays: ['TUE', 'WED', 'FRI', 'SAT', 'SUN'],
    rating: 4.8,
    pantryAvailable: true,
    platform: '16',
    coaches: [
      { coachCode: 'C1', coachClass: 'CC', totalSeats: 78, baseFare: 1750 },
      { coachCode: 'C2', coachClass: 'CC', totalSeats: 78, baseFare: 1750 },
      { coachCode: 'C3', coachClass: 'CC', totalSeats: 78, baseFare: 1750 },
      { coachCode: 'E1', coachClass: 'EC', totalSeats: 52, baseFare: 3300 }
    ],
    schedule: [
      { stationCode: 'NDLS', arrivalTime: '06:00', departureTime: '06:00', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '16' },
      { stationCode: 'CNB', arrivalTime: '10:08', departureTime: '10:10', haltMinutes: 2, dayNumber: 1, distanceKm: 440, platform: '1' },
      { stationCode: 'PRYJ', arrivalTime: '12:08', departureTime: '12:10', haltMinutes: 2, dayNumber: 1, distanceKm: 635, platform: '6' },
      { stationCode: 'BSB', arrivalTime: '14:00', departureTime: '14:00', haltMinutes: 0, dayNumber: 1, distanceKm: 759, platform: '1' }
    ]
  }),
  normalizeTrain({
    trainNumber: '12952',
    name: 'Mumbai Rajdhani Express',
    type: 'RAJDHANI_EXPRESS',
    originCode: 'NDLS',
    destCode: 'MMCT',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    rating: 4.7,
    pantryAvailable: true,
    platform: '3',
    coaches: [
      { coachCode: 'H1', coachClass: '1A', totalSeats: 24, baseFare: 4850 },
      { coachCode: 'A1', coachClass: '2A', totalSeats: 48, baseFare: 2950 },
      { coachCode: 'A2', coachClass: '2A', totalSeats: 48, baseFare: 2950 },
      { coachCode: 'B1', coachClass: '3A', totalSeats: 64, baseFare: 2080 },
      { coachCode: 'B2', coachClass: '3A', totalSeats: 64, baseFare: 2080 }
    ],
    schedule: [
      { stationCode: 'NDLS', arrivalTime: '16:55', departureTime: '16:55', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '3' },
      { stationCode: 'KOTA', arrivalTime: '21:30', departureTime: '21:40', haltMinutes: 10, dayNumber: 1, distanceKm: 465, platform: '1' },
      { stationCode: 'MMCT', arrivalTime: '08:35', departureTime: '08:35', haltMinutes: 0, dayNumber: 2, distanceKm: 1384, platform: '1' }
    ]
  }),
  normalizeTrain({
    trainNumber: '12004',
    name: 'Lucknow Shatabdi Express',
    type: 'SHATABDI_EXPRESS',
    originCode: 'NDLS',
    destCode: 'LKO',
    departureTime: '06:10',
    arrivalTime: '12:40',
    duration: '6h 30m',
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    rating: 4.6,
    pantryAvailable: true,
    platform: '1',
    coaches: [
      { coachCode: 'C1', coachClass: 'CC', totalSeats: 78, baseFare: 1165 },
      { coachCode: 'C2', coachClass: 'CC', totalSeats: 78, baseFare: 1165 },
      { coachCode: 'E1', coachClass: 'EC', totalSeats: 52, baseFare: 2125 }
    ],
    schedule: [
      { stationCode: 'NDLS', arrivalTime: '06:10', departureTime: '06:10', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '1' },
      { stationCode: 'CNB', arrivalTime: '11:20', departureTime: '11:25', haltMinutes: 5, dayNumber: 1, distanceKm: 440, platform: '2' }
    ]
  }),
  normalizeTrain({
    trainNumber: '12626',
    name: 'Kerala Superfast Express',
    type: 'SUPERFAST_EXPRESS',
    originCode: 'NDLS',
    destCode: 'SBC',
    departureTime: '20:10',
    arrivalTime: '11:45',
    duration: '39h 35m',
    runsOnDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    rating: 4.4,
    pantryAvailable: true,
    platform: '5',
    coaches: [
      { coachCode: 'S1', coachClass: 'SL', totalSeats: 72, baseFare: 780 },
      { coachCode: 'B1', coachClass: '3A', totalSeats: 64, baseFare: 2120 },
      { coachCode: 'A1', coachClass: '2A', totalSeats: 48, baseFare: 3100 }
    ],
    schedule: [
      { stationCode: 'NDLS', arrivalTime: '20:10', departureTime: '20:10', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '5' }
    ]
  })
];
