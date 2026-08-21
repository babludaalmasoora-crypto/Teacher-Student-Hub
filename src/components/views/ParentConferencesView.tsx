import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText,
  User
} from 'lucide-react';
import { useClassData } from '../../context/ClassDataContext';
import { ParentMeetingDossier } from '../../types';

interface ParentConferencesViewProps {
  onOpenParentMeeting: (studentId?: string, meeting?: ParentMeetingDossier) => void;
  onSelectStudent: (studentId: string) => void;
}

export const ParentConferencesView: React.FC<ParentConferencesViewProps> = ({
  onOpenParentMeeting,
  onSelectStudent
}) => {
  const { students, parentMeetings, deleteParentMeeting } = useClassData();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = parentMeetings.filter(m => {
    const student = students.find(s => s.id === m.studentId);
    const matchesSearch = 
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.attendees.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.academicSummary && m.academicSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.studentGoal && m.studentGoal.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Parent-Teacher Conference Management
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
              {parentMeetings.length} Conferences Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain historical meeting dialogues, aligned student growth goals, and action plans
          </p>
        </div>

        <button
          onClick={() => onOpenParentMeeting()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Conference</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'all' ? 'bg-purple-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            All Meetings ({parentMeetings.length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'completed' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-slate-200'
            }`}
          >
            Completed ({parentMeetings.filter(m => m.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-slate-200'
            }`}
          >
            Scheduled / Upcoming ({parentMeetings.filter(m => m.status === 'upcoming').length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conference by student or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Conferences List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 space-y-3">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No Conferences Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Schedule or log conference discussions to maintain a shared historical record of parent engagement.
            </p>
            <button
              onClick={() => onOpenParentMeeting()}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
            >
              Log First Meeting
            </button>
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const student = students.find(s => s.id === meeting.studentId);

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 hover:shadow-md transition-all space-y-4"
              >
                {/* Meeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3.5">
                    {student && (
                      <img
                        src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                        alt={student.name}
                        referrerPolicy="no-referrer"
                        onClick={() => onSelectStudent(student.id)}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 cursor-pointer shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 
                          onClick={() => student && onSelectStudent(student.id)}
                          className="font-bold text-slate-900 text-base hover:text-blue-600 cursor-pointer"
                        >
                          {student?.name || 'Student'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Date: <strong>{meeting.meetingDate}</strong> • Attendees: {meeting.attendees}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectStudent(meeting.studentId)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      View Student Dossier
                    </button>
                    <button
                      onClick={() => onOpenParentMeeting(meeting.studentId, meeting)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this parent meeting record?')) {
                          deleteParentMeeting(meeting.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Academic Summary */}
                {meeting.academicSummary && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Pedagogical Summary</span>
                    <p className="leading-relaxed">{meeting.academicSummary}</p>
                  </div>
                )}

                {/* Strengths & Growth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {meeting.keyStrengthsDiscussed && meeting.keyStrengthsDiscussed.length > 0 && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 block mb-1">Key Strengths Shared</span>
                      <ul className="space-y-1 text-slate-700">
                        {meeting.keyStrengthsDiscussed.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.growthAreasDiscussed && meeting.growthAreasDiscussed.length > 0 && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-900 block mb-1">Growth Opportunities</span>
                      <ul className="space-y-1 text-slate-700">
                        {meeting.growthAreasDiscussed.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Joint Goal */}
                {meeting.studentGoal && (
                  <div className="flex items-center gap-2 text-xs bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span><strong>Student Goal:</strong> {meeting.studentGoal}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
