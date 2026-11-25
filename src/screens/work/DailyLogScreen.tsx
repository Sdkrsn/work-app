import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { todayISO, shiftISODate as shiftISO } from '../../utils/date';

function formatHeading(iso: string, today: string) {
  if (iso === today) return 'Today';
  if (iso === shiftISO(today, 1)) return 'Tomorrow';
  if (iso === shiftISO(today, -1)) return 'Yesterday';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const tagColors = (tag: string, colors: any) =>
  tag === 'Urgent'
    ? { bg: `${colors.danger}24`, fg: colors.danger }
    : tag === 'Medium'
    ? { bg: `${colors.deadline}29`, fg: colors.deadline }
    : { bg: colors.hairline, fg: colors.sub };

function ProgressRing({ pct, size = 56, color, trackColor, bg }: any) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', width: size - 12, height: size - 12, borderRadius: 999, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} />
    </View>
  );
}

export function DailyLogScreen() {
  const { colors } = useTheme();
  const { tasks, addTask, toggleTask, deleteTask } = useData();
  const [draft, setDraft] = useState('');
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showJump, setShowJump] = useState(false);
  const [jumpText, setJumpText] = useState('');
  const todays = tasks.filter((t) => t.date === selectedDate);
  const todo = todays.filter((t) => !t.done);
  const done = todays.filter((t) => t.done);
  const pct = todays.length ? done.length / todays.length : 0;

  const submit = () => {
    if (!draft.trim()) return;
    addTask({ label: draft.trim(), tag: 'Normal', date: selectedDate });
    setDraft('');
  };

  const jumpToDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(jumpText.trim())) {
      Alert.alert('Invalid date', 'Enter a date as YYYY-MM-DD.');
      return;
    }
    setSelectedDate(jumpText.trim());
    setJumpText('');
    setShowJump(false);
  };

  const confirmDelete = (id: string, label: string) => {
    Alert.alert('Delete task?', `"${label}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Daily log" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setSelectedDate((d) => shiftISO(d, -1))}
            style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.hairline, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowJump((s) => !s)}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>{formatHeading(selectedDate, today)}</Text>
            <Text style={{ fontSize: 12, color: colors.subOnBg, marginTop: 1 }}>
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedDate((d) => shiftISO(d, 1))}
            style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.hairline, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>

          {selectedDate !== today && (
            <TouchableOpacity
              onPress={() => setSelectedDate(today)}
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.accent }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accentOn }}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {showJump && (
          <Card style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={jumpText}
              onChangeText={setJumpText}
              onSubmitEditing={jumpToDate}
              placeholder="Jump to date (YYYY-MM-DD)"
              placeholderTextColor={colors.sub}
              style={{ flex: 1, fontSize: 13, color: colors.text }}
            />
            <TouchableOpacity
              onPress={jumpToDate}
              style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.accent }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accentOn }}>Go</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={{ marginTop: 14, backgroundColor: colors.deep, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View>
            <ProgressRing pct={pct} color={colors.barAccent} trackColor="rgba(255,255,255,0.12)" bg={colors.deep} />
            <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.deepText }}>
                {done.length}/{todays.length}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.deepText }}>
              {pct >= 1 && todays.length > 0 ? 'All done!' : selectedDate === today ? 'Good progress today' : 'Tasks for this day'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.deepSub, marginTop: 2 }}>
              {todo.length} task{todo.length === 1 ? '' : 's'} left
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>To do</Text>
        </View>
        <Card style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="Add a task…"
            placeholderTextColor={colors.sub}
            style={{ flex: 1, fontSize: 13, color: colors.text }}
          />
          <TouchableOpacity
            onPress={submit}
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={15} color={colors.accentOn} />
          </TouchableOpacity>
        </Card>

        <View style={{ gap: 8, marginTop: 10 }}>
          {todo.map((t) => {
            const tc = tagColors(t.tag, colors);
            return (
              <TouchableOpacity key={t.id} onPress={() => toggleTask(t.id)} onLongPress={() => confirmDelete(t.id, t.label)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 6, borderWidth: 1.5, borderColor: colors.hairline }} />
                  <Text style={{ fontSize: 13, flex: 1, color: colors.text }}>{t.label}</Text>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: tc.bg }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: tc.fg }}>{t.tag}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg, marginTop: 22 }}>Done</Text>
        <View style={{ gap: 8, marginTop: 10 }}>
          {done.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => toggleTask(t.id)} onLongPress={() => confirmDelete(t.id, t.label)}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, opacity: 0.65 }}>
                <View style={{ width: 18, height: 18, borderRadius: 6, backgroundColor: colors.barAccent, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
                <Text style={{ fontSize: 13, flex: 1, color: colors.sub, textDecorationLine: 'line-through' }}>{t.label}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
