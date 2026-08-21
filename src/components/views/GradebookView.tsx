import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Download,
  Users
} from 'lucide-react';
import { useClassData } from '../../context/ClassDataContext';
import { SUBJECTS_LIST, TERMS_LIST } from '../../data/sampleClassroom';
import { GradeRecord, Student } from '../../types';

interface GradebookViewProps {
  onOpenAddGrade: (studentId?: string, grade?: GradeRecord) => void;
  onSelectStudent: (studentId: string) => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  onOpenAddGrade,
  onSelectStudent
}) => {
  const { students, grades, deleteGrade, getStudentAnalytics } = useClassData();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>(TERMS_LIST[1]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGrades = grades.filter(g => {
    const matchSubject = selectedSubject === 'all' || g.subject === selectedSubject;
    const matchTerm = selectedTerm === 'all' || g.term === selectedTerm;
    return matchSubject && matchTerm;
  });

  // Unique assignment titles in this term/subject
  const assignmentTitles = Array.from(new Set(filteredGrades.map(g => g.title)));

  // Filtered student list
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Classroom Gradebook Matrix</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {grades.length} Grades Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor subject assessments, evaluate score distributions, and record grades
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Term Filter */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Academic Terms</option>
            {TERMS_LIST.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS_LIST.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <button
            onClick={() => onOpenAddGrade()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log New Grade</span>
          </button>
        </div>
      </div>

      {/* Grade Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Search inside gradebook */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter student in gradebook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10">Student Name</th>
                  <th className="py-3.5 px-3 text-center">GPA</th>
                  <th className="py-3.5 px-3 text-center">Overall %</th>
                  {SUBJECTS_LIST.slice(0, 4).map(sub => (
                    <th key={sub} className="py-3.5 px-3 text-center truncate max-w-[120px]">
                      {sub.split(' ')[0]}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStudents.map((student) => {
                  const stats = getStudentAnalytics(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50/80 z-10">
                        <div 
                          onClick={() => onSelectStudent(student.id)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                            alt={student.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 group-hover:ring-blue-500"
                          />
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 block">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {student.rollNumber || student.grade}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cumulative GPA */}
                      <td className="py-3 px-3 text-center font-extrabold text-slate-900">
                        {stats.totalGrades > 0 ? stats.gpa.toFixed(1) : '—'}
                      </td>

                      {/* Cumulative % */}
                      <td className="py-3 px-3 text-center font-extrabold text-blue-600">
                        {stats.totalGrades > 0 ? `${stats.averagePercentage}%` : '—'}
                      </td>

                      {/* Subject Averages */}
                      {SUBJECTS_LIST.slice(0, 4).map(sub => {
                        const subAvg = stats.subjectAverages[sub];
                        return (
                          <td key={sub} className="py-3 px-3 text-center">
                            {subAvg !== undefined ? (
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                subAvg >= 90 ? 'bg-emerald-100 text-emerald-800' :
                                subAvg >= 80 ? 'bg-blue-100 text-blue-800' :
                                subAvg >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {subAvg}%
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenAddGrade(student.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          + Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
