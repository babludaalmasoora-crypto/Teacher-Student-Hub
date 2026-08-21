export interface Student {
  id: string;
  teacherId: string;
  name: string;
  rollNumber: string;
  grade: string;
  section: string;
  gender: 'female' | 'male' | 'other';
  dob: string;
  photoUrl: string;
  parentName: string;
  parentRelationship: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  learningNeeds?: string; // e.g. IEP, Visual learner, ESL, Gifted
  medicalNotes?: string; // e.g. Asthma, Peanuts allergy, Glasses
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

export type GradeCategory = 'quiz' | 'homework' | 'project' | 'midterm' | 'final' | 'participation' | 'assignment';

export interface GradeRecord {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string; // Mathematics, English, Science, Social Studies, Art, etc.
  title: string; // e.g. "Fractions Mastery Quiz #2", "Ecosystem Diorama"
  category: GradeCategory;
  term: string; // e.g. "Term 1 - Fall 2025", "Term 2 - Winter 2026", "Term 3 - Spring 2026"
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  date: string;
  comments?: string;
  strengthsObserved?: string;
  improvementNeeded?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'tardy' | 'excused' | 'medical';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  excuseReason?: string;
  timeArrived?: string;
  updatedAt: string;
}

export type BehaviorType = 'positive' | 'neutral' | 'concern';
export type BehaviorCategory = 
  | 'participation' 
  | 'teamwork' 
  | 'perseverance' 
  | 'leadership' 
  | 'kindness' 
  | 'focus' 
  | 'homework_missing' 
  | 'distraction' 
  | 'tardiness' 
  | 'disruption' 
  | 'general';

export interface BehaviorRecord {
  id: string;
  studentId: string;
  teacherId: string;
  type: BehaviorType;
  category: BehaviorCategory;
  title: string; // e.g. "Helped classmate understand geometry problem"
  description: string;
  points: number; // e.g. +5 for positive, -3 for infraction
  setting: 'classroom' | 'group_work' | 'lab' | 'recess' | 'hallway' | 'online';
  date: string; // YYYY-MM-DD
  parentNotified: boolean;
  actionTaken?: string;
  createdAt: string;
}

export interface ParentMeetingDossier {
  id: string;
  studentId: string;
  teacherId: string;
  meetingDate: string;
  attendees: string; // e.g. "Ms. Davis (Teacher), Mrs. Sarah Miller (Mother)"
  meetingType: 'scheduled_conference' | 'academic_intervention' | 'behavior_followup' | 'iep_annual';
  status: 'upcoming' | 'completed' | 'cancelled';
  keyStrengthsDiscussed: string[];
  growthAreasDiscussed: string[];
  academicSummary: string;
  actionItemsParent: string[];
  actionItemsTeacher: string[];
  studentGoal: string;
  followUpDate?: string;
  parentAcknowledged: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  schoolName?: string;
  gradeLevel?: string;
  subjectSpecialty?: string;
  academicYear?: string;
}

export interface StudentAnalytics {
  gpa: number;
  averagePercentage: number;
  gradeDistribution: { [letter: string]: number };
  totalGrades: number;
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  tardyDays: number;
  excusedDays: number;
  behaviorScore: number;
  positiveBehaviorCount: number;
  concernBehaviorCount: number;
  recentTrend: 'improving' | 'steady' | 'declining';
  subjectAverages: { [subject: string]: number };
}
