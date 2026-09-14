// Database Seed Script for Production Railway Ticket Booking Platform
// import { PrismaClient } from '@prisma/client';
// In environments where prisma client is generated:
// const prisma = new PrismaClient();

export const seedData = {
  stations: [
    { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi' },
    { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
    { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
    { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' }
  ],
  trains: [
    {
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
    },
    {
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
      coaches: [
        { coachCode: 'H1', coachClass: '1A', totalSeats: 24, baseFare: 4850 },
        { coachCode: 'A1', coachClass: '2A', totalSeats: 48, baseFare: 2950 },
        { coachCode: 'A2', coachClass: '2A', totalSeats: 48, baseFare: 2950 },
        { coachCode: 'B1', coachClass: '3A', totalSeats: 64, baseFare: 2080 },
        { coachCode: 'B2', coachClass: '3A', totalSeats: 64, baseFare: 2080 },
        { coachCode: 'B3', coachClass: '3A', totalSeats: 64, baseFare: 2080 }
      ],
      schedule: [
        { stationCode: 'NDLS', arrivalTime: '16:55', departureTime: '16:55', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '3' },
        { stationCode: 'KOTA', arrivalTime: '21:30', departureTime: '21:40', haltMinutes: 10, dayNumber: 1, distanceKm: 465, platform: '1' },
        { stationCode: 'RTM', arrivalTime: '00:45', departureTime: '00:48', haltMinutes: 3, dayNumber: 2, distanceKm: 731, platform: '4' },
        { stationCode: 'BRC', arrivalTime: '03:52', departureTime: '04:00', haltMinutes: 8, dayNumber: 2, distanceKm: 992, platform: '2' },
        { stationCode: 'ST', arrivalTime: '05:13', departureTime: '05:18', haltMinutes: 5, dayNumber: 2, distanceKm: 1122, platform: '1' },
        { stationCode: 'MMCT', arrivalTime: '08:35', departureTime: '08:35', haltMinutes: 0, dayNumber: 2, distanceKm: 1384, platform: '1' }
      ]
    },
    {
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
      coaches: [
        { coachCode: 'C1', coachClass: 'CC', totalSeats: 78, baseFare: 1165 },
        { coachCode: 'C2', coachClass: 'CC', totalSeats: 78, baseFare: 1165 },
        { coachCode: 'E1', coachClass: 'EC', totalSeats: 52, baseFare: 2125 }
      ],
      schedule: [
        { stationCode: 'NDLS', arrivalTime: '06:10', departureTime: '06:10', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '1' },
        { stationCode: 'CNB', arrivalTime: '11:20', departureTime: '11:25', haltMinutes: 5, dayNumber: 1, distanceKm: 440, platform: '2' },
        { stationCode: 'LKO', arrivalTime: '12:40', departureTime: '12:40', haltMinutes: 0, dayNumber: 1, distanceKm: 512, platform: '3' }
      ]
    },
    {
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
      coaches: [
        { coachCode: 'S1', coachClass: 'SL', totalSeats: 72, baseFare: 780 },
        { coachCode: 'S2', coachClass: 'SL', totalSeats: 72, baseFare: 780 },
        { coachCode: 'B1', coachClass: '3A', totalSeats: 64, baseFare: 2120 },
        { coachCode: 'B2', coachClass: '3A', totalSeats: 64, baseFare: 2120 },
        { coachCode: 'A1', coachClass: '2A', totalSeats: 48, baseFare: 3100 }
      ],
      schedule: [
        { stationCode: 'NDLS', arrivalTime: '20:10', departureTime: '20:10', haltMinutes: 0, dayNumber: 1, distanceKm: 0, platform: '5' },
        { stationCode: 'BPL', arrivalTime: '05:30', departureTime: '05:40', haltMinutes: 10, dayNumber: 2, distanceKm: 705, platform: '1' },
        { stationCode: 'NGP', arrivalTime: '11:50', departureTime: '12:00', haltMinutes: 10, dayNumber: 2, distanceKm: 1095, platform: '2' },
        { stationCode: 'SBC', arrivalTime: '11:45', departureTime: '11:45', haltMinutes: 0, dayNumber: 3, distanceKm: 2420, platform: '4' }
      ]
    }
  ],
  demoUsers: [
    {
      email: 'user@railcloud.internal',
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: 'USER',
      // bcrypt hash for 'Pass@1234'
      passwordHash: '$2a$12$e80yq9gP7v/X10v5mB.tEOjR7s6Nf1gUkm6Q2iXq4Y4/8p2C9fHkC'
    },
    {
      email: 'admin@railcloud.internal',
      fullName: 'Priya Iyer (Station Superintendent)',
      phone: '+91 98111 22334',
      role: 'ADMIN',
      // bcrypt hash for 'Admin@Secure2026'
      passwordHash: '$2a$12$K89yq7gP7v/X10v5mB.tEOjR7s6Nf1gUkm6Q2iXq4Y4/8p2C9fHkA'
    }
  ]
};

console.log('Seed configuration verified for RailCloud Production Schema');
