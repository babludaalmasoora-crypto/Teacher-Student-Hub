import { Student, GradeRecord, AttendanceRecord, BehaviorRecord, ParentMeetingDossier } from '../types';

export const SAMPLE_STUDENTS: Omit<Student, 'teacherId'>[] = [
  {
    id: 'student-1',
    name: 'Maya Lin Chen',
    rollNumber: 'G5-101',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'female',
    dob: '2014-04-12',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    parentName: 'Dr. Kevin & Wei Chen',
    parentRelationship: 'Parents',
    parentEmail: 'wei.chen.parent@gmail.com',
    parentPhone: '(555) 234-8901',
    emergencyContact: '(555) 234-8909 (Grandmother - Mrs. Lin)',
    learningNeeds: 'Visual & Hands-on Learner, Advanced Math Enrichment',
    medicalNotes: 'Mild seasonal allergies. Carries inhaler for gym class.',
    interests: ['Robotics', 'Violin', 'Chess', 'Astronomy'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-2',
    name: 'Marcus Alexander Brooks',
    rollNumber: 'G5-102',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'male',
    dob: '2014-07-25',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    parentName: 'Marcus Brooks Sr. & Alicia Brooks',
    parentRelationship: 'Parents',
    parentEmail: 'alicia.brooks@gmail.com',
    parentPhone: '(555) 456-7812',
    emergencyContact: '(555) 456-7899 (Aunt Clara)',
    learningNeeds: 'Kinesthetic learner, Benefits from timed breaks during heavy writing tasks',
    medicalNotes: 'No known allergies',
    interests: ['Basketball', 'Creative Writing', 'Graphic Novels', 'Debate'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-3',
    name: 'Sofia Elena Rodriguez',
    rollNumber: 'G5-103',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'female',
    dob: '2014-11-03',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    parentName: 'Carlos & Elena Rodriguez',
    parentRelationship: 'Mother & Father',
    parentEmail: 'elena.rodriguez.teacherlink@gmail.com',
    parentPhone: '(555) 876-5432',
    emergencyContact: '(555) 876-0000 (Father Work)',
    learningNeeds: 'Bilingual English/Spanish, Outstanding verbal communicator',
    medicalNotes: 'Peanut allergy (strict)',
    interests: ['Soccer', 'Environmental Science', 'Choir', 'Digital Illustration'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-4',
    name: 'Ethan James Taylor',
    rollNumber: 'G5-104',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'male',
    dob: '2014-02-18',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    parentName: 'Hannah Taylor',
    parentRelationship: 'Mother',
    parentEmail: 'htaylor.home@gmail.com',
    parentPhone: '(555) 901-2345',
    emergencyContact: '(555) 901-7788 (Uncle David)',
    learningNeeds: 'Targeted support for multi-step math word problems',
    medicalNotes: 'Wears glasses for reading and board work',
    interests: ['Minecraft Architecture', 'Dinosaurs', 'Swimming', 'Coding'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-5',
    name: 'Aaliyah Zahra Patel',
    rollNumber: 'G5-105',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'female',
    dob: '2014-09-14',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    parentName: 'Imran & Farida Patel',
    parentRelationship: 'Parents',
    parentEmail: 'farida.patel.pta@gmail.com',
    parentPhone: '(555) 678-9012',
    emergencyContact: '(555) 678-3344 (Uncle Tariq)',
    learningNeeds: 'Independent researcher, Excels in collaborative science projects',
    medicalNotes: 'No medical conditions noted',
    interests: ['Botany', 'Public Speaking', 'Piano', 'Drama Club'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'student-6',
    name: 'Liam Noah O\'Connor',
    rollNumber: 'G5-106',
    grade: 'Grade 5',
    section: 'Room 5-A',
    gender: 'male',
    dob: '2014-06-30',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    parentName: 'Patrick & Siobhan O\'Connor',
    parentRelationship: 'Parents',
    parentEmail: 'siobhan.oconnor@gmail.com',
    parentPhone: '(555) 321-6549',
    emergencyContact: '(555) 321-0022 (Grandfather Liam Sr.)',
    learningNeeds: 'Needs occasional encouragement to speak up in large group discussions',
    medicalNotes: 'Asthma inhaler kept in school nurse office',
    interests: ['Historical fiction', 'Geography', 'Cross-Country', 'Origami'],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SUBJECTS_LIST = [
  'Mathematics',
  'English Language Arts',
  'Science & Technology',
  'Social Studies',
  'Visual Arts',
  'Physical Education',
  'Music & Drama'
];

export const TERMS_LIST = [
  'Term 1 - Fall 2025',
  'Term 2 - Winter 2026',
  'Term 3 - Spring 2026'
];

export function generateSampleClassData(teacherId: string) {
  const students: Student[] = SAMPLE_STUDENTS.map(s => ({
    ...s,
    teacherId,
  }));

  const grades: GradeRecord[] = [];
  const attendance: AttendanceRecord[] = [];
  const behaviors: BehaviorRecord[] = [];
  const dossiers: ParentMeetingDossier[] = [];

  // Generate rich grades for each student
  students.forEach((student, sIdx) => {
    // Math grades
    grades.push(
      {
        id: `grade-${student.id}-math-1`,
        studentId: student.id,
        teacherId,
        subject: 'Mathematics',
        title: 'Fractions & Decimals Unit Assessment',
        category: 'midterm',
        term: 'Term 1 - Fall 2025',
        score: sIdx === 0 ? 98 : sIdx === 1 ? 88 : sIdx === 3 ? 74 : 92,
        maxScore: 100,
        percentage: sIdx === 0 ? 98 : sIdx === 1 ? 88 : sIdx === 3 ? 74 : 92,
        letterGrade: sIdx === 0 ? 'A+' : sIdx === 1 ? 'B+' : sIdx === 3 ? 'C' : 'A-',
        date: '2025-10-18',
        comments: 'Showed complete work for word problems and multi-step equations.',
        strengthsObserved: 'Mental arithmetic speed, accurate conceptual diagramming.',
        createdAt: '2025-10-18T14:30:00Z'
      },
      {
        id: `grade-${student.id}-math-2`,
        studentId: student.id,
        teacherId,
        subject: 'Mathematics',
        title: 'Geometry & Angles Quiz',
        category: 'quiz',
        term: 'Term 2 - Winter 2026',
        score: sIdx === 0 ? 100 : sIdx === 1 ? 92 : sIdx === 3 ? 82 : 94,
        maxScore: 100,
        percentage: sIdx === 0 ? 100 : sIdx === 1 ? 92 : sIdx === 3 ? 82 : 94,
        letterGrade: sIdx === 0 ? 'A+' : sIdx === 1 ? 'A-' : sIdx === 3 ? 'B-' : 'A',
        date: '2026-01-24',
        comments: 'Excellent protractor precision and perimeter calculations.',
        strengthsObserved: 'Spatial reasoning is very sharp.',
        createdAt: '2026-01-24T10:15:00Z'
      },
      // Science
      {
        id: `grade-${student.id}-sci-1`,
        studentId: student.id,
        teacherId,
        subject: 'Science & Technology',
        title: 'Ecosystem Food Web Investigation Report',
        category: 'project',
        term: 'Term 1 - Fall 2025',
        score: sIdx === 2 ? 96 : sIdx === 4 ? 98 : 89,
        maxScore: 100,
        percentage: sIdx === 2 ? 96 : sIdx === 4 ? 98 : 89,
        letterGrade: sIdx === 2 ? 'A' : sIdx === 4 ? 'A+' : 'B+',
        date: '2025-11-12',
        comments: 'Detailed hypothesis testing and clear scientific vocabulary used throughout.',
        createdAt: '2025-11-12T11:00:00Z'
      },
      // English
      {
        id: `grade-${student.id}-eng-1`,
        studentId: student.id,
        teacherId,
        subject: 'English Language Arts',
        title: 'Persuasive Essay: Conservation in our Community',
        category: 'assignment',
        term: 'Term 2 - Winter 2026',
        score: sIdx === 1 ? 95 : sIdx === 2 ? 94 : sIdx === 4 ? 91 : 86,
        maxScore: 100,
        percentage: sIdx === 1 ? 95 : sIdx === 2 ? 94 : sIdx === 4 ? 91 : 86,
        letterGrade: sIdx === 1 ? 'A' : sIdx === 2 ? 'A' : sIdx === 4 ? 'A-' : 'B',
        date: '2026-02-10',
        comments: 'Rich vocabulary and structured topic sentences. Great thesis defense.',
        createdAt: '2026-02-10T15:20:00Z'
      },
      // Social Studies
      {
        id: `grade-${student.id}-soc-1`,
        studentId: student.id,
        teacherId,
        subject: 'Social Studies',
        title: 'Ancient Civilizations Trade Map & Artifact Presentation',
        category: 'project',
        term: 'Term 2 - Winter 2026',
        score: sIdx === 5 ? 96 : 90,
        maxScore: 100,
        percentage: sIdx === 5 ? 96 : 90,
        letterGrade: sIdx === 5 ? 'A' : 'A-',
        date: '2026-02-28',
        comments: 'Well researched historical context with engaging visual aids.',
        createdAt: '2026-02-28T13:45:00Z'
      }
    );

    // Generate 20 days of realistic attendance
    const today = new Date();
    for (let d = 20; d >= 1; d--) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() - d);
      // Skip weekends
      if (dateObj.getDay() === 0 || dateObj.getDay() === 6) continue;

      const dateStr = dateObj.toISOString().split('T')[0];
      let status: 'present' | 'absent' | 'tardy' | 'excused' = 'present';
      let notes = '';

      if (d === 8 && sIdx === 3) {
        status = 'absent';
        notes = 'Flu / Parent emailed morning note';
      } else if (d === 14 && sIdx === 1) {
        status = 'tardy';
        notes = 'Arrived 8:45 AM due to traffic delay';
      } else if (d === 4 && sIdx === 5) {
        status = 'excused';
        notes = 'Dental appointment';
      }

      attendance.push({
        id: `att-${student.id}-${dateStr}`,
        studentId: student.id,
        teacherId,
        date: dateStr,
        status,
        notes,
        updatedAt: new Date().toISOString()
      });
    }

    // Generate Behavior observations
    behaviors.push(
      {
        id: `beh-${student.id}-1`,
        studentId: student.id,
        teacherId,
        type: 'positive',
        category: sIdx % 2 === 0 ? 'teamwork' : 'leadership',
        title: sIdx % 2 === 0 ? 'Mentored lab partner through complex microscope setup' : 'Led group presentation with confidence and clarity',
        description: 'Demonstrated outstanding peer support and patience during collaborative science inquiry.',
        points: 5,
        setting: 'lab',
        date: '2026-02-15',
        parentNotified: true,
        actionTaken: 'Awarded Class Leader Star & logged in portfolio',
        createdAt: '2026-02-15T11:30:00Z'
      },
      {
        id: `beh-${student.id}-2`,
        studentId: student.id,
        teacherId,
        type: 'positive',
        category: 'perseverance',
        title: 'Showed relentless focus completing challenging math task',
        description: 'Refused to give up when tackling advanced multi-stage fractions problem.',
        points: 5,
        setting: 'classroom',
        date: '2026-02-22',
        parentNotified: false,
        createdAt: '2026-02-22T14:10:00Z'
      }
    );

    if (sIdx === 3) {
      behaviors.push({
        id: `beh-${student.id}-3`,
        studentId: student.id,
        teacherId,
        type: 'concern',
        category: 'homework_missing',
        title: 'Math practice sheet #4 not submitted on time',
        description: 'Forgot assignment in locker; teacher provided spare copy during study hall.',
        points: -2,
        setting: 'classroom',
        date: '2026-02-18',
        parentNotified: true,
        actionTaken: 'Completed during homeroom advisory block',
        createdAt: '2026-02-18T09:00:00Z'
      });
    }

    // Historical Parent Meeting Dossier
    dossiers.push({
      id: `dossier-${student.id}-1`,
      studentId: student.id,
      teacherId,
      meetingDate: '2025-11-20',
      attendees: `Ms. Davis (Lead Teacher), ${student.parentName}`,
      meetingType: 'scheduled_conference',
      status: 'completed',
      keyStrengthsDiscussed: [
        'Exceptional curiosity during hands-on STEM lessons',
        'Consistently respectful demeanor with peers and teachers',
        'Strong reading comprehension and analytical reflection'
      ],
      growthAreasDiscussed: [
        'Encouraging active participation in large group math discussions',
        'Double-checking calculations before submitting tests'
      ],
      academicSummary: `${student.name} is excelling in core competencies. Demonstrates steady academic rigor and high intrinsic motivation.`,
      actionItemsParent: [
        'Support with 20 min nightly quiet reading session',
        'Review weekly math check-in sheets'
      ],
      actionItemsTeacher: [
        'Provide advanced extension problems in geometry and science labs',
        'Check in at the start of each unit for individual questions'
      ],
      studentGoal: 'Maintain an A- average and participate at least twice per day in group discussions.',
      followUpDate: '2026-03-25',
      parentAcknowledged: true,
      notes: 'Parents were delighted with progress. Very supportive family environment.',
      createdAt: '2025-11-20T16:00:00Z',
      updatedAt: '2025-11-20T17:00:00Z'
    });
  });

  return { students, grades, attendance, behaviors, dossiers };
}
