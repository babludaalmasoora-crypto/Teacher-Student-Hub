import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  Users, 
  Check, 
  Save
} from 'lucide-react';
import { useClassData } from '../../context/ClassDataContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';

interface AttendanceViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onSelectStudent }) => {
  const { students, attendance, markAttendance, bulkMarkAttendance } = useClassData();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notesState, setNotesState] = useState<{ [studentId: string]: string }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Status for each student on selectedDate
  const getStatusForStudent = (studentId: string): AttendanceStatus => {
    const rec = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return rec ? rec.status : 'present';
  };

  const getNotesForStudent = (studentId: string): string => {
    if (notesState[studentId] !== undefined) return notesState[studentId];
    const rec = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return rec?.notes || '';
  };

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    const currentNotes = getNotesForStudent(studentId);
    markAttendance(studentId, selectedDate, status, currentNotes);
  };

  const handleMarkAllPresent = async () => {
    const records = students.map(s => ({
      studentId: s.id,
      status: 'present' as AttendanceStatus,
      notes: getNotesForStudent(s.id)
    }));
    await bulkMarkAttendance(selectedDate, records);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Stats for the chosen day
  const dayRecords = students.map(s => getStatusForStudent(s.id));
  const presentCount = dayRecords.filter(st => st === 'present').length;
  const absentCount = dayRecords.filter(st => st === 'absent').length;
  const tardyCount = dayRecords.filter(st => st === 'tardy').length;
  const excusedCount = dayRecords.filter(st => st === 'excused' || st === 'medical').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Date Picker */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Daily Attendance Roll Call</h2>
            {savedSuccess && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log student presence, tardiness, and absence reasons for attendance records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Present Today
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {presentCount} / {students.length}
          </span>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Absent
          </span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {absentCount}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Tardy / Late
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {tardyCount}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Excused
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {excusedCount}
          </span>
        </div>
      </div>

      {/* Roll Call Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Student Roll ({students.length} Total)
          </span>
          <span className="text-xs text-slate-500">
            Date: <strong className="text-slate-800">{selectedDate}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student) => {
            const currentStatus = getStatusForStudent(student.id);

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Student Photo & Name */}
                <div 
                  onClick={() => onSelectStudent(student.id)}
                  className="flex items-center gap-3.5 cursor-pointer group shrink-0 min-w-[200px]"
                >
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-500"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 text-sm">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{student.rollNumber || 'G5'}</span>
                      <span>•</span>
                      <span>{student.section || student.grade}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleSetStatus(student.id, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    ✓ Present
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    ✗ Absent
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'tardy')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStatus === 'tardy'
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    ⏰ Tardy
                  </button>

                  <button
                    onClick={() => handleSetStatus(student.id, 'excused')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStatus === 'excused'
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    📝 Excused
                  </button>
                </div>

                {/* Reason / Notes */}
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Reason or notes (e.g. flu, bus delay, doctor pass)..."
                    value={getNotesForStudent(student.id)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNotesState(prev => ({ ...prev, [student.id]: val }));
                      markAttendance(student.id, selectedDate, currentStatus, val);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
