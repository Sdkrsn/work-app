import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { switchMode } from '../../navigation/navigationRef';
import { lastWorkingDayOfMonth } from '../../utils/payday';
import { todayISO } from '../../utils/date';

function formatDateLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function daysUntilPayday() {
  const now = new Date();
  let next = lastWorkingDayOfMonth(now.getFullYear(), now.getMonth());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next = lastWorkingDayOfMonth(now.getFullYear(), now.getMonth() + 1);
  }
  const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { days: diff, label: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
}

export function HomeScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { meetings, tasks, projects } = useData();

  const today = todayISO();
  const todaysMeetings = meetings.filter((m) => m.date === today).slice(0, 3);
  const todaysTasks = tasks.filter((t) => t.date === today);
  const doneCount = todaysTasks.filter((t) => t.done).length;
  const payday = daysUntilPayday();
  const myProject = projects.find((p) => p.mine);

  return (
    <Screen>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View>
          <Text style={{ fontSize: 13, color: colors.subOnBg, fontWeight: '500' }}>{formatDateLabel()}</Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.textOnBg, marginTop: 4 }}>Hey, Sid</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => nav.navigate('Settings')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.pill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="settings-outline" size={18} color={colors.pillText} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleScheme}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.pill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={scheme === 'dark' ? 'moon' : 'sunny'} size={18} color={colors.pillText} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchMode('Personal')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.accentOn, fontWeight: '700' }}>S</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.sub, textTransform: 'uppercase' }}>
              Meetings
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 6 }}>
              {todaysMeetings.length}
            </Text>
            <Text style={{ fontSize: 11, color: colors.sub }}>today</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.sub, textTransform: 'uppercase' }}>
              Tasks
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 6 }}>
              {doneCount}
              <Text style={{ fontSize: 14, color: colors.sub, fontWeight: '500' }}>/{todaysTasks.length}</Text>
            </Text>
            <Text style={{ fontSize: 11, color: colors.sub }}>done today</Text>
          </Card>
          <TouchableOpacity
            onPress={() => nav.navigate('Salary')}
            style={{
              flex: 1,
              backgroundColor: colors.accent,
              borderRadius: 18,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accentOn, opacity: 0.85 }}>PAYDAY</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.accentOn, marginTop: 6 }}>
              {payday.days}d
            </Text>
            <Text style={{ fontSize: 11, color: colors.accentOn, opacity: 0.85 }}>{payday.label}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => nav.navigate('Calendar')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <Ionicons name="calendar-outline" size={16} color={colors.text} />
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600', flex: 1 }}>Calendar & holidays</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.sub} />
          </Card>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg }}>Today&apos;s meetings</Text>
          <TouchableOpacity onPress={() => nav.navigate('Meetings')}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 10, marginTop: 12 }}>
          {todaysMeetings.length === 0 && (
            <Text style={{ color: colors.sub, fontSize: 13 }}>No meetings today.</Text>
          )}
          {todaysMeetings.map((m) => (
            <TouchableOpacity key={m.id} onPress={() => nav.navigate('MeetingNotes', { id: m.id })}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 54, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                    {m.startTime.split(' ')[0]}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.sub }}>{m.startTime.split(' ')[1]}</Text>
                </View>
                <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.hairline }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.sub, marginTop: 2 }}>
                    {m.source} · {m.startTime}–{m.endTime}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {myProject && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg }}>Your project</Text>
              <TouchableOpacity onPress={() => nav.navigate('Projects')}>
                <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 12, backgroundColor: colors.deep, borderRadius: 20, padding: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 11, color: colors.deepSub, fontWeight: '700', textTransform: 'uppercase' }}>
                    {myProject.name}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.deepText, marginTop: 4 }}>
                    Your role: {myProject.role}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.barAccent }}>{myProject.pct}%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 3, marginTop: 14, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${myProject.pct}%`, backgroundColor: colors.barAccent, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, color: colors.deepSub, marginTop: 10 }}>Due {myProject.dueDate}</Text>
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg }}>Daily update</Text>
          <TouchableOpacity onPress={() => nav.navigate('DailyLog')}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>Open</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => nav.navigate('DailyLog')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, borderStyle: 'dashed' as any }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </View>
            <Text style={{ fontSize: 13, color: colors.sub }}>Log what you did today</Text>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
