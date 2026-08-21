import { GradeRecord, AttendanceRecord, BehaviorRecord, StudentAnalytics } from '../types';

export function calculateLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 65) return 'D';
  return 'F';
}

export function percentageToGPA(percentage: number): number {
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 65) return 1.0;
  return 0.0;
}

export function computeStudentAnalytics(
  studentId: string,
  allGrades: GradeRecord[],
  allAttendance: AttendanceRecord[],
  allBehaviors: BehaviorRecord[]
): StudentAnalytics {
  const grades = allGrades.filter(g => g.studentId === studentId);
  const attendance = allAttendance.filter(a => a.studentId === studentId);
  const behaviors = allBehaviors.filter(b => b.studentId === studentId);

  // Grade analytics
  const totalGrades = grades.length;
  let averagePercentage = 0;
  let gpa = 0;
  const gradeDistribution: { [letter: string]: number } = {
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0
  };
  const subjectMap: { [subject: string]: { sum: number; count: number } } = {};

  if (totalGrades > 0) {
    const sum = grades.reduce((acc, g) => acc + g.percentage, 0);
    averagePercentage = Math.round((sum / totalGrades) * 10) / 10;
    
    const gpaSum = grades.reduce((acc, g) => acc + percentageToGPA(g.percentage), 0);
    gpa = Math.round((gpaSum / totalGrades) * 100) / 100;

    grades.forEach(g => {
      const letter = calculateLetterGrade(g.percentage).charAt(0);
      if (gradeDistribution[letter] !== undefined) {
        gradeDistribution[letter]++;
      }

      if (!subjectMap[g.subject]) {
        subjectMap[g.subject] = { sum: 0, count: 0 };
      }
      subjectMap[g.subject].sum += g.percentage;
      subjectMap[g.subject].count++;
    });
  }

  const subjectAverages: { [subject: string]: number } = {};
  Object.keys(subjectMap).forEach(sub => {
    subjectAverages[sub] = Math.round(subjectMap[sub].sum / subjectMap[sub].count);
  });

  // Attendance analytics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const tardyDays = attendance.filter(a => a.status === 'tardy').length;
  const excusedDays = attendance.filter(a => a.status === 'excused' || a.status === 'medical').length;

  const attendanceRate = totalDays > 0 
    ? Math.round(((presentDays + (tardyDays * 0.8) + (excusedDays * 0.9)) / totalDays) * 100)
    : 100;

  // Behavior analytics
  let behaviorScore = 0;
  let positiveBehaviorCount = 0;
  let concernBehaviorCount = 0;

  behaviors.forEach(b => {
    behaviorScore += b.points || (b.type === 'positive' ? 5 : b.type === 'concern' ? -3 : 0);
    if (b.type === 'positive') positiveBehaviorCount++;
    if (b.type === 'concern') concernBehaviorCount++;
  });

  // Recent trend (compare earlier grades with recent grades)
  let recentTrend: 'improving' | 'steady' | 'declining' = 'steady';
  if (grades.length >= 3) {
    const sortedGrades = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const half = Math.floor(sortedGrades.length / 2);
    const firstHalfAvg = sortedGrades.slice(0, half).reduce((acc, g) => acc + g.percentage, 0) / half;
    const secondHalfAvg = sortedGrades.slice(half).reduce((acc, g) => acc + g.percentage, 0) / (sortedGrades.length - half);

    if (secondHalfAvg - firstHalfAvg >= 3) {
      recentTrend = 'improving';
    } else if (firstHalfAvg - secondHalfAvg >= 3) {
      recentTrend = 'declining';
    }
  }

  return {
    gpa,
    averagePercentage,
    gradeDistribution,
    totalGrades,
    attendanceRate,
    totalDays,
    presentDays,
    absentDays,
    tardyDays,
    excusedDays,
    behaviorScore,
    positiveBehaviorCount,
    concernBehaviorCount,
    recentTrend,
    subjectAverages
  };
}
