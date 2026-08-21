import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  db
} from '../lib/firebase';
import { TeacherProfile } from '../types';

interface AuthContextType {
  user: TeacherProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoTeacher: () => void;
  signOut: () => Promise<void>;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsDemoUser(false);
        const userDocRef = doc(db, 'teachers', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser(userDocSnap.data() as TeacherProfile);
          } else {
            const newProfile: TeacherProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Teacher',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
              schoolName: 'Lincoln Horizon Academy',
              gradeLevel: 'Grade 5',
              subjectSpecialty: 'Homeroom & Core Subjects',
              academicYear: '2025-2026'
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (error) {
          console.warn('Firestore teacher fetch error, using auth fallback:', error);
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Teacher',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
            schoolName: 'Lincoln Horizon Academy',
            gradeLevel: 'Grade 5',
            subjectSpecialty: 'Homeroom & Core Subjects',
            academicYear: '2025-2026'
          });
        }
      } else if (!isDemoUser) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      // If popup is blocked or fails in iframe sandbox, offer demo mode or retry
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/unauthorized-domain') {
        throw new Error(error.message || 'Popup was closed or blocked. You can also use Teacher Demo Mode.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemoTeacher = () => {
    const demoTeacher: TeacherProfile = {
      uid: 'teacher-demo-mrs-davis',
      displayName: 'Mrs. Evelyn Davis',
      email: 'evelyn.davis.edu@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      schoolName: 'Lincoln Horizon Elementary School',
      gradeLevel: 'Grade 5 - Room 5A',
      subjectSpecialty: 'Homeroom, Math & Science',
      academicYear: '2025-2026'
    };
    setIsDemoUser(true);
    setUser(demoTeacher);
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemoUser) {
      setIsDemoUser(false);
      setUser(null);
    } else {
      await firebaseSignOut(auth);
      setUser(null);
    }
  };

  const updateTeacherProfile = async (profileData: Partial<TeacherProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profileData };
    setUser(updated);
    if (!isDemoUser) {
      try {
        const userDocRef = doc(db, 'teachers', user.uid);
        await setDoc(userDocRef, updated, { merge: true });
      } catch (err) {
        console.error('Error updating teacher profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser,
        signInWithGoogle,
        signInAsDemoTeacher,
        signOut,
        updateTeacherProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
