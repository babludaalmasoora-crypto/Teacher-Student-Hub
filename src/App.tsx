import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassDataProvider, useClassData } from './context/ClassDataContext';
import { LoginView } from './components/LoginView';
import { Navigation, ActiveTab } from './components/Navigation';
import { StudentsView } from './components/views/StudentsView';
import { StudentDetailView } from './components/views/StudentDetailView';
import { GradebookView } from './components/views/GradebookView';
import { AttendanceView } from './components/views/AttendanceView';
import { BehaviorView } from './components/views/BehaviorView';
import { ParentConferencesView } from './components/views/ParentConferencesView';
import { ClassInsightsView } from './components/views/ClassInsightsView';

import { AddEditStudentModal } from './components/modals/AddEditStudentModal';
import { AddGradeModal } from './components/modals/AddGradeModal';
import { AddBehaviorModal } from './components/modals/AddBehaviorModal';
import { ParentMeetingModal } from './components/modals/ParentMeetingModal';
import { Student, GradeRecord, ParentMeetingDossier } from './types';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    students, 
    selectedStudentId, 
    setSelectedStudentId, 
    loading: dataLoading 
  } = useClassData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeStudentId, setGradeStudentId] = useState<string | undefined>(undefined);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | undefined>(undefined);

  const [behaviorModalOpen, setBehaviorModalOpen] = useState(false);
  const [behaviorStudentId, setBehaviorStudentId] = useState<string | undefined>(undefined);

  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingStudentId, setMeetingStudentId] = useState<string | undefined>(undefined);
  const [editingMeeting, setEditingMeeting] = useState<ParentMeetingDossier | undefined>(undefined);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Connecting to classroom hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Find active student if in detail view
  const selectedStudent = selectedStudentId 
    ? students.find(s => s.id === selectedStudentId)
    : null;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Sticky Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedStudentId(null);
        }}
        onOpenAddStudent={() => {
          setEditingStudent(undefined);
          setStudentModalOpen(true);
        }}
        onOpenAddGrade={() => {
          setGradeStudentId(undefined);
          setEditingGrade(undefined);
          setGradeModalOpen(true);
        }}
        onOpenAddBehavior={() => {
          setBehaviorStudentId(undefined);
          setBehaviorModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {selectedStudent ? (
          <StudentDetailView
            student={selectedStudent}
            onBack={() => setSelectedStudentId(null)}
            onEditStudent={(st) => {
              setEditingStudent(st);
              setStudentModalOpen(true);
            }}
            onOpenAddGrade={(studentId, grade) => {
              setGradeStudentId(studentId);
              setEditingGrade(grade);
              setGradeModalOpen(true);
            }}
            onOpenAddBehavior={(studentId) => {
              setBehaviorStudentId(studentId);
              setBehaviorModalOpen(true);
            }}
            onOpenParentMeeting={(studentId, meeting) => {
              setMeetingStudentId(studentId);
              setEditingMeeting(meeting);
              setMeetingModalOpen(true);
            }}
          />
        ) : (
          <>
            {activeTab === 'students' && (
              <StudentsView
                onSelectStudent={(id) => setSelectedStudentId(id)}
                onOpenAddStudent={() => {
                  setEditingStudent(undefined);
                  setStudentModalOpen(true);
                }}
                onEditStudent={(st) => {
                  setEditingStudent(st);
                  setStudentModalOpen(true);
                }}
                onQuickGrade={(id) => {
                  setGradeStudentId(id);
                  setEditingGrade(undefined);
                  setGradeModalOpen(true);
                }}
                onQuickBehavior={(id) => {
                  setBehaviorStudentId(id);
                  setBehaviorModalOpen(true);
                }}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'gradebook' && (
              <GradebookView
                onOpenAddGrade={(studentId, grade) => {
                  setGradeStudentId(studentId);
                  setEditingGrade(grade);
                  setGradeModalOpen(true);
                }}
                onSelectStudent={(id) => setSelectedStudentId(id)}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                onSelectStudent={(id) => setSelectedStudentId(id)}
              />
            )}

            {activeTab === 'behavior' && (
              <BehaviorView
                onOpenAddBehavior={(studentId) => {
                  setBehaviorStudentId(studentId);
                  setBehaviorModalOpen(true);
                }}
                onSelectStudent={(id) => setSelectedStudentId(id)}
              />
            )}

            {activeTab === 'conferences' && (
              <ParentConferencesView
                onOpenParentMeeting={(studentId, meeting) => {
                  setMeetingStudentId(studentId);
                  setEditingMeeting(meeting);
                  setMeetingModalOpen(true);
                }}
                onSelectStudent={(id) => setSelectedStudentId(id)}
              />
            )}

            {activeTab === 'insights' && (
              <ClassInsightsView
                onSelectStudent={(id) => setSelectedStudentId(id)}
                onOpenParentMeeting={(id) => {
                  setMeetingStudentId(id);
                  setMeetingModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Data Entry Modals */}
      <AddEditStudentModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false);
          setEditingStudent(undefined);
        }}
        studentToEdit={editingStudent}
      />

      <AddGradeModal
        isOpen={gradeModalOpen}
        onClose={() => {
          setGradeModalOpen(false);
          setGradeStudentId(undefined);
          setEditingGrade(undefined);
        }}
        preselectedStudentId={gradeStudentId}
        gradeToEdit={editingGrade}
      />

      <AddBehaviorModal
        isOpen={behaviorModalOpen}
        onClose={() => {
          setBehaviorModalOpen(false);
          setBehaviorStudentId(undefined);
        }}
        preselectedStudentId={behaviorStudentId}
      />

      <ParentMeetingModal
        isOpen={meetingModalOpen}
        onClose={() => {
          setMeetingModalOpen(false);
          setMeetingStudentId(undefined);
          setEditingMeeting(undefined);
        }}
        preselectedStudentId={meetingStudentId}
        meetingToEdit={editingMeeting}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClassDataProvider>
        <MainAppContent />
      </ClassDataProvider>
    </AuthProvider>
  );
}
