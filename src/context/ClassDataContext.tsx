import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Student, 
  GradeRecord, 
  AttendanceRecord, 
  BehaviorRecord, 
  ParentMeetingDossier,
  StudentAnalytics
} from '../types';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from '../lib/firebase';
import { useAuth } from './AuthContext';
import { generateSampleClassData } from '../data/sampleClassroom';
import { computeStudentAnalytics } from '../utils/studentAnalytics';

interface ClassDataContextType {
  students: Student[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  behaviors: BehaviorRecord[];
  parentMeetings: ParentMeetingDossier[];
  loading: boolean;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Grade Actions
  addGrade: (grade: Omit<GradeRecord, 'id' | 'teacherId' | 'createdAt'>) => Promise<string>;
  updateGrade: (id: string, updates: Partial<GradeRecord>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  bulkAddGrades: (gradesList: Omit<GradeRecord, 'id' | 'teacherId' | 'createdAt'>[]) => Promise<void>;
  // Attendance Actions
  markAttendance: (studentId: string, date: string, status: AttendanceRecord['status'], notes?: string) => Promise<void>;
  bulkMarkAttendance: (date: string, records: { studentId: string; status: AttendanceRecord['status']; notes?: string }[]) => Promise<void>;
  // Behavior Actions
  addBehavior: (behavior: Omit<BehaviorRecord, 'id' | 'teacherId' | 'createdAt'>) => Promise<string>;
  deleteBehavior: (id: string) => Promise<void>;
  // Parent Meeting Actions
  saveParentMeeting: (dossier: Omit<ParentMeetingDossier, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<string>;
  deleteParentMeeting: (id: string) => Promise<void>;
  // Utility
  getStudentAnalytics: (studentId: string) => StudentAnalytics;
  loadSampleClassroom: () => Promise<void>;
  clearClassroomData: () => Promise<void>;
}

const ClassDataContext = createContext<ClassDataContextType | undefined>(undefined);

export const ClassDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  const [parentMeetings, setParentMeetings] = useState<ParentMeetingDossier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Sync with Firestore or LocalStorage
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setGrades([]);
      setAttendance([]);
      setBehaviors([]);
      setParentMeetings([]);
      setLoading(false);
      return;
    }

    if (isDemoUser) {
      // Load demo data from localStorage or initialize sample
      const localKey = `teacher_hub_demo_${user.uid}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStudents(parsed.students || []);
          setGrades(parsed.grades || []);
          setAttendance(parsed.attendance || []);
          setBehaviors(parsed.behaviors || []);
          setParentMeetings(parsed.parentMeetings || []);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse local demo data', e);
        }
      }

      // Initialize fresh sample data for demo teacher
      const sample = generateSampleClassData(user.uid);
      setStudents(sample.students);
      setGrades(sample.grades);
      setAttendance(sample.attendance);
      setBehaviors(sample.behaviors);
      setParentMeetings(sample.dossiers);
      localStorage.setItem(localKey, JSON.stringify({
        students: sample.students,
        grades: sample.grades,
        attendance: sample.attendance,
        behaviors: sample.behaviors,
        parentMeetings: sample.dossiers
      }));
      setLoading(false);
      return;
    }

    // Live Firestore Listeners for authenticated Google user
    setLoading(true);
    const teacherId = user.uid;

    const unsubStudents = onSnapshot(
      query(collection(db, 'students'), where('teacherId', '==', teacherId)),
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Student));
        // Sort students alphabetically
        list.sort((a, b) => a.name.localeCompare(b.name));
        setStudents(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore students listener error:', err);
        setLoading(false);
      }
    );

    const unsubGrades = onSnapshot(
      query(collection(db, 'grades'), where('teacherId', '==', teacherId)),
      (snapshot) => {
        const list: GradeRecord[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as GradeRecord));
        setGrades(list);
      }
    );

    const unsubAttendance = onSnapshot(
      query(collection(db, 'attendance'), where('teacherId', '==', teacherId)),
      (snapshot) => {
        const list: AttendanceRecord[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as AttendanceRecord));
        setAttendance(list);
      }
    );

    const unsubBehaviors = onSnapshot(
      query(collection(db, 'behavior'), where('teacherId', '==', teacherId)),
      (snapshot) => {
        const list: BehaviorRecord[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as BehaviorRecord));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBehaviors(list);
      }
    );

    const unsubMeetings = onSnapshot(
      query(collection(db, 'parent_meetings'), where('teacherId', '==', teacherId)),
      (snapshot) => {
        const list: ParentMeetingDossier[] = [];
        snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as ParentMeetingDossier));
        setParentMeetings(list);
      }
    );

    return () => {
      unsubStudents();
      unsubGrades();
      unsubAttendance();
      unsubBehaviors();
      unsubMeetings();
    };
  }, [user, isDemoUser]);

  // Helper to persist demo state
  const saveDemoState = useCallback((
    newStudents: Student[],
    newGrades: GradeRecord[],
    newAttendance: AttendanceRecord[],
    newBehaviors: BehaviorRecord[],
    newMeetings: ParentMeetingDossier[]
  ) => {
    if (!user || !isDemoUser) return;
    const localKey = `teacher_hub_demo_${user.uid}`;
    localStorage.setItem(localKey, JSON.stringify({
      students: newStudents,
      grades: newGrades,
      attendance: newAttendance,
      behaviors: newBehaviors,
      parentMeetings: newMeetings
    }));
  }, [user, isDemoUser]);

  // Student Actions
  const addStudent = async (data: Omit<Student, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Teacher is not logged in');
    const id = `stu_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...data,
      id,
      teacherId: user.uid,
      createdAt: now,
      updatedAt: now
    };

    if (isDemoUser) {
      const updated = [...students, newStudent];
      setStudents(updated);
      saveDemoState(updated, grades, attendance, behaviors, parentMeetings);
    } else {
      await setDoc(doc(db, 'students', id), newStudent);
    }
    return id;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    if (!user) return;
    const now = new Date().toISOString();
    if (isDemoUser) {
      const updated = students.map(s => s.id === id ? { ...s, ...updates, updatedAt: now } : s);
      setStudents(updated);
      saveDemoState(updated, grades, attendance, behaviors, parentMeetings);
    } else {
      await setDoc(doc(db, 'students', id), { ...updates, updatedAt: now }, { merge: true });
    }
  };

  const deleteStudent = async (id: string) => {
    if (!user) return;
    if (isDemoUser) {
      const updatedStudents = students.filter(s => s.id !== id);
      const updatedGrades = grades.filter(g => g.studentId !== id);
      const updatedAttendance = attendance.filter(a => a.studentId !== id);
      const updatedBehaviors = behaviors.filter(b => b.studentId !== id);
      const updatedMeetings = parentMeetings.filter(m => m.studentId !== id);
      setStudents(updatedStudents);
      setGrades(updatedGrades);
      setAttendance(updatedAttendance);
      setBehaviors(updatedBehaviors);
      setParentMeetings(updatedMeetings);
      saveDemoState(updatedStudents, updatedGrades, updatedAttendance, updatedBehaviors, updatedMeetings);
      if (selectedStudentId === id) setSelectedStudentId(null);
    } else {
      await deleteDoc(doc(db, 'students', id));
      if (selectedStudentId === id) setSelectedStudentId(null);
    }
  };

  // Grade Actions
  const addGrade = async (gradeData: Omit<GradeRecord, 'id' | 'teacherId' | 'createdAt'>) => {
    if (!user) throw new Error('Not logged in');
    const id = `grd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newGrade: GradeRecord = {
      ...gradeData,
      id,
      teacherId: user.uid,
      createdAt: new Date().toISOString()
    };

    if (isDemoUser) {
      const updated = [...grades, newGrade];
      setGrades(updated);
      saveDemoState(students, updated, attendance, behaviors, parentMeetings);
    } else {
      await setDoc(doc(db, 'grades', id), newGrade);
    }
    return id;
  };

  const updateGrade = async (id: string, updates: Partial<GradeRecord>) => {
    if (!user) return;
    if (isDemoUser) {
      const updated = grades.map(g => g.id === id ? { ...g, ...updates } : g);
      setGrades(updated);
      saveDemoState(students, updated, attendance, behaviors, parentMeetings);
    } else {
      await setDoc(doc(db, 'grades', id), updates, { merge: true });
    }
  };

  const deleteGrade = async (id: string) => {
    if (!user) return;
    if (isDemoUser) {
      const updated = grades.filter(g => g.id !== id);
      setGrades(updated);
      saveDemoState(students, updated, attendance, behaviors, parentMeetings);
    } else {
      await deleteDoc(doc(db, 'grades', id));
    }
  };

  const bulkAddGrades = async (gradesList: Omit<GradeRecord, 'id' | 'teacherId' | 'createdAt'>[]) => {
    if (!user) return;
    const now = new Date().toISOString();
    const createdGrades: GradeRecord[] = gradesList.map((g, idx) => ({
      ...g,
      id: `grd_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      teacherId: user.uid,
      createdAt: now
    }));

    if (isDemoUser) {
      const updated = [...grades, ...createdGrades];
      setGrades(updated);
      saveDemoState(students, updated, attendance, behaviors, parentMeetings);
    } else {
      for (const g of createdGrades) {
        await setDoc(doc(db, 'grades', g.id), g);
      }
    }
  };

  // Attendance Actions
  const markAttendance = async (
    studentId: string, 
    date: string, 
    status: AttendanceRecord['status'], 
    notes?: string
  ) => {
    if (!user) return;
    const existing = attendance.find(a => a.studentId === studentId && a.date === date);
    const id = existing ? existing.id : `att_${studentId}_${date}`;
    const record: AttendanceRecord = {
      id,
      studentId,
      teacherId: user.uid,
      date,
      status,
      notes: notes !== undefined ? notes : existing?.notes,
      updatedAt: new Date().toISOString()
    };

    if (isDemoUser) {
      const updated = existing
        ? attendance.map(a => a.id === id ? record : a)
        : [...attendance, record];
      setAttendance(updated);
      saveDemoState(students, grades, updated, behaviors, parentMeetings);
    } else {
      await setDoc(doc(db, 'attendance', id), record);
    }
  };

  const bulkMarkAttendance = async (
    date: string, 
    records: { studentId: string; status: AttendanceRecord['status']; notes?: string }[]
  ) => {
    if (!user) return;
    const now = new Date().toISOString();

    if (isDemoUser) {
      let updated = [...attendance];
      records.forEach(r => {
        const id = `att_${r.studentId}_${date}`;
        const existingIdx = updated.findIndex(a => a.studentId === r.studentId && a.date === date);
        const item: AttendanceRecord = {
          id,
          studentId: r.studentId,
          teacherId: user.uid,
          date,
          status: r.status,
          notes: r.notes || '',
          updatedAt: now
        };
        if (existingIdx >= 0) {
          updated[existingIdx] = item;
        } else {
          updated.push(item);
        }
      });
      setAttendance(updated);
      saveDemoState(students, grades, updated, behaviors, parentMeetings);
    } else {
      for (const r of records) {
        const id = `att_${r.studentId}_${date}`;
        const item: AttendanceRecord = {
          id,
          studentId: r.studentId,
          teacherId: user.uid,
          date,
          status: r.status,
          notes: r.notes || '',
          updatedAt: now
        };
        await setDoc(doc(db, 'attendance', id), item);
      }
    }
  };

  // Behavior Actions
  const addBehavior = async (data: Omit<BehaviorRecord, 'id' | 'teacherId' | 'createdAt'>) => {
    if (!user) throw new Error('Not logged in');
    const id = `beh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newRecord: BehaviorRecord = {
      ...data,
      id,
      teacherId: user.uid,
      createdAt: new Date().toISOString()
    };

    if (isDemoUser) {
      const updated = [newRecord, ...behaviors];
      setBehaviors(updated);
      saveDemoState(students, grades, attendance, updated, parentMeetings);
    } else {
      await setDoc(doc(db, 'behavior', id), newRecord);
    }
    return id;
  };

  const deleteBehavior = async (id: string) => {
    if (!user) return;
    if (isDemoUser) {
      const updated = behaviors.filter(b => b.id !== id);
      setBehaviors(updated);
      saveDemoState(students, grades, attendance, updated, parentMeetings);
    } else {
      await deleteDoc(doc(db, 'behavior', id));
    }
  };

  // Parent Meeting Actions
  const saveParentMeeting = async (
    dossier: Omit<ParentMeetingDossier, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (!user) throw new Error('Not logged in');
    const now = new Date().toISOString();
    const id = dossier.id || `mtg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const savedDossier: ParentMeetingDossier = {
      ...dossier,
      id,
      teacherId: user.uid,
      createdAt: dossier.id ? (parentMeetings.find(m => m.id === dossier.id)?.createdAt || now) : now,
      updatedAt: now
    };

    if (isDemoUser) {
      const existingIdx = parentMeetings.findIndex(m => m.id === id);
      const updated = existingIdx >= 0
        ? parentMeetings.map(m => m.id === id ? savedDossier : m)
        : [savedDossier, ...parentMeetings];
      setParentMeetings(updated);
      saveDemoState(students, grades, attendance, behaviors, updated);
    } else {
      await setDoc(doc(db, 'parent_meetings', id), savedDossier);
    }
    return id;
  };

  const deleteParentMeeting = async (id: string) => {
    if (!user) return;
    if (isDemoUser) {
      const updated = parentMeetings.filter(m => m.id !== id);
      setParentMeetings(updated);
      saveDemoState(students, grades, attendance, behaviors, updated);
    } else {
      await deleteDoc(doc(db, 'parent_meetings', id));
    }
  };

  // Get student analytics helper
  const getStudentAnalytics = useCallback((studentId: string): StudentAnalytics => {
    return computeStudentAnalytics(studentId, grades, attendance, behaviors);
  }, [grades, attendance, behaviors]);

  // Load sample classroom
  const loadSampleClassroom = async () => {
    if (!user) return;
    setLoading(true);
    const sample = generateSampleClassData(user.uid);

    if (isDemoUser) {
      setStudents(sample.students);
      setGrades(sample.grades);
      setAttendance(sample.attendance);
      setBehaviors(sample.behaviors);
      setParentMeetings(sample.dossiers);
      saveDemoState(sample.students, sample.grades, sample.attendance, sample.behaviors, sample.dossiers);
    } else {
      // Write sample students to firestore
      for (const s of sample.students) {
        await setDoc(doc(db, 'students', s.id), s);
      }
      for (const g of sample.grades) {
        await setDoc(doc(db, 'grades', g.id), g);
      }
      for (const a of sample.attendance) {
        await setDoc(doc(db, 'attendance', a.id), a);
      }
      for (const b of sample.behaviors) {
        await setDoc(doc(db, 'behavior', b.id), b);
      }
      for (const m of sample.dossiers) {
        await setDoc(doc(db, 'parent_meetings', m.id), m);
      }
    }
    setLoading(false);
  };

  // Clear classroom data
  const clearClassroomData = async () => {
    if (!user) return;
    if (isDemoUser) {
      setStudents([]);
      setGrades([]);
      setAttendance([]);
      setBehaviors([]);
      setParentMeetings([]);
      saveDemoState([], [], [], [], []);
      setSelectedStudentId(null);
    } else {
      for (const s of students) await deleteDoc(doc(db, 'students', s.id));
      for (const g of grades) await deleteDoc(doc(db, 'grades', g.id));
      for (const a of attendance) await deleteDoc(doc(db, 'attendance', a.id));
      for (const b of behaviors) await deleteDoc(doc(db, 'behavior', b.id));
      for (const m of parentMeetings) await deleteDoc(doc(db, 'parent_meetings', m.id));
      setSelectedStudentId(null);
    }
  };

  return (
    <ClassDataContext.Provider
      value={{
        students,
        grades,
        attendance,
        behaviors,
        parentMeetings,
        loading,
        selectedStudentId,
        setSelectedStudentId,
        addStudent,
        updateStudent,
        deleteStudent,
        addGrade,
        updateGrade,
        deleteGrade,
        bulkAddGrades,
        markAttendance,
        bulkMarkAttendance,
        addBehavior,
        deleteBehavior,
        saveParentMeeting,
        deleteParentMeeting,
        getStudentAnalytics,
        loadSampleClassroom,
        clearClassroomData
      }}
    >
      {children}
    </ClassDataContext.Provider>
  );
};

export const useClassData = () => {
  const context = useContext(ClassDataContext);
  if (!context) {
    throw new Error('useClassData must be used within a ClassDataProvider');
  }
  return context;
};
