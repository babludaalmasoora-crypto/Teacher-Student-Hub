import React, { useState, useEffect } from 'react';
import { X, Heart, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BehaviorCategory, BehaviorType } from '../../types';
import { useClassData } from '../../context/ClassDataContext';

interface AddBehaviorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string | null;
}

const PRESET_BEHAVIORS: {
  type: BehaviorType;
  category: BehaviorCategory;
  title: string;
  points: number;
  icon: string;
  defaultDesc: string;
}[] = [
  // Positive Presets
  {
    type: 'positive',
    category: 'teamwork',
    title: 'Outstanding Team Collaboration',
    points: 5,
    icon: '🤝',
    defaultDesc: 'Showed great patience, encouraged teammates, and ensured everyone had a voice in the group project.'
  },
  {
    type: 'positive',
    category: 'perseverance',
    title: 'Grit & Relentless Problem Solving',
    points: 5,
    icon: '💪',
    defaultDesc: 'Tackled difficult challenge problems without giving up and asked insightful clarifying questions.'
  },
  {
    type: 'positive',
    category: 'leadership',
    title: 'Classroom Leadership & Initiative',
    points: 5,
    icon: '⭐',
    defaultDesc: 'Took initiative to help organize class materials and set a positive learning tone for the room.'
  },
  {
    type: 'positive',
    category: 'kindness',
    title: 'Acts of Empathy & Kindness',
    points: 5,
    icon: '❤️',
    defaultDesc: 'Voluntarily helped a peer during study hall and displayed genuine respect toward classmates.'
  },
  {
    type: 'positive',
    category: 'focus',
    title: 'Exceptional Active Listening & Focus',
    points: 3,
    icon: '🎯',
    defaultDesc: 'Maintained focused attention during lecture and contributed meaningful observations to the discussion.'
  },

  // Constructive / Concern Presets
  {
    type: 'concern',
    category: 'homework_missing',
    title: 'Missing or Incomplete Assignment',
    points: -2,
    icon: '📝',
    defaultDesc: 'Did not submit homework on time. Provided extension or study hall makeup plan.'
  },
  {
    type: 'concern',
    category: 'distraction',
    title: 'Off-task & Needs Frequent Redirects',
    points: -2,
    icon: '👀',
    defaultDesc: 'Distracted during independent work time; redirected twice to keep on pace.'
  },
  {
    type: 'concern',
    category: 'disruption',
    title: 'Classroom Disruption or Talking Out of Turn',
    points: -3,
    icon: '⚠️',
    defaultDesc: 'Interrupted teacher instructions or peers during quiet reading block.'
  },
  {
    type: 'concern',
    category: 'tardiness',
    title: 'Unexcused Late Arrival to Class',
    points: -1,
    icon: '⏰',
    defaultDesc: 'Arrived after the bell without a hall pass.'
  }
];

export const AddBehaviorModal: React.FC<AddBehaviorModalProps> = ({
  isOpen,
  onClose,
  targetStudentId
}) => {
  const { students, addBehavior } = useClassData();

  const [studentId, setStudentId] = useState<string>('');
  const [behaviorType, setBehaviorType] = useState<BehaviorType>('positive');
  const [category, setCategory] = useState<BehaviorCategory>('teamwork');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<number>(5);
  const [setting, setSetting] = useState<'classroom' | 'group_work' | 'lab' | 'recess' | 'hallway' | 'online'>('classroom');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [parentNotified, setParentNotified] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetStudentId) {
      setStudentId(targetStudentId);
    } else if (students.length > 0) {
      setStudentId(students[0].id);
    }
    // Select first positive preset by default
    const firstPreset = PRESET_BEHAVIORS[0];
    setTitle(firstPreset.title);
    setDescription(firstPreset.defaultDesc);
    setCategory(firstPreset.category);
    setPoints(firstPreset.points);
    setBehaviorType(firstPreset.type);
    setDate(new Date().toISOString().split('T')[0]);
    setParentNotified(false);
    setActionTaken('');
  }, [targetStudentId, students, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_BEHAVIORS[0]) => {
    setBehaviorType(preset.type);
    setCategory(preset.category);
    setTitle(preset.title);
    setDescription(preset.defaultDesc);
    setPoints(preset.points);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please select a student');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a behavior title');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addBehavior({
        studentId,
        type: behaviorType,
        category,
        title: title.trim(),
        description: description.trim(),
        points,
        setting,
        date,
        parentNotified,
        actionTaken: actionTaken.trim()
      });

      if (behaviorType === 'positive') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to record behavior');
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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              behaviorType === 'positive' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
            }`}>
              {behaviorType === 'positive' ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Record Behavioral Observation
              </h2>
              <p className="text-xs text-slate-500">
                Log character praise, student milestones, or constructive intervention notes
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
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {students.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.name} ({stu.rollNumber || stu.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Quick Category Presets
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setBehaviorType('positive')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    behaviorType === 'positive' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Positive Praise
                </button>
                <button
                  type="button"
                  onClick={() => setBehaviorType('concern')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    behaviorType === 'concern' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Needs Support
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_BEHAVIORS.filter(p => p.type === behaviorType).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                    title === preset.title
                      ? behaviorType === 'positive'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-amber-500 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{preset.icon}</span>
                    <span className="font-semibold truncate">{preset.title.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate">{preset.category}</span>
                    <span className={`font-bold ${preset.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {preset.points > 0 ? `+${preset.points}` : preset.points} pts
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Points Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observation Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Led group discussion with patience"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merit Points Impact
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className={`w-full px-3.5 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-hidden ${
                  points >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              />
            </div>
          </div>

          {/* Setting & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classroom Context / Setting
              </label>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="classroom">Regular Classroom</option>
                <option value="group_work">Group Project Work</option>
                <option value="lab">Science / Computer Lab</option>
                <option value="recess">Recess / Play Area</option>
                <option value="hallway">Hallway / Common Area</option>
                <option value="online">Online / Remote Block</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Observed
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Detailed Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Narrative & Observations
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, student reactions, and specific behavioral nuances..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Action Taken & Parent Notification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Action Taken / Strategy Applied
              </label>
              <input
                type="text"
                placeholder="e.g. Awarded Star badge, provided extra study hall time, 1-on-1 check-in..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={parentNotified}
                onChange={(e) => setParentNotified(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Parent notified or discussed via communication log
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
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
              behaviorType === 'positive'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isSubmitting ? 'Recording...' : 'Log Behavior Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};
