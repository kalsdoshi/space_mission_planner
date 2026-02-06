import { Mission, Maneuver, TelemetryLog, StoredUser } from '../types';

const DB_KEYS = {
  MISSIONS: 'sls_missions',
  MANEUVERS: 'sls_maneuvers',
  TELEMETRY: 'sls_telemetry',
  USERS: 'sls_users'
};

// Helper to simulate DB delay usually found in SQLite
const simulateLatency = async () => new Promise(resolve => setTimeout(resolve, 50));

export const dbService = {
  // MISSIONS
  getMissions: async (): Promise<Mission[]> => {
    await simulateLatency();
    const data = localStorage.getItem(DB_KEYS.MISSIONS);
    return data ? JSON.parse(data) : [];
  },

  getMissionById: async (id: string): Promise<Mission | undefined> => {
    const missions = await dbService.getMissions();
    return missions.find(m => m.id === id);
  },

  saveMission: async (mission: Mission): Promise<void> => {
    const missions = await dbService.getMissions();
    missions.push(mission);
    localStorage.setItem(DB_KEYS.MISSIONS, JSON.stringify(missions));
  },

  deleteMission: async (missionId: string): Promise<void> => {
    await simulateLatency();
    
    // Remove from Missions
    const missions = await dbService.getMissions();
    const filteredMissions = missions.filter(m => m.id !== missionId);
    localStorage.setItem(DB_KEYS.MISSIONS, JSON.stringify(filteredMissions));

    // Remove associated maneuvers
    const maneuverData = localStorage.getItem(DB_KEYS.MANEUVERS);
    if (maneuverData) {
      const allManeuvers: Maneuver[] = JSON.parse(maneuverData);
      const filteredManeuvers = allManeuvers.filter(m => m.mission_id !== missionId);
      localStorage.setItem(DB_KEYS.MANEUVERS, JSON.stringify(filteredManeuvers));
    }

    // Remove associated telemetry
    await dbService.clearMissionTelemetry(missionId);
  },

  // MANEUVERS
  getManeuvers: async (missionId: string): Promise<Maneuver[]> => {
    await simulateLatency();
    const data = localStorage.getItem(DB_KEYS.MANEUVERS);
    const allManeuvers: Maneuver[] = data ? JSON.parse(data) : [];
    return allManeuvers.filter(m => m.mission_id === missionId);
  },

  saveManeuver: async (maneuver: Maneuver): Promise<void> => {
    const data = localStorage.getItem(DB_KEYS.MANEUVERS);
    const allManeuvers: Maneuver[] = data ? JSON.parse(data) : [];
    allManeuvers.push(maneuver);
    localStorage.setItem(DB_KEYS.MANEUVERS, JSON.stringify(allManeuvers));
  },

  // TELEMETRY
  getTelemetry: async (missionId: string): Promise<TelemetryLog[]> => {
    await simulateLatency();
    const data = localStorage.getItem(DB_KEYS.TELEMETRY);
    const allLogs: TelemetryLog[] = data ? JSON.parse(data) : [];
    // Sort by timestamp
    return allLogs
      .filter(l => l.mission_id === missionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  saveTelemetryBatch: async (logs: TelemetryLog[]): Promise<void> => {
    const data = localStorage.getItem(DB_KEYS.TELEMETRY);
    const allLogs: TelemetryLog[] = data ? JSON.parse(data) : [];
    allLogs.push(...logs);
    localStorage.setItem(DB_KEYS.TELEMETRY, JSON.stringify(allLogs));
  },

  clearMissionTelemetry: async (missionId: string): Promise<void> => {
    await simulateLatency();
    const data = localStorage.getItem(DB_KEYS.TELEMETRY);
    if (data) {
      const allLogs: TelemetryLog[] = JSON.parse(data);
      const filtered = allLogs.filter(l => l.mission_id !== missionId);
      localStorage.setItem(DB_KEYS.TELEMETRY, JSON.stringify(filtered));
    }
  },

  clearAllData: async (): Promise<void> => {
    await simulateLatency();
    // Targeted removal of mission-related keys
    Object.values(DB_KEYS).forEach(key => {
        if (key !== DB_KEYS.USERS) {
            localStorage.removeItem(key);
        }
    });
  },

  // AUTHENTICATION
  getUsers: async (): Promise<StoredUser[]> => {
    await simulateLatency();
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  registerUser: async (user: StoredUser): Promise<{success: boolean, message: string}> => {
    const users = await dbService.getUsers();
    
    // Check for duplicate callsign
    if (users.some(u => u.callsign === user.callsign)) {
        return { success: false, message: 'Callsign already registered to active personnel.' };
    }

    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { success: true, message: 'Credentials established.' };
  },

  authenticateUser: async (callsign: string, accessCode: string): Promise<{success: boolean, user?: StoredUser, message?: string}> => {
    const users = await dbService.getUsers();
    const user = users.find(u => u.callsign === callsign);

    if (!user) {
        return { success: false, message: 'Callsign not found in personnel database.' };
    }

    if (user.accessCode !== accessCode) {
        return { success: false, message: 'Invalid security token.' };
    }

    return { success: true, user };
  }
};