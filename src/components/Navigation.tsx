import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  HeartHandshake, 
  BarChart3, 
  Plus, 
  Search, 
  LogOut, 
  Sparkles, 
  UserPlus, 
  FileCheck2, 
  FolderSync, 
  ChevronDown,
  Mail,
  School,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClassData } from '../context/ClassDataContext';

export type ActiveTab = 'students' | 'gradebook' | 'attendance' | 'behavior' | 'conferences' | 'insights';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddGrade: () => void;
  onOpenAddBehavior: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddStudent,
  onOpenAddGrade,
  onOpenAddBehavior,
  searchQuery,
  setSearchQuery
}) => {
  const { user, isDemoUser, signOut } = useAuth();
  const { students, loadSampleClassroom, clearClassroomData, setSelectedStudentId } = useClassData();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const handleLoadSample = async () => {
    setSampleLoading(true);
    try {
      await loadSampleClassroom();
    } finally {
      setSampleLoading(false);
      setProfileDropdownOpen(false);
    }
  };

  const navItems = [
    { id: 'students' as ActiveTab, label: 'Roster & Profiles', icon: Users, badge: students.length },
    { id: 'gradebook' as ActiveTab, label: 'Gradebook & Tests', icon: BookOpen },
    { id: 'attendance' as ActiveTab, label: 'Daily Roll Call', icon: CalendarCheck },
    { id: 'behavior' as ActiveTab, label: 'Behavior & Merits', icon: Award },
    { id: 'conferences' as ActiveTab, label: 'Parent Conferences', icon: HeartHandshake },
    { id: 'insights' as ActiveTab, label: 'Class Insights', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Teacher Class Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => { setActiveTab('students'); setSelectedStudentId(null); }}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  onClick={() => { setActiveTab('students'); setSelectedStudentId(null); }}
                  className="font-bold text-slate-900 tracking-tight text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors"
                >
                  TeacherStudent Hub
                </span>
                {isDemoUser && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                {user?.schoolName || 'Elementary Academy'} • {user?.gradeLevel || 'Grade 5'}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name, roll no, or special needs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Add Student */}
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Student</span>
            </button>

            {/* Teacher Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
              >
                <img
                  src={user?.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.displayName || 'Teacher'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.displayName || 'Teacher'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user?.email || 'Logged in'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{user?.displayName}</div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {user?.email}
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium mt-1">
                      {user?.schoolName}
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleLoadSample}
                      disabled={sampleLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-left"
                    >
                      <FolderSync className="w-4 h-4 text-blue-600" />
                      <span>{sampleLoading ? 'Loading Class...' : 'Load Sample Classroom (6 Students)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Clear all student records, grades, and attendance from current class?')) {
                          clearClassroomData();
                          setProfileDropdownOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Reset / Clear Classroom</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student name, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* View Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 -mb-px border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'students') {
                    setSelectedStudentId(null);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
