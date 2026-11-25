import { Meeting, Task, Project, Idea, CalendarEvent, SalaryConfig } from './types';
import { shiftISODate, todayISO as todayLocalISO } from '../utils/date';

function todayISO(offsetDays = 0): string {
  return shiftISODate(todayLocalISO(), offsetDays);
}

export const seedMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Sprint planning',
    date: todayISO(0),
    startTime: '9:30 AM',
    endTime: '10:00 AM',
    source: 'Teams',
    notes: '',
    projectId: 'p1',
    aiSummary:
      'Team committed to 18 points for the sprint. API rate-limiting ships first; design review moved to Thursday.',
    actionItems: [
      { id: 'a1', label: 'Share sprint board link with team', done: true },
      { id: 'a2', label: 'Pair with Sara on migration script', done: true },
      { id: 'a3', label: 'Confirm rate limiter rollout window with infra', done: false },
    ],
  },
  {
    id: 'm2',
    title: '1:1 with manager',
    date: todayISO(0),
    startTime: '1:00 PM',
    endTime: '1:20 PM',
    source: 'Teams',
  },
  {
    id: 'm3',
    title: 'Design review',
    date: todayISO(0),
    startTime: '4:30 PM',
    endTime: '5:15 PM',
    source: 'Manual',
  },
];

export const seedTasks: Task[] = [
  { id: 't1', label: 'Review PR #482', tag: 'Urgent', done: false, date: todayISO(0) },
  { id: 't2', label: 'Write design doc draft', tag: 'Medium', done: false, date: todayISO(0) },
  { id: 't3', label: 'Reply to infra thread', tag: 'Normal', done: false, date: todayISO(0) },
  { id: 't4', label: 'Stand-up + sprint planning', tag: 'Normal', done: true, date: todayISO(0) },
  { id: 't5', label: 'Fixed rate-limiter test flake', tag: 'Normal', done: true, date: todayISO(0) },
  { id: 't6', label: 'Paired with Sara on migration script', tag: 'Normal', done: true, date: todayISO(0) },
  { id: 't7', label: '1:1 with manager', tag: 'Normal', done: true, date: todayISO(0) },
];

export const seedProjects: Project[] = [
  {
    id: 'p1',
    name: 'Project Atlas',
    team: 'Platform team · 8 members',
    status: 'On track',
    pct: 62,
    mine: true,
    role: 'Backend Lead',
    dueDate: 'Dec 12',
    timeline: [
      { id: 'tl1', date: todayISO(-40), status: 'Opportunity', note: 'Pitched platform migration to leadership.' },
      { id: 'tl2', date: todayISO(-30), status: 'Planning', note: 'Scoping approved, team assembled.' },
      { id: 'tl3', date: todayISO(-10), status: 'On track', note: 'Stage 2 shipped on schedule.' },
    ],
  },
  {
    id: 'p2',
    name: 'Checkout Revamp',
    team: 'Growth team · 5 members',
    status: 'At risk',
    pct: 34,
    mine: false,
    timeline: [
      { id: 'tl4', date: todayISO(-25), status: 'Opportunity', note: 'Growth team proposed a checkout rebuild.' },
      { id: 'tl5', date: todayISO(-18), status: 'Cancelled', note: 'Called off — budget frozen for the quarter.' },
      { id: 'tl6', date: todayISO(-6), status: 'At risk', note: 'Re-approached us; back on but behind schedule.' },
    ],
  },
  { id: 'p3', name: 'Mobile SDK v3', team: 'Platform team · 6 members', status: 'On track', pct: 81, mine: false },
  { id: 'p4', name: 'Data warehouse', team: 'Infra team · 4 members', status: 'Planning', pct: 12, mine: false },
];

export const seedIdeas: Idea[] = [
  {
    id: 'i1',
    title: 'Farmers-market finder',
    desc: 'Weekend-only map of local farmers markets with live stall lists, built from community photos.',
    tag: 'Startup',
    stage: 'Sketching',
    starred: true,
    createdAt: todayISO(-2),
  },
  {
    id: 'i2',
    title: 'Shared grocery run app',
    desc: 'Neighbors pool one Costco run a week and split the haul automatically by cart.',
    tag: 'Startup',
    stage: 'Idea',
    starred: false,
    createdAt: todayISO(-5),
  },
  {
    id: 'i3',
    title: 'Desk plant watering tracker',
    desc: 'A tiny sensor + app combo so office plants survive long weekends.',
    tag: 'Side project',
    stage: 'Idea',
    starred: false,
    createdAt: todayISO(-7),
  },
  {
    id: 'i4',
    title: '"What did I eat" photo log',
    desc: 'Snap a photo, auto-tag the meal, no manual logging — for curiosity not dieting.',
    tag: 'Side project',
    stage: 'Researching',
    starred: true,
    createdAt: todayISO(-14),
  },
];

export const seedEvents: CalendarEvent[] = [
  { id: 'e1', date: todayISO(1), title: 'Thanksgiving (US holiday)', kind: 'holiday' },
  { id: 'e2', date: todayISO(2), title: 'Design review', kind: 'meeting' },
  { id: 'e3', date: todayISO(5), title: 'Project Atlas — stage 3 due', kind: 'deadline' },
  { id: 'e4', date: todayISO(6), title: 'Payday', kind: 'meeting' },
];

export const seedSalary: SalaryConfig = {
  amount: 145000,
  paydayDom: 1,
  currency: '₹',
  history: [
    { id: 'sal1', month: 'November 2026', amount: 145000 },
    { id: 'sal2', month: 'October 2026', amount: 145000 },
    { id: 'sal3', month: 'September 2026', amount: 142500 },
    { id: 'sal4', month: 'August 2026', amount: 142500 },
  ],
};
