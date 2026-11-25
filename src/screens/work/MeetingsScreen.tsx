import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { MeetingType } from '../../store/types';
import { parseTimeToMinutes, combineDateAndTime } from '../../utils/time';
import { scheduleMeetingReminder } from '../../utils/notifications';
import { todayISO, shiftISODate } from '../../utils/date';

function isoAt(offset: number) {
  return shiftISODate(todayISO(), offset);
}

function formatDateShort(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MEETING_TYPES: MeetingType[] = [
  'General meeting',
  'Presentation',
  'Follow up',
  'Doubt clarification',
  'Proposal',
  'Demo',
  'Handover',
  'KT',
];

export function MeetingsScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const { meetings, projects, deleteMeeting, addMeeting, setMeetingNotificationId, addTimelineEntry } = useData();
  const [selected, setSelected] = useState(isoAt(0));
  const [filter, setFilter] = useState<'All' | 'Teams' | 'Manual'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(isoAt(0));
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('9:30 AM');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [meetingType, setMeetingType] = useState<MeetingType>('General meeting');
  const [updateTimeline, setUpdateTimeline] = useState(false);

  const confirmDeleteMeeting = (id: string, title: string) => {
    Alert.alert('Delete meeting?', `"${title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMeeting(id) },
    ]);
  };

  const resetForm = () => {
    setTitle('');
    setMeetingDate(selected);
    setStartTime('9:00 AM');
    setEndTime('9:30 AM');
    setProjectId(undefined);
    setMeetingType('General meeting');
    setUpdateTimeline(false);
  };

  const openAdd = () => {
    setMeetingDate(selected);
    setAddOpen(true);
  };

  const saveMeeting = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'What is this meeting about?');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) {
      Alert.alert('Check the date', 'Use the format YYYY-MM-DD, e.g. 2026-12-14.');
      return;
    }
    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (startMin === null || endMin === null) {
      Alert.alert('Check the times', 'Use the format h:mm AM/PM, e.g. 9:30 AM.');
      return;
    }
    if (endMin <= startMin) {
      Alert.alert('End time is before the start', `You set it to start at ${startTime} but end at ${endTime}. Fix the end time.`);
      return;
    }

    const id = addMeeting({
      title: title.trim(),
      date: meetingDate,
      startTime,
      endTime,
      source: 'Manual',
      projectId,
      meetingType,
    });

    if (projectId && updateTimeline) {
      addTimelineEntry(projectId, {
        date: meetingDate,
        meetingId: id,
        meetingType,
        meetingTitle: title.trim(),
      });
    }

    const startDate = combineDateAndTime(meetingDate, startTime);
    if (startDate) {
      const notifId = await scheduleMeetingReminder(title.trim(), startDate, 10);
      if (notifId) setMeetingNotificationId(id, notifId);
    }

    setAddOpen(false);
    resetForm();
  };

  const days = Array.from({ length: 7 }, (_, i) => isoAt(i - 2));

  const dayMeetings = meetings
    .filter((m) => m.date === selected)
    .filter((m) => filter === 'All' || m.source === filter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const countFor = (iso: string) => meetings.filter((m) => m.date === iso).length;

  return (
    <Screen>
      <ScreenHeader
        title="Meetings"
        right={
          <TouchableOpacity
            onPress={openAdd}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, flexGrow: 0, flexShrink: 0, maxHeight: 74 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {days.map((iso) => {
          const active = iso === selected;
          const d = new Date(iso);
          const count = countFor(iso);
          return (
            <TouchableOpacity key={iso} onPress={() => setSelected(iso)}>
              <View
                style={{
                  width: 48,
                  height: 64,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  backgroundColor: active ? colors.accent : colors.pill,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', opacity: 0.75, color: active ? colors.accentOn : '#FFFFFF' }}>
                  {DOW[d.getDay()]}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: active ? colors.accentOn : '#FFFFFF' }}>
                  {d.getDate()}
                </Text>
                {count > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 13,
                      height: 13,
                      borderRadius: 7,
                      paddingHorizontal: 2,
                      backgroundColor: active ? colors.accentOn : colors.accent,
                      borderWidth: 1.5,
                      borderColor: colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 7, fontWeight: '700', color: active ? colors.accent : colors.accentOn }}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 8, flexGrow: 0, flexShrink: 0 }}>
        {(['All', 'Teams', 'Manual'] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}>
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: filter === f ? colors.accent : colors.surface,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: filter === f ? colors.accentOn : colors.sub }}>
                {f}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {dayMeetings.length === 0 && <Text style={{ color: colors.subOnBg }}>No meetings on this day.</Text>}
        <View style={{ gap: 12 }}>
          {dayMeetings.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => nav.navigate('MeetingNotes', { id: m.id })}
              onLongPress={() => confirmDeleteMeeting(m.id, m.title)}
            >
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                    {m.startTime} – {m.endTime}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.accentSoft }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>{formatDateShort(m.date)}</Text>
                    </View>
                    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.hairline }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.sub }}>{m.source}</Text>
                    </View>
                  </View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 6 }}>{m.title}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView
            style={{ maxHeight: '88%' }}
            contentContainerStyle={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textOnBg }}>Add meeting</Text>
              <TouchableOpacity onPress={() => { setAddOpen(false); resetForm(); }}>
                <Ionicons name="close" size={22} color={colors.textOnBg} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Title</Text>
            <Card style={{ marginBottom: 14 }}>
              <TextInput value={title} onChangeText={setTitle} placeholder="Design review" placeholderTextColor={colors.sub} style={{ fontSize: 14, color: colors.text }} />
            </Card>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Date</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setMeetingDate(isoAt(0))}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: meetingDate === isoAt(0) ? colors.accent : colors.surface }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: meetingDate === isoAt(0) ? colors.accentOn : colors.sub }}>Today</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMeetingDate(isoAt(1))}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: meetingDate === isoAt(1) ? colors.accent : colors.surface }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: meetingDate === isoAt(1) ? colors.accentOn : colors.sub }}>Tomorrow</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMeetingDate(isoAt(7))}>
                <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: meetingDate === isoAt(7) ? colors.accent : colors.surface }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: meetingDate === isoAt(7) ? colors.accentOn : colors.sub }}>+1 week</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Card style={{ marginBottom: 14 }}>
              <TextInput
                value={meetingDate}
                onChangeText={setMeetingDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.sub}
                style={{ fontSize: 14, color: colors.text }}
              />
            </Card>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Start</Text>
                <Card>
                  <TextInput value={startTime} onChangeText={setStartTime} placeholder="9:00 AM" placeholderTextColor={colors.sub} style={{ fontSize: 14, color: colors.text }} />
                </Card>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>End</Text>
                <Card>
                  <TextInput value={endTime} onChangeText={setEndTime} placeholder="9:30 AM" placeholderTextColor={colors.sub} style={{ fontSize: 14, color: colors.text }} />
                </Card>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Meeting type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
              {MEETING_TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => setMeetingType(t)}>
                  <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: meetingType === t ? colors.accent : colors.surface }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: meetingType === t ? colors.accentOn : colors.sub }}>{t}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {projects.length > 0 && (
              <>
                <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Link to a project (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity onPress={() => setProjectId(undefined)}>
                    <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: !projectId ? colors.accent : colors.surface }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: !projectId ? colors.accentOn : colors.sub }}>None</Text>
                    </View>
                  </TouchableOpacity>
                  {projects.map((p) => (
                    <TouchableOpacity key={p.id} onPress={() => setProjectId(p.id)}>
                      <View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: projectId === p.id ? colors.accent : colors.surface }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: projectId === p.id ? colors.accentOn : colors.sub }}>{p.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {projectId && (
              <TouchableOpacity onPress={() => setUpdateTimeline((v) => !v)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Ionicons name={updateTimeline ? 'checkbox' : 'square-outline'} size={20} color={updateTimeline ? colors.accent : colors.sub} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>Add to project timeline</Text>
                    <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2 }}>
                      Logs this meeting on the project&apos;s timeline — doesn&apos;t change its status.
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={saveMeeting} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>Save meeting</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: colors.sub, marginTop: 10, textAlign: 'center' }}>
              You&apos;ll get a reminder 10 minutes before it starts.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
