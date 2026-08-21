import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, CheckSquare, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { ParentMeetingDossier } from '../../types';
import { useClassData } from '../../context/ClassDataContext';

interface ParentMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string | null;
  meetingToEdit?: ParentMeetingDossier | null;
}

export const ParentMeetingModal: React.FC<ParentMeetingModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
  meetingToEdit
}) => {
  const { students, saveParentMeeting, getStudentAnalytics } = useClassData();

  const [studentId, setStudentId] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendees, setAttendees] = useState('');
  const [meetingType, setMeetingType] = useState<ParentMeetingDossier['meetingType']>('scheduled_conference');
  const [status, setStatus] = useState<ParentMeetingDossier['status']>('completed');
  const [academicSummary, setAcademicSummary] = useState('');
  const [strengthsInput, setStrengthsInput] = useState('');
  const [growthInput, setGrowthInput] = useState('');
  const [parentActionInput, setParentActionInput] = useState('');
  const [teacherActionInput, setTeacherActionInput] = useState('');
  const [studentGoal, setStudentGoal] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [parentAcknowledged, setParentAcknowledged] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meetingToEdit) {
      setStudentId(meetingToEdit.studentId);
      setMeetingDate(meetingToEdit.meetingDate);
      setAttendees(meetingToEdit.attendees);
      setMeetingType(meetingToEdit.meetingType);
      setStatus(meetingToEdit.status);
      setAcademicSummary(meetingToEdit.academicSummary || '');
      setStrengthsInput(meetingToEdit.keyStrengthsDiscussed?.join('\n') || '');
      setGrowthInput(meetingToEdit.growthAreasDiscussed?.join('\n') || '');
      setParentActionInput(meetingToEdit.actionItemsParent?.join('\n') || '');
      setTeacherActionInput(meetingToEdit.actionItemsTeacher?.join('\n') || '');
      setStudentGoal(meetingToEdit.studentGoal || '');
      setFollowUpDate(meetingToEdit.followUpDate || '');
      setParentAcknowledged(meetingToEdit.parentAcknowledged || false);
      setNotes(meetingToEdit.notes || '');
    } else {
      const selectedId = targetStudentId || (students[0]?.id || '');
      setStudentId(selectedId);
      const student = students.find(s => s.id === selectedId);
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setAttendees(student ? `Teacher, ${student.parentName || 'Parent / Guardian'}` : 'Teacher, Parent');
      setMeetingType('scheduled_conference');
      setStatus('completed');
      setAcademicSummary(student ? `${student.name} is making steady academic progress across core subject areas.` : '');
      setStrengthsInput('Active participation in classroom discussions\nCompletes assignments with care\nRespectful team member');
      setGrowthInput('Continue practicing multi-step problem solving\nEstablish consistent homework routine');
      setParentActionInput('Review weekly assignment tracker together at home\nProvide quiet study area for 20 mins nightly');
      setTeacherActionInput('Provide weekly progress updates\nOffer enrichment materials in strong subjects');
      setStudentGoal('Maintain consistent study habits and achieve high marks this term.');
      setFollowUpDate('');
      setParentAcknowledged(true);
      setNotes('');
    }
  }, [meetingToEdit, targetStudentId, students, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please select a student');
      return;
    }
    if (!attendees.trim()) {
      setError('Please list meeting attendees');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const keyStrengthsDiscussed = strengthsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const growthAreasDiscussed = growthInput.split('\n').map(s => s.trim()).filter(Boolean);
    const actionItemsParent = parentActionInput.split('\n').map(s => s.trim()).filter(Boolean);
    const actionItemsTeacher = teacherActionInput.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      await saveParentMeeting({
        id: meetingToEdit?.id,
        studentId,
        meetingDate,
        attendees: attendees.trim(),
        meetingType,
        status,
        academicSummary: academicSummary.trim(),
        keyStrengthsDiscussed,
        growthAreasDiscussed,
        actionItemsParent,
        actionItemsTeacher,
        studentGoal: studentGoal.trim(),
        followUpDate: followUpDate || undefined,
        parentAcknowledged,
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save parent meeting dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {meetingToEdit ? 'Edit Parent Meeting Record' : 'Log Parent-Teacher Conference'}
              </h2>
              <p className="text-xs text-slate-500">
                Record conference dialogue, aligned action items, and joint student goals
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

          {/* Student & Meeting Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.name} ({stu.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Type
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="scheduled_conference">Term Conference</option>
                <option value="academic_intervention">Academic Intervention</option>
                <option value="behavior_followup">Behavior Follow-up</option>
                <option value="iep_annual">IEP / Learning Review</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendees Present <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ms. Davis (Teacher), Dr. Kevin & Wei Chen (Parents)"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Conference Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="completed">Completed</option>
                <option value="upcoming">Scheduled / Upcoming</option>
                <option value="cancelled">Cancelled / Rescheduled</option>
              </select>
            </div>
          </div>

          {/* Academic & Progress Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Academic & Social Progress Summary
            </label>
            <textarea
              rows={2}
              value={academicSummary}
              onChange={(e) => setAcademicSummary(e.target.value)}
              placeholder="Summary of student's overall development, engagement in class, and general trajectory..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Key Strengths Shared (one per line)
              </label>
              <textarea
                rows={3}
                value={strengthsInput}
                onChange={(e) => setStrengthsInput(e.target.value)}
                placeholder="Active participation&#10;High accuracy in math&#10;Kind classmate"
                className="w-full px-3.5 py-2 text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                Target Growth Areas Discussed (one per line)
              </label>
              <textarea
                rows={3}
                value={growthInput}
                onChange={(e) => setGrowthInput(e.target.value)}
                placeholder="Reviewing long division steps&#10;Raising hand before speaking&#10;Organizing locker"
                className="w-full px-3.5 py-2 text-xs bg-amber-50/40 border border-amber-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* Action Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Items for Parent/Home (one per line)
              </label>
              <textarea
                rows={3}
                value={parentActionInput}
                onChange={(e) => setParentActionInput(e.target.value)}
                placeholder="Check homework folder nightly&#10;Encourage 15 min reading block"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Items for Teacher/School (one per line)
              </label>
              <textarea
                rows={3}
                value={teacherActionInput}
                onChange={(e) => setTeacherActionInput(e.target.value)}
                placeholder="Provide graphic organizers&#10;Send bi-weekly progress email"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          {/* Target Student Goal & Follow Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agreed Student Growth Goal
              </label>
              <input
                type="text"
                placeholder="e.g. Read 2 chapter books this month & improve math average to 90%"
                value={studentGoal}
                onChange={(e) => setStudentGoal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Check-in Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          {/* Additional Notes & Parent Acknowledgment */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confidential Teacher Notes / Parent Sentiment
              </label>
              <textarea
                rows={2}
                placeholder="Parent was very supportive; agreed to reinforce homework routines..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-600"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={parentAcknowledged}
                onChange={(e) => setParentAcknowledged(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded-sm border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Parent acknowledged and signed/confirmed conference discussion items
              </span>
            </label>
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
            className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            {isSubmitting ? 'Saving...' : meetingToEdit ? 'Update Conference Record' : 'Save Conference Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};
