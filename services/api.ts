import { Course, Timetable } from '../types';

export const loginUser = async (username: string, password: string): Promise<boolean> => {
  // We validate during data fetch in this architecture as sessions are stateless on Vercel
  return true;
};

export const fetchData = async (username: string, password: string): Promise<{ courses: Course[], timetable: Timetable, lastUpdated: string }> => {
  try {
    // 1. Fetch Attendance
    const attendanceRes = await fetch(`/send_attendance/${encodeURIComponent(username)}/${encodeURIComponent(password)}`, {
        method: 'POST'
    });

    if (!attendanceRes.ok) {
        let errMsg = `Server error: ${attendanceRes.status}`;
        try {
            const errData = await attendanceRes.json();
            if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
    }

    const attendanceData = await attendanceRes.json();
    
    // 2. Fetch Timetable
    let timetable: Timetable = {};
    try {
        const timetableRes = await fetch(`/send_timetable/${encodeURIComponent(username)}/${encodeURIComponent(password)}`, {
            method: 'POST'
        });
        
        if (timetableRes.ok) {
            const timetableData = await timetableRes.json();
            if (timetableData && !timetableData.error) {
                timetable = timetableData;
            }
        }
    } catch (e) {
        console.warn("Timetable fetch failed, defaulting to empty.", e);
    }

    // 3. Map Response to App Types
    // Backend returns keys: name, total_hours, total_present, percentage_of_attendance
    const courses: Course[] = attendanceData.map((item: any) => ({
      code: extractCode(item.name),
      name: extractName(item.name),
      totalHours: item.total_hours,
      presentHours: item.total_present,
      percentage: item.percentage_of_attendance,
      credits: 3 // Default credits as we don't scrape them yet
    }));

    return {
      courses,
      timetable,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

  } catch (error) {
    console.error("Data Fetch Error:", error);
    throw error;
  }
};

// Helper to extract course code (e.g. from "19Z501 - Data Structures")
const extractCode = (rawName: string): string => {
    if (!rawName) return "UNK";
    // Check if it starts with a pattern like 19Z... or XXZ...
    // The backend constructs string like "CODE - Title"
    const parts = rawName.split('-');
    if (parts.length > 0) return parts[0].trim();
    return rawName.substring(0, 6);
};

// Helper to extract course name
const extractName = (rawName: string): string => {
    if (!rawName) return "Unknown Course";
    const parts = rawName.split('-');
    if (parts.length > 1) {
        return parts.slice(1).join('-').trim();
    }
    return rawName;
};
