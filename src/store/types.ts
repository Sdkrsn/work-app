export type MeetingType =
  | 'Presentation'
  | 'Follow up'
  | 'General meeting'
  | 'Doubt clarification'
  | 'Proposal'
  | 'Demo'
  | 'Handover'
  | 'KT';

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "9:30 AM"
  endTime: string;
  source: 'Teams' | 'Manual';
  notes?: string;
  aiSummary?: string;
  actionItems?: ActionItem[];
  projectId?: string;
  meetingType?: MeetingType;
  notificationId?: string;
}

export interface ActionItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  label: string;
  tag: 'Urgent' | 'Medium' | 'Normal';
  done: boolean;
  date: string; // YYYY-MM-DD, the day this task belongs to
}

export type ProjectStatus = 'On track' | 'At risk' | 'Planning' | 'Opportunity' | 'Cancelled';

export interface ProjectTimelineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  /** Present for manual status updates. Absent for meeting-log entries. */
  status?: ProjectStatus;
  note?: string;
  /** Present when this entry was auto-logged from a meeting rather than a manual status update. */
  meetingId?: string;
  meetingType?: MeetingType;
  meetingTitle?: string;
}

export type ProjectSource = 'Mindteck' | 'Self-sourced' | 'Other';

export interface Project {
  id: string;
  name: string;
  team: string;
  status: ProjectStatus;
  pct: number;
  mine: boolean;
  role?: string;
  dueDate?: string;
  timeline?: ProjectTimelineEntry[];
  company?: string;
  about?: string;
  source?: ProjectSource;
}

export interface Idea {
  id: string;
  title: string;
  desc: string;
  tag: 'Startup' | 'Side project' | 'Random';
  stage: 'Idea' | 'Sketching' | 'Researching' | 'Building';
  starred: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  kind: 'holiday' | 'deadline' | 'meeting' | 'leave';
}

export interface PayslipEntry {
  id: string;
  month: string;
  amount: number;
  payslipUri?: string;
}

export interface SalaryConfig {
  amount: number;
  paydayDom: number; // day of month
  currency: string;
  history: PayslipEntry[];
}

export interface JournalEntry {
  id: string;
  date: string;
  note: string;
}
