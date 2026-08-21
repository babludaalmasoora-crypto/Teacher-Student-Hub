import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  TrendingUp, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useClassData } from '../../context/ClassDataContext';
import { BehaviorRecord } from '../../types';

interface BehaviorViewProps {
  onOpenAddBehavior: (studentId?: string) => void;
  onSelectStudent: (studentId: string) => void;
}

export const BehaviorView: React.FC<BehaviorViewProps> = ({
  onOpenAddBehavior,
  onSelectStudent
}) => {
  const { students, behaviors, deleteBehavior, getStudentAnalytics, addBehavior } = useClassData();
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'concern'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBehaviors = behaviors.filter(b => {
    const student = students.find(s => s.id === b.studentId);
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || b.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPositive = behaviors.filter(b => b.type === 'positive').length;
  const totalConcerns = behaviors.filter(b => b.type === 'concern').length;

  // Quick Award helper
  const handleQuickPraise = async (studentId: string, title: string, category: any, points: number) => {
    await addBehavior({
      studentId,
      type: 'positive',
      category,
      title,
      description: 'Awarded instant classroom recognition star by teacher.',
      points,
      setting: 'classroom',
      date: new Date().toISOString().split('T')[0],
      parentNotified: false
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Classroom Culture & Character Recognitions
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              +{totalPositive} Praises
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Encourage positive learning mindsets, celebrate grit, and log behavioral interventions
          </p>
        </div>

        <button
          onClick={() => onOpenAddBehavior()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Record Observation</span>
        </button>
      </div>

      {/* Quick Praise Wall Cards for each student */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Quick Praise Strip (1-Click Merits)</h3>
          </div>
          <span className="text-xs text-emerald-300 font-medium">
            Tap a badge to award instant points & celebrate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.slice(0, 6).map((student) => {
            const stats = getStudentAnalytics(student.id);

            return (
              <div
                key={student.id}
                className="bg-white/10 border border-white/15 rounded-2xl p-3.5 flex items-center justify-between gap-3 backdrop-blur-xs"
              >
                <div 
                  onClick={() => onSelectStudent(student.id)}
                  className="flex items-center gap-2.5 cursor-pointer group truncate"
                >
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20"
                  />
                  <div className="truncate">
                    <span className="font-bold text-xs text-white group-hover:text-emerald-300 block truncate">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-emerald-200">
                      {stats.behaviorScore >= 0 ? `+${stats.behaviorScore}` : stats.behaviorScore} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleQuickPraise(student.id, 'Great Teamwork & Leadership', 'teamwork', 5)}
                    className="px-2 py-1 bg-emerald-500/30 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold border border-emerald-400/40 transition-colors"
                    title="Award +5 Teamwork"
                  >
                    🤝 +5
                  </button>
                  <button
                    onClick={() => handleQuickPraise(student.id, 'Superb Grit & Focus', 'perseverance', 5)}
                    className="px-2 py-1 bg-teal-500/30 hover:bg-teal-500 text-white rounded-lg text-[11px] font-bold border border-teal-400/40 transition-colors"
                    title="Award +5 Grit"
                  >
                    💪 +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            All Logs ({behaviors.length})
          </button>
          <button
            onClick={() => setFilterType('positive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'positive' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-slate-200'
            }`}
          >
            Positive Praises ({totalPositive})
          </button>
          <button
            onClick={() => setFilterType('concern')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterType === 'concern' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-slate-200'
            }`}
          >
            Needs Support ({totalConcerns})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search behavior notes or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Behavior Timeline List */}
      <div className="space-y-3">
        {filteredBehaviors.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500">
            No behavioral logs found matching filters.
          </div>
        ) : (
          filteredBehaviors.map((beh) => {
            const student = students.find(s => s.id === beh.studentId);

            return (
              <div
                key={beh.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-2xs ${
                  beh.type === 'positive' ? 'border-emerald-200/80' : 'border-amber-200/80'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {student && (
                    <img
                      src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      onClick={() => onSelectStudent(student.id)}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 cursor-pointer shrink-0 mt-0.5"
                    />
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        onClick={() => student && onSelectStudent(student.id)}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                      >
                        {student?.name || 'Unknown Student'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        beh.type === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {beh.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {beh.date} • {beh.setting}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      {beh.title}
                    </h4>

                    {beh.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {beh.description}
                      </p>
                    )}

                    {beh.actionTaken && (
                      <div className="text-[11px] text-blue-700 font-medium pt-0.5">
                        Action Taken: {beh.actionTaken}
                      </div>
                    )}

                    {beh.parentNotified && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Parent communicated</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
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
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
