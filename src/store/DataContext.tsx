import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting, Task, Project, Idea, CalendarEvent, SalaryConfig, JournalEntry, PayslipEntry, ProjectTimelineEntry } from './types';
import { seedMeetings, seedTasks, seedProjects, seedIdeas, seedEvents, seedSalary } from './seed';
import { cancelReminder } from '../utils/notifications';
import { todayISO } from '../utils/date';

const STORAGE_KEY = 'workos.data.v1';

interface DataShape {
  meetings: Meeting[];
  tasks: Task[];
  projects: Project[];
  ideas: Idea[];
  events: CalendarEvent[];
  salary: SalaryConfig;
  journal: JournalEntry[];
}

interface DataContextValue extends DataShape {
  loaded: boolean;
  addMeeting: (m: Omit<Meeting, 'id'>) => string;
  setMeetingNotificationId: (meetingId: string, notificationId: string) => void;
  toggleActionItem: (meetingId: string, actionId: string) => void;
  updateMeetingNotes: (meetingId: string, notes: string) => void;
  addTask: (t: Omit<Task, 'id' | 'done'>) => void;
  toggleTask: (id: string) => void;
  addIdea: (i: Omit<Idea, 'id' | 'createdAt'>) => void;
  updateIdea: (id: string, patch: Partial<Omit<Idea, 'id' | 'createdAt'>>) => void;
  toggleIdeaStar: (id: string) => void;
  addJournalEntry: (date: string, note: string) => void;
  deleteMeeting: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteIdea: (id: string) => void;
  deleteJournalEntry: (id: string) => void;
  addPayslip: (entry: Omit<PayslipEntry, 'id'>) => void;
  deletePayslip: (id: string) => void;
  addTimelineEntry: (projectId: string, entry: Omit<ProjectTimelineEntry, 'id'>) => void;
  deleteTimelineEntry: (projectId: string, entryId: string) => void;
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addProject: (p: Omit<Project, 'id'>) => string;
  updateProject: (id: string, patch: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  resetAll: () => void;
  loadSampleData: () => void;
}

const emptyData: DataShape = {
  meetings: [],
  tasks: [],
  projects: [],
  ideas: [],
  events: [],
  salary: { amount: 0, paydayDom: 1, currency: '₹', history: [] },
  journal: [],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataShape>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setData(JSON.parse(raw));
        }
      } catch {
        // ignore corrupt storage, fall back to seed data
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const addMeeting: DataContextValue['addMeeting'] = (m) => {
    const id = uid();
    setData((d) => ({ ...d, meetings: [...d.meetings, { ...m, id }] }));
    return id;
  };

  const setMeetingNotificationId: DataContextValue['setMeetingNotificationId'] = (meetingId, notificationId) => {
    setData((d) => ({
      ...d,
      meetings: d.meetings.map((m) => (m.id === meetingId ? { ...m, notificationId } : m)),
    }));
  };

  const toggleActionItem: DataContextValue['toggleActionItem'] = (meetingId, actionId) => {
    setData((d) => ({
      ...d,
      meetings: d.meetings.map((m) =>
        m.id !== meetingId
          ? m
          : {
              ...m,
              actionItems: (m.actionItems ?? []).map((a) =>
                a.id === actionId ? { ...a, done: !a.done } : a
              ),
            }
      ),
    }));
  };

  const updateMeetingNotes: DataContextValue['updateMeetingNotes'] = (meetingId, notes) => {
    setData((d) => ({
      ...d,
      meetings: d.meetings.map((m) => (m.id === meetingId ? { ...m, notes } : m)),
    }));
  };

  const addTask: DataContextValue['addTask'] = (t) => {
    setData((d) => ({ ...d, tasks: [...d.tasks, { ...t, id: uid(), done: false }] }));
  };

  const toggleTask: DataContextValue['toggleTask'] = (id) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  const addIdea: DataContextValue['addIdea'] = (i) => {
    setData((d) => ({
      ...d,
      ideas: [{ ...i, id: uid(), createdAt: todayISO() }, ...d.ideas],
    }));
  };

  const updateIdea: DataContextValue['updateIdea'] = (id, patch) => {
    setData((d) => ({
      ...d,
      ideas: d.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  };

  const toggleIdeaStar: DataContextValue['toggleIdeaStar'] = (id) => {
    setData((d) => ({
      ...d,
      ideas: d.ideas.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)),
    }));
  };

  const addJournalEntry: DataContextValue['addJournalEntry'] = (date, note) => {
    setData((d) => ({ ...d, journal: [{ id: uid(), date, note }, ...d.journal] }));
  };

  const deleteMeeting: DataContextValue['deleteMeeting'] = (id) => {
    setData((d) => {
      const meeting = d.meetings.find((m) => m.id === id);
      if (meeting?.notificationId) cancelReminder(meeting.notificationId);
      return { ...d, meetings: d.meetings.filter((m) => m.id !== id) };
    });
  };

  const deleteTask: DataContextValue['deleteTask'] = (id) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  };

  const deleteIdea: DataContextValue['deleteIdea'] = (id) => {
    setData((d) => ({ ...d, ideas: d.ideas.filter((i) => i.id !== id) }));
  };

  const deleteJournalEntry: DataContextValue['deleteJournalEntry'] = (id) => {
    setData((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) }));
  };

  const addPayslip: DataContextValue['addPayslip'] = (entry) => {
    setData((d) => ({
      ...d,
      salary: { ...d.salary, history: [{ ...entry, id: uid() }, ...d.salary.history] },
    }));
  };

  const deletePayslip: DataContextValue['deletePayslip'] = (id) => {
    setData((d) => ({
      ...d,
      salary: { ...d.salary, history: d.salary.history.filter((h) => h.id !== id) },
    }));
  };

  const addTimelineEntry: DataContextValue['addTimelineEntry'] = (projectId, entry) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: entry.status ?? p.status,
              timeline: [...(p.timeline ?? []), { ...entry, id: uid() }],
            }
          : p
      ),
    }));
  };

  const deleteTimelineEntry: DataContextValue['deleteTimelineEntry'] = (projectId, entryId) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === projectId ? { ...p, timeline: (p.timeline ?? []).filter((t) => t.id !== entryId) } : p
      ),
    }));
  };

  const addEvent: DataContextValue['addEvent'] = (e) => {
    setData((d) => ({ ...d, events: [...d.events, { ...e, id: uid() }] }));
  };

  const deleteEvent: DataContextValue['deleteEvent'] = (id) => {
    setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
  };

  const addProject: DataContextValue['addProject'] = (p) => {
    const id = uid();
    setData((d) => ({ ...d, projects: [...d.projects, { ...p, id }] }));
    return id;
  };

  const updateProject: DataContextValue['updateProject'] = (id, patch) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const deleteProject: DataContextValue['deleteProject'] = (id) => {
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  };

  const resetAll: DataContextValue['resetAll'] = () => {
    setData(emptyData);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData)).catch(() => {});
  };

  const loadSampleData: DataContextValue['loadSampleData'] = () => {
    setData({
      meetings: seedMeetings,
      tasks: seedTasks,
      projects: seedProjects,
      ideas: seedIdeas,
      events: seedEvents,
      salary: seedSalary,
      journal: [],
    });
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        loaded,
        addMeeting,
        setMeetingNotificationId,
        toggleActionItem,
        updateMeetingNotes,
        addTask,
        toggleTask,
        addIdea,
        updateIdea,
        toggleIdeaStar,
        addJournalEntry,
        deleteMeeting,
        deleteTask,
        deleteIdea,
        deleteJournalEntry,
        addPayslip,
        deletePayslip,
        addTimelineEntry,
        deleteTimelineEntry,
        addEvent,
        deleteEvent,
        addProject,
        updateProject,
        deleteProject,
        resetAll,
        loadSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
