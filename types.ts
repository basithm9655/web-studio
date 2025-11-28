export interface Course {
  code: string;
  name: string;
  totalHours: number;
  presentHours: number;
  percentage: number;
  credits?: number;
}

export interface AttendanceStatus {
  status: 'danger' | 'warning' | 'success';
  message: string;
  count: number;
  type: 'attend' | 'bunk';
}

export interface DaySchedule {
  day: string;
  subjects: string[]; // List of Course Codes or "Free"
}

export interface Timetable {
  [key: string]: string[]; // "Mon": ["19Z501", "Free", ...]
}

export interface UserSession {
  username: string;
  isLoggedIn: boolean;
  lastUpdated: string;
}

export interface PlannerSimulation {
  [uniqueId: string]: 'attend' | 'bunk' | null;
}

export interface ProjectedStat {
  code: string;
  name: string;
  oldPercent: number;
  newPercent: number;
  diff: number;
}
