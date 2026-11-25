import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';

const statusColor = (status: string, colors: any) =>
  status === 'On track'
    ? colors.success
    : status === 'At risk' || status === 'Cancelled'
    ? colors.danger
    : status === 'Opportunity'
    ? colors.deadline
    : colors.accent;

export function ProjectsScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const { projects } = useData();
  const mine = projects.find((p) => p.mine);

  return (
    <Screen>
      <ScreenHeader
        title="Projects"
        right={
          <TouchableOpacity
            onPress={() => nav.navigate('ProjectForm')}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {mine && (
          <>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subOnBg, textTransform: 'uppercase', marginBottom: 10 }}>
              My project
            </Text>
            <TouchableOpacity onPress={() => nav.navigate('ProjectDetail', { id: mine.id })}>
            <View style={{ backgroundColor: colors.deep, borderRadius: 22, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.deepText }}>{mine.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.deepSub, marginTop: 4 }}>{mine.team}</Text>
                </View>
                <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(52,199,89,0.18)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#5FD37E' }}>{mine.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <View style={{ width: 30, height: 30, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="star" size={14} color={colors.deepText} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: colors.deepSub }}>Your role</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.deepText }}>{mine.role}</Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${mine.pct}%`, backgroundColor: colors.barAccent, borderRadius: 3 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: colors.deepSub }}>{mine.pct}% complete</Text>
                <Text style={{ fontSize: 11, color: colors.deepSub }}>Due {mine.dueDate}</Text>
              </View>
            </View>
            </TouchableOpacity>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>All active projects</Text>
          <Text style={{ fontSize: 12, color: colors.subOnBg }}>{projects.length} total</Text>
        </View>

        <View style={{ gap: 10 }}>
          {projects.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => nav.navigate('ProjectDetail', { id: p.id })}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.sub, marginTop: 3 }}>{p.team}</Text>
                </View>
                <View
                  style={{
                    paddingVertical: 3,
                    paddingHorizontal: 9,
                    borderRadius: 999,
                    backgroundColor: `${statusColor(p.status, colors)}29`,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor(p.status, colors) }}>{p.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1, height: 5, backgroundColor: colors.hairline, borderRadius: 3, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${p.pct}%`,
                      backgroundColor: statusColor(p.status, colors),
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.sub }}>{p.pct}%</Text>
              </View>
              {p.mine && (
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, marginTop: 8 }}>
                  ● YOU&apos;RE ON THIS TEAM
                </Text>
              )}
            </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
