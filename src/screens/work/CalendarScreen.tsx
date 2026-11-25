import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '../../store/types';
import { todayISO as localTodayISO } from '../../utils/date';

type DisplayItem = CalendarEvent & { meetingId?: string };

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const KINDS: CalendarEvent['kind'][] = ['leave', 'holiday', 'deadline', 'meeting'];
const KIND_LABEL: Record<CalendarEvent['kind'], string> = {
  leave: 'Leave',
  holiday: 'Holiday',
  deadline: 'Deadline',
  meeting: 'Meeting',
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function CalendarScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const { events, meetings, addEvent, deleteEvent } = useData();
  const [cursor, setCursor] = useState(() => new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [newDay, setNewDay] = useState('1');
  const [newTitle, setNewTitle] = useState('');
  const [newKind, setNewKind] = useState<CalendarEvent['kind']>('leave');

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayISO = localTodayISO();

  const changeMonth = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const allItems: DisplayItem[] = useMemo(
    () => [
      ...events,
      ...meetings.map((m) => ({
        id: `meeting-${m.id}`,
        date: m.date,
        title: m.title,
        kind: 'meeting' as const,
        meetingId: m.id,
      })),
    ],
    [events, meetings]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, DisplayItem[]> = {};
    allItems.forEach((e) => {
      map[e.date] = map[e.date] ? [...map[e.date], e] : [e];
    });
    return map;
  }, [allItems]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const counts = { meeting: 0, holiday: 0, deadline: 0, leave: 0 };
  allItems.forEach((e) => {
    if (e.date.slice(0, 7) === `${year}-${pad(month + 1)}`) counts[e.kind]++;
  });

  const colorFor = (kind: CalendarEvent['kind']) =>
    kind === 'holiday' ? colors.holiday : kind === 'deadline' ? colors.deadline : kind === 'leave' ? colors.leave : colors.pill;

  const monthEvents = allItems
    .filter((e) => e.date.slice(0, 7) === `${year}-${pad(month + 1)}`)
    .sort((a, b) => a.date.localeCompare(b.date));

  const openAdd = (day?: number) => {
    setNewDay(String(day ?? Math.min(new Date().getDate(), daysInMonth)));
    setNewTitle('');
    setNewKind('leave');
    setAddOpen(true);
  };

  const save = () => {
    const day = Math.max(1, Math.min(daysInMonth, parseInt(newDay, 10) || 1));
    if (!newTitle.trim()) {
      Alert.alert('Add a title', 'Give this event a short title.');
      return;
    }
    addEvent({ date: toISO(year, month, day), title: newTitle.trim(), kind: newKind });
    setAddOpen(false);
  };

  const confirmDelete = (e: DisplayItem) => {
    if (e.meetingId) {
      Alert.alert('This is a meeting', 'Delete or edit it from the Meetings tab instead.');
      return;
    }
    Alert.alert('Delete event?', `"${e.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(e.id) },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={monthLabel}
        right={
          <TouchableOpacity
            onPress={() => openAdd()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        }
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600' }}>Swipe months</Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, borderRadius: 16, padding: 10, alignItems: 'center', backgroundColor: colors.pill }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>{counts.meeting}</Text>
            <Text style={{ fontSize: 9, color: '#C6CAB8', fontWeight: '600' }}>Meetings</Text>
          </View>
          <Card style={{ flex: 1, alignItems: 'center', padding: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.leave }}>{counts.leave}</Text>
            <Text style={{ fontSize: 9, color: colors.sub, fontWeight: '600' }}>Leave</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', padding: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.holiday }}>{counts.holiday}</Text>
            <Text style={{ fontSize: 9, color: colors.sub, fontWeight: '600' }}>Holidays</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', padding: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.deadline }}>{counts.deadline}</Text>
            <Text style={{ fontSize: 9, color: colors.sub, fontWeight: '600' }}>Deadlines</Text>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          {DOW.map((d, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: colors.subOnBg }}>
              {d}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {cells.map((day, idx) => {
            if (day === null) return <View key={idx} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
            const iso = toISO(year, month, day);
            const dayEvents = eventsByDate[iso] ?? [];
            const isToday = iso === todayISO;
            const primary = dayEvents[0];
            const bg = isToday ? colors.pill : primary ? `${colorFor(primary.kind)}40` : colors.surface;
            const fg = isToday ? '#FFFFFF' : colors.text;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => openAdd(day)}
                onLongPress={() => dayEvents[0] && confirmDelete(dayEvents[0])}
                style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                    borderWidth: !isToday && primary ? 1.5 : 0,
                    borderColor: primary ? colorFor(primary.kind) : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: isToday ? '700' : '500', color: fg }}>{day}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          <Legend color={colors.leave} label="Leave" textColor={colors.subOnBg} />
          <Legend color={colors.holiday} label="Holiday" textColor={colors.subOnBg} />
          <Legend color={colors.pill} label="Meeting" textColor={colors.subOnBg} />
          <Legend color={colors.deadline} label="Deadline" textColor={colors.subOnBg} />
        </View>

        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg, marginTop: 22 }}>This month</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {monthEvents.length === 0 && (
            <Text style={{ color: colors.subOnBg, fontSize: 13 }}>Nothing logged — tap + or a date to add leave, a holiday or a deadline.</Text>
          )}
          {monthEvents.map((e) => {
            const d = new Date(e.date);
            const isMeeting = !!e.meetingId;
            return (
              <TouchableOpacity
                key={e.id}
                onPress={isMeeting ? () => nav.navigate('MeetingNotes', { id: e.meetingId }) : undefined}
                onLongPress={() => confirmDelete(e)}
              >
                <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${colorFor(e.kind)}33`,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colorFor(e.kind) }}>{d.getDate()}</Text>
                    <Text style={{ fontSize: 8, fontWeight: '600', color: colorFor(e.kind), opacity: 0.85 }}>
                      {d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{e.title}</Text>
                    <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2, textTransform: 'capitalize' }}>{KIND_LABEL[e.kind]}</Text>
                  </View>
                  {isMeeting && <Ionicons name="chevron-forward" size={16} color={colors.sub} />}
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textOnBg }}>Add to {monthLabel}</Text>
              <TouchableOpacity onPress={() => setAddOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textOnBg} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {KINDS.map((k) => (
                <TouchableOpacity key={k} onPress={() => setNewKind(k)}>
                  <View
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: newKind === k ? colors.accent : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: newKind === k ? colors.accentOn : colors.sub }}>
                      {KIND_LABEL[k]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ width: 90 }}>
                <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Day</Text>
                <Card>
                  <TextInput value={newDay} onChangeText={setNewDay} keyboardType="numeric" style={{ fontSize: 14, color: colors.text }} />
                </Card>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Title</Text>
                <Card>
                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="e.g. Casual leave"
                    placeholderTextColor={colors.sub}
                    style={{ fontSize: 14, color: colors.text }}
                  />
                </Card>
              </View>
            </View>

            <TouchableOpacity onPress={save} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Legend({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 11, color: textColor }}>{label}</Text>
    </View>
  );
}
