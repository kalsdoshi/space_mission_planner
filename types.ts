export enum BlockVersion {
  BLOCK_1B = 'Block 1B',
  BLOCK_2 = 'Block 2'
}

export enum Destination {
  LEO = 'Low Earth Orbit',
  MOON = 'Moon (TLI)',
  MARS = 'Mars'
}

export interface HardwareConfig {
  core_engines: 3 | 4; // RS-25 numbers
  srb_type: 'Block 1' | 'Dark Knight' | 'BOLE';
  upper_stage: 'ICPS' | 'EUS';
}

export interface Mission {
  id: string;
  mission_name: string;
  block_version: BlockVersion;
  payload_mass: number; // tonnes
  destination: Destination;
  c3_energy: number; // km²/s²
  hardware_config?: HardwareConfig; // New field
  created_at: string;
}

export interface Maneuver {
  id: string;
  mission_id: string;
  burn_duration: number; // seconds
  delta_v: number; // m/s
  calculated_g_force: number; // g
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
}

export interface TelemetryLog {
  id: string;
  mission_id: string;
  timestamp: string; // ISO string
  altitude: number; // km
  velocity: number; // m/s
  pressure: number; // kPa
  temp: number; // Fahrenheit
  events: string[]; // e.g., "THERMAL_VIOLATION"
}

export interface UserProfile {
  callsign: string;
  clearanceLevel: 'L1' | 'L2' | 'DIRECTOR';
  isLoggedIn: boolean;
}

export interface StoredUser {
  callsign: string;
  accessCode: string;
  clearanceLevel: 'L1' | 'L2' | 'DIRECTOR';
  registeredAt: string;
}

export const CONSTANTS = {
  BLOCK_1B_MAX_PAYLOAD: 40, // tonnes (Upper bound)
  BLOCK_1B_MIN_PAYLOAD: 34, // tonnes (Lower bound check)
  BLOCK_2_MIN_PAYLOAD: 45, // tonnes
  MAX_AXIAL_G: 4.1,
  MIN_TEMP_F: 6,
  MAX_TEMP_F: 130,
  MARS_REQ_C3: 15,
};
