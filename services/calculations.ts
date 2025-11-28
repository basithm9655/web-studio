import { AttendanceStatus, Course } from '../types';

export const calculateStatus = (
  totalHours: number,
  presentHours: number,
  thresholdPercent: number
): AttendanceStatus => {
  const threshold = thresholdPercent / 100;
  const currentPercent = totalHours === 0 ? 0 : (presentHours / totalHours);

  if (currentPercent < threshold) {
    // Logic: How many consecutive classes must I attend to reach threshold?
    // Formula: (Present + x) / (Total + x) >= Threshold
    // Present + x >= Threshold * Total + Threshold * x
    // x (1 - Threshold) >= Threshold * Total - Present
    // x >= (Threshold * Total - Present) / (1 - Threshold)
    
    const numerator = (threshold * totalHours) - presentHours;
    const denominator = 1 - threshold;
    const classesToAttend = Math.ceil(numerator / denominator);
    
    return {
      status: 'danger',
      message: `Attend next ${classesToAttend} classes`,
      count: classesToAttend,
      type: 'attend'
    };
  } else {
    // Logic: How many classes can I miss (bunk) and stay above threshold?
    // Formula: Present / (Total + x) >= Threshold
    // Present >= Threshold * (Total + x)
    // Present / Threshold >= Total + x
    // x <= (Present / Threshold) - Total
    
    const classesToBunk = Math.floor((presentHours / threshold) - totalHours);
    
    if (classesToBunk <= 0) {
      return {
        status: 'warning',
        message: 'On the edge! Don\'t miss.',
        count: 0,
        type: 'bunk'
      };
    }
    
    return {
      status: 'success',
      message: `Safe to bunk ${classesToBunk} classes`,
      count: classesToBunk,
      type: 'bunk'
    };
  }
};

export const calculateProjectedPercentage = (
  course: Course,
  attendedDelta: number,
  bunkedDelta: number
): number => {
  const newTotal = course.totalHours + attendedDelta + bunkedDelta;
  const newPresent = course.presentHours + attendedDelta;
  
  if (newTotal === 0) return 0;
  return (newPresent / newTotal) * 100;
};
