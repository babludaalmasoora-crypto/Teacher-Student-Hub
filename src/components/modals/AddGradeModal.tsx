import React, { useState, useEffect } from 'react';
import { X, Award, Plus, Sparkles, BookOpen } from 'lucide-react';
import { GradeCategory, GradeRecord, Student } from '../../types';
import { useClassData } from '../../context/ClassDataContext';
import { SUBJECTS_LIST, TERMS_LIST } from '../../data/sampleClassroom';
import { calculateLetterGrade } from '../../utils/studentAnalytics';

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string | null;
  gradeToEdit?: GradeRecord | null;
}

export const AddGradeModal: React.FC<AddGradeModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
  gradeToEdit
}) => {
  const { students, addGrade, updateGrade } = useClassData();

  const [studentId, setStudentId] = useState<string>('');
  const [subject, setSubject] = useState<string>(SUBJECTS_LIST[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GradeCategory>('quiz');
  const [term, setTerm] = useState<string>(TERMS_LIST[1]); // current term
  const [score, setScore] = useState<number>(90);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [comments, setComments] = useState('');
  const [strengthsObserved, setStrengthsObserved] = useState('');
  const [improvementNeeded, setImprovementNeeded] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gradeToEdit) {
      setStudentId(gradeToEdit.studentId);
      if (SUBJECTS_LIST.includes(gradeToEdit.subject)) {
        setSubject(gradeToEdit.subject);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setCustomSubject(gradeToEdit.subject);
      }
      setTitle(gradeToEdit.title);
      setCategory(gradeToEdit.category);
      setTerm(gradeToEdit.term);
      setScore(gradeToEdit.score);
      setMaxScore(gradeToEdit.maxScore);
      setDate(gradeToEdit.date);
      setComments(gradeToEdit.comments || '');
      setStrengthsObserved(gradeToEdit.strengthsObserved || '');
      setImprovementNeeded(gradeToEdit.improvementNeeded || '');
    } else {
      if (targetStudentId) {
        setStudentId(targetStudentId);
      } else if (students.length > 0) {
        setStudentId(students[0].id);
      }
      setTitle('');
      setScore(88);
      setMaxScore(100);
      setDate(new Date().toISOString().split('T')[0]);
      setComments('');
      setStrengthsObserved('');
      setImprovementNeeded('');
    }
  }, [gradeToEdit, targetStudentId, students, isOpen]);

  if (!isOpen) return null;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const letterGrade = calculateLetterGrade(percentage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please select a student');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an assessment or assignment title');
      return;
    }
    if (maxScore <= 0) {
      setError('Max score must be greater than zero');
      return;
    }

    const finalSubject = subject === 'Other' ? (customSubject.trim() || 'General Studies') : subject;
    setIsSubmitting(true);
    setError(null);

    try {
      if (gradeToEdit) {
        await updateGrade(gradeToEdit.id, {
          studentId,
          subject: finalSubject,
          title: title.trim(),
          category,
          term,
          score,
          maxScore,
          percentage,
          letterGrade,
          date,
          comments: comments.trim(),
          strengthsObserved: strengthsObserved.trim(),
          improvementNeeded: improvementNeeded.trim()
        });
      } else {
        await addGrade({
          studentId,
          subject: finalSubject,
          title: title.trim(),
          category,
          term,
          score,
          maxScore,
          percentage,
          letterGrade,
          date,
          comments: comments.trim(),
          strengthsObserved: strengthsObserved.trim(),
          improvementNeeded: improvementNeeded.trim()
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save grade record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {gradeToEdit ? 'Edit Assessment Grade' : 'Log Assessment Grade'}
              </h2>
              <p className="text-xs text-slate-500">
                Record subject score, letter grade, and diagnostic teacher feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              {students.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.name} ({stu.rollNumber || stu.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Subject & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                {SUBJECTS_LIST.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="Other">+ Custom Subject...</option>
              </select>
              {subject === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom subject name"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assessment Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GradeCategory)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="homework">Homework</option>
                <option value="project">Project / Lab</option>
                <option value="midterm">Midterm Exam</option>
                <option value="final">Final Exam</option>
                <option value="participation">Class Participation</option>
              </select>
            </div>
          </div>

          {/* Title & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assessment / Test Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fractions Mastery Quiz #2, Solar System Model"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Term
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                {TERMS_LIST.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Completed
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Scores & Calculation Badge */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Points Earned
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-base font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Possible
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseFloat(e.target.value) || 100)}
                  className="w-full px-3 py-1.5 text-base font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Grade Outcome
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-blue-600">
                    {percentage}%
                  </span>
                  <span className={`text-xs px-2 py-0.5 font-bold rounded-md ${
                    percentage >= 90 ? 'bg-emerald-100 text-emerald-800' :
                    percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                    percentage >= 70 ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {letterGrade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Observations for Parent-Teacher conferences */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Strengths Demonstrated (for Parent Meetings)
              </label>
              <input
                type="text"
                placeholder="e.g. Strong conceptual grasp, excellent step-by-step reasoning"
                value={strengthsObserved}
                onChange={(e) => setStrengthsObserved(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Areas for Targeted Practice / Support
              </label>
              <input
                type="text"
                placeholder="e.g. Double-check unit conversions, review word problem wording"
                value={improvementNeeded}
                onChange={(e) => setImprovementNeeded(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                General Teacher Comments & Notes
              </label>
              <textarea
                rows={2}
                placeholder="Additional observational notes or feedback given to student..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            {isSubmitting ? 'Saving...' : gradeToEdit ? 'Update Grade' : 'Save Grade Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
