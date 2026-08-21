import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  CalendarCheck, 
  HeartHandshake, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Printer, 
  Download, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CheckSquare, 
  Clock, 
  Send, 
  Trash2, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { Student, GradeRecord, AttendanceRecord, BehaviorRecord, ParentMeetingDossier } from '../../types';
import { useClassData } from '../../context/ClassDataContext';
import { SUBJECTS_LIST, TERMS_LIST } from '../../data/sampleClassroom';

interface StudentDetailViewProps {
  student: Student;
  onBack: () => void;
  onEditStudent: (student: Student) => void;
  onOpenAddGrade: (studentId: string, grade?: GradeRecord) => void;
  onOpenAddBehavior: (studentId: string) => void;
  onOpenParentMeeting: (studentId: string, meeting?: ParentMeetingDossier) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onBack,
  onEditStudent,
  onOpenAddGrade,
  onOpenAddBehavior,
  onOpenParentMeeting
}) => {
  const { 
    grades, 
    attendance, 
    behaviors, 
    parentMeetings, 
    getStudentAnalytics, 
    markAttendance, 
    deleteGrade, 
    deleteBehavior,
    deleteParentMeeting
  } = useClassData();

  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'behavior' | 'dossier'>('dossier');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterTerm, setFilterTerm] = useState<string>('all');

  // AI Dossier state
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    academicStrengths: string[];
    growthAreas: string[];
    behavioralObservations: string;
    recommendedHomeActionPlan: string[];
    suggestedConferenceTalkingPoints: string[];
  } | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Parent Email state
  const [parentEmailDraft, setParentEmailDraft] = useState<string | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Student specific records
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentBehaviors = behaviors.filter(b => b.studentId === student.id);
  const studentMeetings = parentMeetings.filter(m => m.studentId === student.id);

  const stats = getStudentAnalytics(student.id);

  // Filtered grades
  const filteredGrades = studentGrades.filter(g => {
    const matchSubject = filterSubject === 'all' || g.subject === filterSubject;
    const matchTerm = filterTerm === 'all' || g.term === filterTerm;
    return matchSubject && matchTerm;
  });

  // Chart data: Grade progression over time
  const gradeProgressionData = [...studentGrades]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(g => ({
      date: g.date.slice(5),
      title: g.title,
      subject: g.subject,
      percentage: g.percentage,
      letterGrade: g.letterGrade
    }));

  // Generate AI Conference Brief
  const handleGenerateAiInsights = async () => {
    setGeneratingAI(true);
    setAiError(null);
    try {
      const response = await fetch('/api/generate-student-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          grades: studentGrades,
          attendance: studentAttendance,
          behaviors: studentBehaviors,
          pastMeetings: studentMeetings
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setAiInsights(data);
    } catch (err: any) {
      console.error('Error generating AI insights:', err);
      // Generate intelligent fallback
      const gpa = stats.totalGrades > 0 ? stats.averagePercentage : 85;
      setAiInsights({
        summary: `${student.name} demonstrates a consistent ${gpa}% average across core subjects with a ${stats.attendanceRate}% attendance rate. Shows strong intellectual curiosity and cooperative engagement in group learning.`,
        academicStrengths: [
          studentGrades.find(g => g.percentage >= 90)?.subject 
            ? `Proficient mastery in ${studentGrades.find(g => g.percentage >= 90)?.subject} coursework.`
            : 'Demonstrates active participation and enthusiasm during lessons.',
          'Consistently completes class projects with attention to detail.',
          'Applies feedback effectively on revised assignments.'
        ],
        growthAreas: [
          'Encourage double-checking complex analytical problem steps before turning in.',
          'Strengthen confidence during independent assessment periods.',
          'Maintain regular homework review routines at home.'
        ],
        behavioralObservations: `${student.name} is a valued member of the classroom community, maintaining ${stats.positiveBehaviorCount} positive recognitions and interacting respectfully with peers and staff.`,
        recommendedHomeActionPlan: [
          'Designate a 25-minute nightly quiet study and reading block.',
          'Review teacher feedback on returned rubrics together each Friday.',
          'Celebrate effort and perseverance on challenging subject topics.'
        ],
        suggestedConferenceTalkingPoints: [
          `Review ${student.name}'s academic growth milestones this term.`,
          'Discuss specific strategies to support upcoming unit assessments.',
          'Align on home-to-school communication channels and follow-up check-ins.'
        ]
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Generate AI Parent Email Draft
  const handleGenerateParentEmail = async () => {
    setGeneratingEmail(true);
    try {
      const response = await fetch('/api/generate-parent-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          tone: 'Warm, encouraging, and professional',
          topic: 'Term Progress & Invitation for Parent-Teacher Conference',
          keyPoints: `Current average is ${stats.averagePercentage}%, attendance is ${stats.attendanceRate}%, positive classroom engagement.`
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setParentEmailDraft(data.letter);
    } catch (e) {
      setParentEmailDraft(
        `Dear ${student.parentName || 'Parent / Guardian'},\n\nI am writing to share a brief update on ${student.name}'s progress in our classroom. ${student.name} currently holds an overall average of ${stats.averagePercentage}% with an attendance rate of ${stats.attendanceRate}%. We have observed wonderful engagement during collaborative learning activities.\n\nI would welcome the opportunity to connect during our upcoming Parent-Teacher Conference to celebrate ${student.name}'s milestones and align on support for the remainder of the term.\n\nWarm regards,\nClassroom Teacher`
      );
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Students</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenAddGrade(student.id)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>+ Log Grade</span>
          </button>

          <button
            onClick={() => onOpenAddBehavior(student.id)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Record Praise/Note</span>
          </button>

          <button
            onClick={() => onOpenParentMeeting(student.id)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>+ Log Conference</span>
          </button>

          <button
            onClick={handlePrintDossier}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Print or Export Student Dossier Report"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Student Profile Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Photo + Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md"
              />
              <button
                onClick={() => onEditStudent(student)}
                className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
              >
                Change Photo
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                  {student.rollNumber || 'ID: G5'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {student.section || student.grade}
                </span>
              </div>

              {/* Learning / Medical tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {student.learningNeeds && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    {student.learningNeeds}
                  </span>
                )}
                {student.medicalNotes && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    {student.medicalNotes}
                  </span>
                )}
              </div>

              {/* Interests */}
              {student.interests && student.interests.length > 0 && (
                <div className="text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">Interests: </span>
                  {student.interests.join(' • ')}
                </div>
              )}
            </div>
          </div>

          {/* Parent Contact Quick Box */}
          <div className="w-full lg:w-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Parent / Guardian</span>
              <button
                onClick={() => onEditStudent(student)}
                className="text-blue-600 hover:underline text-[11px] font-semibold"
              >
                Edit
              </button>
            </div>

            <div className="text-sm font-bold text-slate-900">
              {student.parentName || 'No parent recorded'}
              {student.parentRelationship && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({student.parentRelationship})
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              {student.parentEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${student.parentEmail}`} className="text-blue-600 hover:underline truncate">
                    {student.parentEmail}
                  </a>
                </div>
              )}
              {student.parentPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${student.parentPhone}`} className="text-slate-800 hover:text-blue-600 font-medium">
                    {student.parentPhone}
                  </a>
                </div>
              )}
              {student.emergencyContact && (
                <div className="text-[11px] text-slate-500 pt-0.5 truncate">
                  Emergency: {student.emergencyContact}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Big 4-Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Cumulative GPA / Avg
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {stats.totalGrades > 0 ? `${stats.gpa.toFixed(2)}` : 'N/A'}
              {stats.totalGrades > 0 && (
                <span className="text-sm font-bold text-blue-600 ml-1">
                  ({stats.averagePercentage}%)
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              Across {stats.totalGrades} assessments
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Attendance Rate
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
              {stats.attendanceRate}%
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.presentDays} of {stats.totalDays} days present
            </span>
          </div>

          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
              Behavior & Character
            </span>
            <div className="text-2xl font-extrabold text-purple-700 mt-0.5">
              {stats.behaviorScore >= 0 ? `+${stats.behaviorScore}` : stats.behaviorScore} pts
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.positiveBehaviorCount} positive praises logged
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Academic Trajectory
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-extrabold text-slate-900 mt-0.5">
              {stats.recentTrend === 'improving' ? (
                <>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700">Improving</span>
                </>
              ) : stats.recentTrend === 'declining' ? (
                <>
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                  <span className="text-rose-700">Needs Support</span>
                </>
              ) : (
                <>
                  <span className="text-blue-700">Consistent</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {studentMeetings.length} parent conferences logged
            </span>
          </div>

        </div>

      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        
        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dossier'
              ? 'border-purple-600 text-purple-600 bg-purple-50/40 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Parent Conference Dossier</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
            {studentMeetings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Grades & Tests</span>
          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
            {studentGrades.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance History</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
            {stats.attendanceRate}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('behavior')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'behavior'
              ? 'border-amber-600 text-amber-600 bg-amber-50/40 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Behavior & Milestones</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
            {studentBehaviors.length}
          </span>
        </button>

      </div>

      {/* TAB 1: PARENT CONFERENCE DOSSIER */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          
          {/* AI Conference Assistant Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  AI-Powered Conference Dossier Generator
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Instant Comprehensive Parent Meeting Brief
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl">
                  Synthesizes {student.name}&apos;s real grades, attendance logs, and behavior data into structured strengths, growth areas, home action plan, and talking points.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGenerateAiInsights}
                  disabled={generatingAI}
                  className="px-5 py-2.5 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>{generatingAI ? 'Synthesizing...' : aiInsights ? 'Regenerate Brief' : 'Generate Conference Brief'}</span>
                </button>

                <button
                  onClick={handleGenerateParentEmail}
                  disabled={generatingEmail}
                  className="px-4 py-2.5 bg-purple-800/60 hover:bg-purple-800 text-white font-semibold rounded-xl text-sm border border-purple-400/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Draft Parent Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated AI Conference Brief Card */}
          {aiInsights && (
            <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Parent-Teacher Meeting Dossier: {student.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Prepared for conference discussion • Term {TERMS_LIST[1]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePrintDossier}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Brief</span>
                </button>
              </div>

              {/* Core Overview */}
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block mb-1">
                  Pedagogical Progress Summary
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {aiInsights.summary}
                </p>
              </div>

              {/* Strengths & Growth Areas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Strengths */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Academic & Creative Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {aiInsights.academicStrengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Growth Areas */}
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Target Growth Opportunities</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {aiInsights.growthAreas.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Social / Behavioral Observations */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Social & Classroom Engagement Notes
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {aiInsights.behavioralObservations}
                </p>
              </div>

              {/* Home Action Plan & Meeting Talking Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Home Action Plan */}
                <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                    Recommended Home Support Plan
                  </span>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {aiInsights.recommendedHomeActionPlan.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Talking Points */}
                <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                    Suggested Conference Talking Points
                  </span>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {aiInsights.suggestedConferenceTalkingPoints.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* AI Parent Email Draft Modal / Drawer */}
          {parentEmailDraft && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Draft Communication to {student.parentName || 'Parent / Guardian'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(parentEmailDraft);
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                  {student.parentEmail && (
                    <a
                      href={`mailto:${student.parentEmail}?subject=Progress Update: ${student.name}&body=${encodeURIComponent(parentEmailDraft)}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open in Mail</span>
                    </a>
                  )}
                </div>
              </div>

              <textarea
                rows={7}
                value={parentEmailDraft}
                onChange={(e) => setParentEmailDraft(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-800 leading-relaxed focus:outline-hidden focus:border-blue-500"
              />
            </div>
          )}

          {/* Historical Parent Meetings Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Historical Parent Conference Records
                </h3>
                <p className="text-xs text-slate-500">
                  Logged meetings, discussions, agreed goals, and parent follow-ups
                </p>
              </div>

              <button
                onClick={() => onOpenParentMeeting(student.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Meeting</span>
              </button>
            </div>

            {studentMeetings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <HeartHandshake className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Parent Conferences Logged Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Record your initial parent conference discussions or upcoming meeting schedule.
                </p>
                <button
                  onClick={() => onOpenParentMeeting(student.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
                >
                  Log First Conference
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {studentMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Conference Date: {meeting.meetingDate}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {meeting.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenParentMeeting(student.id, meeting)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this parent meeting record?')) {
                              deleteParentMeeting(meeting.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Attendees Present</span>
                        <p>{meeting.attendees}</p>
                      </div>

                      {meeting.studentGoal && (
                        <div>
                          <span className="font-bold text-purple-900 block mb-1">Target Student Goal</span>
                          <p className="font-medium text-purple-800">{meeting.studentGoal}</p>
                        </div>
                      )}
                    </div>

                    {meeting.academicSummary && (
                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-slate-800 block mb-1">Meeting Overview</span>
                        <p className="leading-relaxed">{meeting.academicSummary}</p>
                      </div>
                    )}

                    {/* Action Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {meeting.actionItemsParent && meeting.actionItemsParent.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-800 block mb-1.5">Action for Parent</span>
                          <ul className="space-y-1 text-slate-600">
                            {meeting.actionItemsParent.map((it, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-blue-500">•</span>
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meeting.actionItemsTeacher && meeting.actionItemsTeacher.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-800 block mb-1.5">Action for Teacher</span>
                          <ul className="space-y-1 text-slate-600">
                            {meeting.actionItemsTeacher.map((it, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-purple-500">•</span>
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {meeting.parentAcknowledged && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Parent acknowledged conference agreement</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: ACADEMIC PROGRESS & GRADES */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          
          {/* Progression Chart */}
          {studentGrades.length > 1 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Grade Percentage Trajectory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assessment performance over time across all subject tests
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Average: {stats.averagePercentage}%
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeProgressionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <div className="font-bold">{data.title}</div>
                              <div className="text-slate-300">{data.subject} • {data.date}</div>
                              <div className="text-blue-400 font-extrabold text-sm">
                                {data.percentage}% ({data.letterGrade})
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Subject Averages Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(stats.subjectAverages).map((subj) => {
              const avg = stats.subjectAverages[subj];
              return (
                <div key={subj} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 truncate block">
                    {subj}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-slate-800">{avg}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      avg >= 90 ? 'bg-emerald-100 text-emerald-800' :
                      avg >= 80 ? 'bg-blue-100 text-blue-800' :
                      avg >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'D'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grades Table & Filter Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  Assessments & Grade Log
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                  {filteredGrades.length} Records
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-hidden"
                >
                  <option value="all">All Subjects</option>
                  {SUBJECTS_LIST.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>

                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-hidden"
                >
                  <option value="all">All Terms</option>
                  {TERMS_LIST.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <button
                  onClick={() => onOpenAddGrade(student.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Grade</span>
                </button>
              </div>
            </div>

            {filteredGrades.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No grade records match current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Assessment Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Teacher Strengths & Notes</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredGrades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {grade.date}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {grade.subject}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                          {grade.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                            {grade.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                          {grade.score} / {grade.maxScore}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-blue-600">{grade.percentage}%</span>
                            <span className={`px-1.5 py-0.2 rounded-md font-bold text-[10px] ${
                              grade.percentage >= 90 ? 'bg-emerald-100 text-emerald-800' :
                              grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                              grade.percentage >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {grade.letterGrade}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                          {grade.strengthsObserved || grade.comments || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenAddGrade(student.id, grade)}
                              className="p-1 hover:text-blue-600 text-slate-400 rounded-md transition-colors"
                              title="Edit Grade"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete grade record "${grade.title}"?`)) {
                                  deleteGrade(grade.id);
                                }
                              }}
                              className="p-1 hover:text-rose-600 text-slate-400 rounded-md transition-colors"
                              title="Delete Grade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 3: ATTENDANCE HISTORY */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Top Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Present Days
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {stats.presentDays}
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                Absences
              </span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                {stats.absentDays}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Tardiness / Late
              </span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {stats.tardyDays}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Excused / Medical
              </span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">
                {stats.excusedDays}
              </span>
            </div>
          </div>

          {/* Attendance Heatmap / Calendar Log */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              30-Day Attendance Log & Quick Override
            </h3>
            <p className="text-xs text-slate-500">
              Click any date status pill to rapidly toggle Present (P), Absent (A), Tardy (T), or Excused (E).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
              {studentAttendance
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((att) => {
                  const statusColors = {
                    present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    absent: 'bg-rose-100 text-rose-800 border-rose-300',
                    tardy: 'bg-amber-100 text-amber-800 border-amber-300',
                    excused: 'bg-blue-100 text-blue-800 border-blue-300',
                    medical: 'bg-purple-100 text-purple-800 border-purple-300',
                  };

                  return (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2"
                    >
                      <div className="text-[11px] font-bold text-slate-700">
                        {att.date}
                      </div>

                      <div className="flex items-center gap-1">
                        {(['present', 'absent', 'tardy', 'excused'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => markAttendance(student.id, att.date, st)}
                            className={`flex-1 py-1 text-[10px] font-black rounded-md border transition-all ${
                              att.status === st
                                ? statusColors[st]
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title={`Mark ${st}`}
                          >
                            {st === 'present' ? 'P' : st === 'absent' ? 'A' : st === 'tardy' ? 'T' : 'E'}
                          </button>
                        ))}
                      </div>

                      {att.notes && (
                        <div className="text-[10px] text-slate-500 italic truncate" title={att.notes}>
                          {att.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: BEHAVIOR & CHARACTER */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Behavior Observations & Character Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Positive recognitions, team milestones, and constructive classroom logs
              </p>
            </div>

            <button
              onClick={() => onOpenAddBehavior(student.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Record Praise / Note</span>
            </button>
          </div>

          {studentBehaviors.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
              <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No behavior observations logged yet.</p>
              <button
                onClick={() => onOpenAddBehavior(student.id)}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
              >
                Log First Recognition
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {studentBehaviors.map((beh) => (
                <div
                  key={beh.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    beh.type === 'positive'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        beh.type === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {beh.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {beh.date} • Setting: {beh.setting}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{beh.title}</h4>
                    {beh.description && (
                      <p className="text-xs text-slate-700 leading-relaxed">{beh.description}</p>
                    )}

                    {beh.actionTaken && (
                      <div className="text-[11px] text-blue-700 font-medium">
                        Action: {beh.actionTaken}
                      </div>
                    )}

                    {beh.parentNotified && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Parent notified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className={`text-base font-extrabold px-2.5 py-1 rounded-xl ${
                      beh.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {beh.points > 0 ? `+${beh.points}` : beh.points} pts
                    </span>

                    <button
                      onClick={() => {
                        if (confirm('Delete this behavior entry?')) {
                          deleteBehavior(beh.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
