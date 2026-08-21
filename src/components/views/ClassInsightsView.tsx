import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useClassData } from '../../context/ClassDataContext';
import { SUBJECTS_LIST } from '../../data/sampleClassroom';

interface ClassInsightsViewProps {
  onSelectStudent: (studentId: string) => void;
  onOpenParentMeeting: (studentId: string) => void;
}

export const ClassInsightsView: React.FC<ClassInsightsViewProps> = ({
  onSelectStudent,
  onOpenParentMeeting
}) => {
  const { students, grades, attendance, behaviors, getStudentAnalytics } = useClassData();

  // Class analytics
  const allStats = students.map(s => ({
    student: s,
    stats: getStudentAnalytics(s.id)
  }));

  const totalClassGrades = grades.length;
  const overallAvg = allStats.length > 0 && totalClassGrades > 0
    ? Math.round(allStats.reduce((acc, curr) => acc + curr.stats.averagePercentage, 0) / allStats.length)
    : 0;

  const overallAttendance = allStats.length > 0
    ? Math.round(allStats.reduce((acc, curr) => acc + curr.stats.attendanceRate, 0) / allStats.length)
    : 0;

  const totalMerits = behaviors.filter(b => b.type === 'positive').length;

  // Subject averages for chart
  const subjectChartData = SUBJECTS_LIST.map(subject => {
    const subjGrades = grades.filter(g => g.subject === subject);
    const avg = subjGrades.length > 0
      ? Math.round(subjGrades.reduce((acc, g) => acc + g.percentage, 0) / subjGrades.length)
      : 0;

    return {
      subject: subject.split(' ')[0], // short name
      fullName: subject,
      average: avg
    };
  }).filter(d => d.average > 0);

  // Grade distributions (A, B, C, D)
  let countA = 0, countB = 0, countC = 0, countD = 0;
  grades.forEach(g => {
    if (g.percentage >= 90) countA++;
    else if (g.percentage >= 80) countB++;
    else if (g.percentage >= 70) countC++;
    else countD++;
  });

  const gradeDistData = [
    { name: 'Grade A (90%+)', count: countA, color: '#10b981' },
    { name: 'Grade B (80-89%)', count: countB, color: '#3b82f6' },
    { name: 'Grade C (70-79%)', count: countC, color: '#f59e0b' },
    { name: 'Grade D (<70%)', count: countD, color: '#ef4444' },
  ].filter(d => d.count > 0);

  // Intervention watchlist
  const watchlist = allStats.filter(
    ({ stats }) => stats.averagePercentage < 75 || stats.attendanceRate < 85 || stats.recentTrend === 'declining'
  );

  // Top performers
  const topPerformers = [...allStats]
    .sort((a, b) => b.stats.averagePercentage - a.stats.averagePercentage)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5">
        <h2 className="text-lg font-bold text-slate-900">Classroom Analytics & Insights</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time synthesis of student achievement, attendance patterns, and proactive intervention watchlists
        </p>
      </div>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400 block">Class Average</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {overallAvg}%
          </div>
          <span className="text-xs text-blue-600 font-semibold">
            Across {totalClassGrades} graded tests
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400 block">Attendance Rate</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {overallAttendance}%
          </div>
          <span className="text-xs text-slate-500">
            {students.length} students enrolled
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400 block">Merits & Praises</span>
          <div className="text-3xl font-extrabold text-purple-600 mt-1">
            +{totalMerits}
          </div>
          <span className="text-xs text-slate-500">Positive milestones awarded</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold uppercase text-slate-400 block">Intervention Alerts</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {watchlist.length}
          </div>
          <span className="text-xs text-slate-500">Students needing extra support</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Performance Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Subject Mastery Benchmark</h3>
            <p className="text-xs text-slate-500">Average student score % by discipline</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs">
                          <div className="font-bold">{data.fullName}</div>
                          <div className="text-blue-400 font-extrabold text-sm">{data.average}% Class Avg</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="average" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Letter Grade Distribution</h3>
            <p className="text-xs text-slate-500">Spread of marks across all recorded tests</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]}>
                  {gradeDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Proactive Intervention Watchlist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Proactive Intervention Watchlist</h3>
              <p className="text-xs text-slate-500">
                Students flagged for lower attendance, grade dips, or requiring parent conference alignment
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            {watchlist.length} Flagged
          </span>
        </div>

        {watchlist.length === 0 ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All students are currently maintaining target attendance and academic averages!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchlist.map(({ student, stats }) => (
              <div
                key={student.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <h4 
                      onClick={() => onSelectStudent(student.id)}
                      className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                    >
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <span>Avg: <strong>{stats.averagePercentage}%</strong></span>
                      <span>•</span>
                      <span className={stats.attendanceRate < 85 ? 'text-rose-600 font-bold' : ''}>
                        Att: {stats.attendanceRate}%
                      </span>
                    </div>
                    {student.learningNeeds && (
                      <p className="text-[11px] text-indigo-700 font-medium truncate max-w-xs mt-1">
                        Note: {student.learningNeeds}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => onSelectStudent(student.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    View Dossier
                  </button>
                  <button
                    onClick={() => onOpenParentMeeting(student.id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                  >
                    + Conference
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Honors & Growth Champions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base">Top Academic Performers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topPerformers.map(({ student, stats }, rank) => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-xs shrink-0 ring-2 ring-amber-200">
                #{rank + 1}
              </div>
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-blue-500"
              />
              <div className="truncate">
                <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600 truncate">
                  {student.name}
                </span>
                <span className="text-[11px] font-extrabold text-blue-600">
                  {stats.averagePercentage}% Avg • {stats.attendanceRate}% Att
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
