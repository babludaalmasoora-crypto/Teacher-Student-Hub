import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  CalendarCheck, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Mail, 
  AlertCircle, 
  MoreVertical, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  HeartHandshake,
  FolderSync
} from 'lucide-react';
import { Student } from '../../types';
import { useClassData } from '../../context/ClassDataContext';

interface StudentsViewProps {
  onSelectStudent: (id: string) => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onQuickGrade: (studentId: string) => void;
  onQuickBehavior: (studentId: string) => void;
  searchQuery: string;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onSelectStudent,
  onOpenAddStudent,
  onEditStudent,
  onQuickGrade,
  onQuickBehavior,
  searchQuery
}) => {
  const { students, deleteStudent, getStudentAnalytics, loadSampleClassroom } = useClassData();
  const [filterGender, setFilterGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'gpa_high' | 'gpa_low' | 'attendance_low' | 'behavior_high'>('name');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter & Search
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.learningNeeds && student.learningNeeds.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGender = filterGender === 'all' || student.gender === filterGender;

    return matchesSearch && matchesGender;
  });

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    const aStats = getStudentAnalytics(a.id);
    const bStats = getStudentAnalytics(b.id);

    if (sortBy === 'gpa_high') return bStats.gpa - aStats.gpa;
    if (sortBy === 'gpa_low') return aStats.gpa - bStats.gpa;
    if (sortBy === 'attendance_low') return aStats.attendanceRate - bStats.attendanceRate;
    if (sortBy === 'behavior_high') return bStats.behaviorScore - aStats.behaviorScore;
    return 0;
  });

  if (students.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Students Enrolled Yet</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Start building your classroom roster by enrolling students or instantly populate a realistic sample classroom with historical grades, photos, and attendance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenAddStudent}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll First Student</span>
          </button>
          <button
            onClick={() => loadSampleClassroom()}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <FolderSync className="w-4 h-4 text-blue-600" />
            <span>Load Sample Class (6 Students)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Class Roster
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {sortedStudents.length} {sortedStudents.length === 1 ? 'Student' : 'Students'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Gender Filter */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Genders</option>
            <option value="female">Female Students</option>
            <option value="male">Male Students</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="gpa_high">Highest GPA First</option>
            <option value="gpa_low">Lowest GPA (Needs Support)</option>
            <option value="attendance_low">Lowest Attendance %</option>
            <option value="behavior_high">Highest Merit Points</option>
          </select>

          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedStudents.map((student) => {
          const stats = getStudentAnalytics(student.id);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top: Photo & Details */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Photo & Basic Info */}
                  <div className="flex items-center gap-3.5">
                    <div 
                      onClick={() => onSelectStudent(student.id)}
                      className="relative cursor-pointer shrink-0"
                    >
                      <img
                        src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                        alt={student.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 group-hover:scale-105 transition-all shadow-xs"
                      />
                      {stats.attendanceRate < 85 && (
                        <span 
                          title="Attendance Alert (<85%)"
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white"
                        >
                          !
                        </span>
                      )}
                    </div>

                    <div>
                      <h3
                        onClick={() => onSelectStudent(student.id)}
                        className="font-bold text-slate-900 text-base leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {student.rollNumber || 'No ID'}
                        </span>
                        <span>{student.section || student.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === student.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                        <button
                          onClick={() => {
                            onSelectStudent(student.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                        >
                          <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Full Dossier</span>
                        </button>
                        <button
                          onClick={() => {
                            onQuickGrade(student.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>Log Grade</span>
                        </button>
                        <button
                          onClick={() => {
                            onQuickBehavior(student.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Record Behavior</span>
                        </button>
                        <button
                          onClick={() => {
                            onEditStudent(student);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Profile</span>
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${student.name} from classroom?`)) {
                              deleteStudent(student.id);
                            }
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Student</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges / Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  
                  {/* GPA / Average */}
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      GPA / Avg
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-sm font-extrabold text-slate-800">
                        {stats.totalGrades > 0 ? stats.gpa.toFixed(1) : '—'}
                      </span>
                      {stats.totalGrades > 0 && (
                        <span className="text-[11px] font-semibold text-blue-600">
                          ({stats.averagePercentage}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Attendance
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className={`text-sm font-extrabold ${
                        stats.attendanceRate >= 92 ? 'text-emerald-600' :
                        stats.attendanceRate >= 85 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {stats.attendanceRate}%
                      </span>
                    </div>
                  </div>

                  {/* Merits / Behavior */}
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Merits
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className={`text-sm font-extrabold ${
                        stats.behaviorScore >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {stats.behaviorScore >= 0 ? `+${stats.behaviorScore}` : stats.behaviorScore}
                      </span>
                      <span className="text-[10px] text-slate-400">pts</span>
                    </div>
                  </div>

                </div>

                {/* Learning & Parent Snapshot */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  {student.learningNeeds && (
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 shrink-0 text-indigo-500" />
                      <span className="truncate">{student.learningNeeds}</span>
                    </div>
                  )}

                  {student.medicalNotes && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 px-2.5 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3 shrink-0 text-amber-600" />
                      <span className="truncate">{student.medicalNotes}</span>
                    </div>
                  )}

                  {student.parentName && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span className="truncate">Parent: {student.parentName}</span>
                      {student.parentPhone && (
                        <a href={`tel:${student.parentPhone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQuickGrade(student.id)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    title="Log new grade for this student"
                  >
                    + Grade
                  </button>
                  <button
                    onClick={() => onQuickBehavior(student.id)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    title="Record behavior or praise"
                  >
                    + Praise/Note
                  </button>
                </div>

                <button
                  onClick={() => onSelectStudent(student.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <span>Full Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
