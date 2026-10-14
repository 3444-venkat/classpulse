import { ClassItem } from '../types/timetable';

export const CS_TIMETABLE: ClassItem[] = [
  // Monday
  {
    id: 'cs-mon-1',
    subject: 'Data Structures & Algorithms',
    code: 'CS-201',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:15',
    room: 'Hall 302 (Turing Building)',
    instructor: 'Dr. Evelyn Reed',
    type: 'lecture',
    color: 'blue',
    notes: 'Review binary search trees before class',
    attendance: { attended: 14, total: 15 }
  },
  {
    id: 'cs-mon-2',
    subject: 'Computer Architecture',
    code: 'CS-204',
    day: 'Monday',
    startTime: '10:45',
    endTime: '12:00',
    room: 'Room 114 (Engineering Block)',
    instructor: 'Prof. Marcus Chen',
    type: 'lecture',
    color: 'purple',
    notes: 'RISC-V pipeline hazard analysis today',
    attendance: { attended: 12, total: 13 }
  },
  {
    id: 'cs-mon-3',
    subject: 'Operating Systems Lab',
    code: 'CS-205L',
    day: 'Monday',
    startTime: '14:00',
    endTime: '16:30',
    room: 'Unix Systems Lab 4',
    instructor: 'Dr. Sarah Vance',
    type: 'lab',
    color: 'emerald',
    notes: 'Submit Kernel synchronization task by 5 PM',
    attendance: { attended: 9, total: 10 }
  },

  // Tuesday
  {
    id: 'cs-tue-1',
    subject: 'Discrete Mathematics',
    code: 'MATH-210',
    day: 'Tuesday',
    startTime: '09:30',
    endTime: '10:45',
    room: 'Lecture Theatre 2',
    instructor: 'Prof. David Hilbert Jr.',
    type: 'lecture',
    color: 'amber',
    notes: 'Graph theory & Dijkstra proofs',
    attendance: { attended: 13, total: 14 }
  },
  {
    id: 'cs-tue-2',
    subject: 'Database Management Systems',
    code: 'CS-220',
    day: 'Tuesday',
    startTime: '11:15',
    endTime: '12:30',
    room: 'Hall 205 (Science Complex)',
    instructor: 'Dr. Aisha Patel',
    type: 'lecture',
    color: 'cyan',
    notes: 'ACID transactions & B+ trees query planner',
    attendance: { attended: 14, total: 14 }
  },
  {
    id: 'cs-tue-3',
    subject: 'AI & Ethics Seminar',
    code: 'CS-390',
    day: 'Tuesday',
    startTime: '15:00',
    endTime: '16:15',
    room: 'Auditorium C',
    instructor: 'Prof. Robert Thorne',
    type: 'seminar',
    color: 'rose',
    notes: 'Discussion on EU AI Act compliance',
    attendance: { attended: 11, total: 12 }
  },

  // Wednesday
  {
    id: 'cs-wed-1',
    subject: 'Data Structures & Algorithms',
    code: 'CS-201',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:15',
    room: 'Hall 302 (Turing Building)',
    instructor: 'Dr. Evelyn Reed',
    type: 'lecture',
    color: 'blue',
    notes: 'Heaps, Priority Queues & Huffman Coding',
    attendance: { attended: 13, total: 15 }
  },
  {
    id: 'cs-wed-2',
    subject: 'Computer Networks',
    code: 'CS-250',
    day: 'Wednesday',
    startTime: '10:45',
    endTime: '12:00',
    room: 'Room 210 (Engineering Block)',
    instructor: 'Dr. Kenneth Hopper',
    type: 'lecture',
    color: 'indigo',
    notes: 'TCP 3-way handshake & Congestion Control',
    attendance: { attended: 12, total: 13 }
  },
  {
    id: 'cs-wed-3',
    subject: 'Algorithms Problem Solving',
    code: 'CS-201T',
    day: 'Wednesday',
    startTime: '13:30',
    endTime: '15:00',
    room: 'Tutorial Room 4B',
    instructor: 'Teaching Fellow Maya Lin',
    type: 'tutorial',
    color: 'blue',
    notes: 'Whiteboard problem solving session',
    attendance: { attended: 10, total: 10 }
  },

  // Thursday
  {
    id: 'cs-thu-1',
    subject: 'Database Systems Lab',
    code: 'CS-220L',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '11:30',
    room: 'Database Lab 1',
    instructor: 'Dr. Aisha Patel',
    type: 'lab',
    color: 'cyan',
    notes: 'PostgreSQL indexing benchmark sprint',
    attendance: { attended: 12, total: 12 }
  },
  {
    id: 'cs-thu-2',
    subject: 'Discrete Mathematics',
    code: 'MATH-210',
    day: 'Thursday',
    startTime: '13:00',
    endTime: '14:15',
    room: 'Lecture Theatre 2',
    instructor: 'Prof. David Hilbert Jr.',
    type: 'lecture',
    color: 'amber',
    notes: 'Combinatorics and recurrence relations',
    attendance: { attended: 12, total: 14 }
  },
  {
    id: 'cs-thu-3',
    subject: 'Computer Architecture',
    code: 'CS-204',
    day: 'Thursday',
    startTime: '14:45',
    endTime: '16:00',
    room: 'Room 114 (Engineering Block)',
    instructor: 'Prof. Marcus Chen',
    type: 'lecture',
    color: 'purple',
    notes: 'Cache memory hierarchy and MESI protocol',
    attendance: { attended: 11, total: 13 }
  },

  // Friday
  {
    id: 'cs-fri-1',
    subject: 'Computer Networks',
    code: 'CS-250',
    day: 'Friday',
    startTime: '09:30',
    endTime: '10:45',
    room: 'Room 210 (Engineering Block)',
    instructor: 'Dr. Kenneth Hopper',
    type: 'lecture',
    color: 'indigo',
    notes: 'DNS, BGP routing & TLS 1.3 protocol',
    attendance: { attended: 12, total: 13 }
  },
  {
    id: 'cs-fri-2',
    subject: 'Web Technologies & Cloud Lab',
    code: 'CS-270L',
    day: 'Friday',
    startTime: '11:15',
    endTime: '13:45',
    room: 'Cloud Computing Lab B',
    instructor: 'Prof. Elena Rostova',
    type: 'lab',
    color: 'teal',
    notes: 'Deploying REST services to container clusters',
    attendance: { attended: 10, total: 11 }
  },
  {
    id: 'cs-fri-3',
    subject: 'Tech Project Colloquium',
    code: 'CS-399',
    day: 'Friday',
    startTime: '15:00',
    endTime: '16:30',
    room: 'Innovation Hub Hall',
    instructor: 'Dept Head Dr. Wallace',
    type: 'seminar',
    color: 'orange',
    notes: 'Student lightning talks & industry guest',
    attendance: { attended: 9, total: 10 }
  }
];

export const PREMED_TIMETABLE: ClassItem[] = [
  {
    id: 'med-mon-1',
    subject: 'Human Anatomy & Histology',
    code: 'ANAT-101',
    day: 'Monday',
    startTime: '08:30',
    endTime: '10:00',
    room: 'Anatomy Theatre East',
    instructor: 'Dr. Claire Bennett',
    type: 'lecture',
    color: 'rose',
    attendance: { attended: 15, total: 15 }
  },
  {
    id: 'med-mon-2',
    subject: 'Medical Biochemistry',
    code: 'BIOC-202',
    day: 'Monday',
    startTime: '10:30',
    endTime: '12:00',
    room: 'Hall 105 (Medical Sciences)',
    instructor: 'Prof. Julian Brooks',
    type: 'lecture',
    color: 'emerald',
    attendance: { attended: 13, total: 14 }
  },
  {
    id: 'med-mon-3',
    subject: 'Cadaver Dissection Lab',
    code: 'ANAT-101L',
    day: 'Monday',
    startTime: '13:30',
    endTime: '16:30',
    room: 'Gross Anatomy Lab 3',
    instructor: 'Dr. Claire Bennett',
    type: 'lab',
    color: 'rose',
    attendance: { attended: 10, total: 10 }
  },
  {
    id: 'med-tue-1',
    subject: 'General Physiology',
    code: 'PHYS-210',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Hall 201 (Life Sciences)',
    instructor: 'Dr. Sanjay Gupta',
    type: 'lecture',
    color: 'blue',
    attendance: { attended: 14, total: 14 }
  },
  {
    id: 'med-wed-1',
    subject: 'Clinical Microbiology',
    code: 'MICR-205',
    day: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Microbiology Lecture Hall',
    instructor: 'Dr. Teresa Bell',
    type: 'lecture',
    color: 'teal',
    attendance: { attended: 12, total: 12 }
  },
  {
    id: 'med-thu-1',
    subject: 'Physiology Lab Simulation',
    code: 'PHYS-210L',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '12:00',
    room: 'Physiology Wet Lab',
    instructor: 'Dr. Sanjay Gupta',
    type: 'lab',
    color: 'blue',
    attendance: { attended: 11, total: 11 }
  },
  {
    id: 'med-fri-1',
    subject: 'Medical Ethics & Patient Care',
    code: 'ETH-150',
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Seminar Room 4A',
    instructor: 'Dr. Hannah Wright',
    type: 'seminar',
    color: 'purple',
    attendance: { attended: 9, total: 9 }
  }
];

export const BUSINESS_TIMETABLE: ClassItem[] = [
  {
    id: 'biz-mon-1',
    subject: 'Corporate Finance',
    code: 'FIN-301',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Executive Hall 101',
    instructor: 'Prof. Gregory Vance',
    type: 'lecture',
    color: 'amber',
    attendance: { attended: 12, total: 13 }
  },
  {
    id: 'biz-mon-2',
    subject: 'Marketing Strategy',
    code: 'MKT-240',
    day: 'Monday',
    startTime: '11:00',
    endTime: '12:30',
    room: 'Case Study Room 3',
    instructor: 'Dr. Lisa Kowalski',
    type: 'lecture',
    color: 'sky',
    attendance: { attended: 13, total: 13 }
  },
  {
    id: 'biz-tue-1',
    subject: 'Managerial Accounting',
    code: 'ACC-202',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Hall 204 (Business School)',
    instructor: 'Prof. Nathan Reed',
    type: 'lecture',
    color: 'emerald',
    attendance: { attended: 10, total: 11 }
  },
  {
    id: 'biz-wed-1',
    subject: 'Microeconomic Analysis',
    code: 'ECON-210',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Executive Hall 101',
    instructor: 'Dr. Arthur Pendelton',
    type: 'lecture',
    color: 'purple',
    attendance: { attended: 14, total: 15 }
  },
  {
    id: 'biz-thu-1',
    subject: 'Business Analytics & Excel Lab',
    code: 'BAN-250',
    day: 'Thursday',
    startTime: '13:00',
    endTime: '15:30',
    room: 'Financial Computing Lab',
    instructor: 'Prof. Lisa Kowalski',
    type: 'lab',
    color: 'indigo',
    attendance: { attended: 11, total: 12 }
  },
  {
    id: 'biz-fri-1',
    subject: 'Leadership & Organizational Behavior',
    code: 'MGT-310',
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:45',
    room: 'Auditorium A',
    instructor: 'Dean Thomas Bradley',
    type: 'seminar',
    color: 'orange',
    attendance: { attended: 9, total: 10 }
  }
];

export const TIMETABLE_PRESETS = [
  {
    id: 'cs',
    name: 'Computer Science & Engineering',
    category: 'Engineering / STEM',
    description: 'Algorithms, Architecture, OS Lab, Database Systems & Networks (15 sessions/week)',
    classes: CS_TIMETABLE
  },
  {
    id: 'premed',
    name: 'Pre-Med & Biomedical Sciences',
    category: 'Life Sciences / Medicine',
    description: 'Anatomy, Dissection Labs, Medical Biochemistry & Physiology (7 sessions/week)',
    classes: PREMED_TIMETABLE
  },
  {
    id: 'business',
    name: 'Business Administration & Economics',
    category: 'Commerce / Management',
    description: 'Corporate Finance, Strategy, Accounting & Analytics Lab (6 sessions/week)',
    classes: BUSINESS_TIMETABLE
  }
];
