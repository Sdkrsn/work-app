import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProjectStatus } from '../../store/types';
import { todayISO } from '../../utils/date';

const STATUSES: ProjectStatus[] = ['Opportunity', 'Planning', 'On track', 'At risk', 'Cancelled'];

const statusColor = (status: string, colors: any) =>
  status === 'On track'
    ? colors.success
    : status === 'At risk' || status === 'Cancelled'
    ? colors.danger
    : status === 'Opportunity'
    ? colors.deadline
    : colors.accent;

export function ProjectDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { projects, meetings, addTimelineEntry, deleteTimelineEntry } = useData();
  const project = projects.find((p) => p.id === route.params?.id);

  const [addOpen, setAddOpen] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>('On track');
  const [note, setNote] = useState('');

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
        <Text style={{ color: colors.textOnBg }}>Project not found.</Text>
      </View>
    );
  }

  const linkedMeetings = meetings
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const timeline = [...(project.timeline ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  const save = () => {
    addTimelineEntry(project.id, { date: todayISO(), status, note: note.trim() || undefined });
    setAddOpen(false);
    setNote('');
  };

  const confirmDeleteEntry = (id: string) => {
    Alert.alert('Delete timeline entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTimelineEntry(project.id, id) },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={project.name}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => nav.navigate('ProjectForm', { id: project.id })}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="pencil" size={15} color={colors.pillText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="add" size={18} color={colors.accentOn} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.deep, borderRadius: 22, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 12, color: colors.deepSub }}>{project.team}</Text>
            <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: `${statusColor(project.status, colors)}29` }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor(project.status, colors) }}>{project.status}</Text>
            </View>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${project.pct}%`, backgroundColor: colors.barAccent, borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 11, color: colors.deepSub, marginTop: 8 }}>{project.pct}% complete</Text>
        </View>

        {(project.company || project.about || project.source || project.role) && (
          <Card style={{ marginTop: 14 }}>
            {!!project.source && (
              <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.hairline, alignSelf: 'flex-start', marginBottom: project.company || project.about ? 10 : 0 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.sub }}>{project.source}</Text>
              </View>
            )}
            {!!project.company && (
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{project.company}</Text>
            )}
            {!!project.about && (
              <Text style={{ fontSize: 13, color: colors.sub, marginTop: 4, lineHeight: 18 }}>{project.about}</Text>
            )}
            {!!project.role && (
              <Text style={{ fontSize: 12, color: colors.sub, marginTop: project.company || project.about ? 8 : 0 }}>
                Your role: <Text style={{ fontWeight: '600', color: colors.text }}>{project.role}</Text>
              </Text>
            )}
          </Card>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>Timeline</Text>
          <TouchableOpacity onPress={() => setAddOpen(true)}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>+ Add update</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 10, marginTop: 12 }}>
          {timeline.length === 0 && (
            <Text style={{ color: colors.subOnBg, fontSize: 13 }}>No updates logged yet.</Text>
          )}
          {timeline.map((t) => {
            const isMeeting = !!t.meetingId;
            const badgeLabel = isMeeting ? t.meetingType : t.status;
            const badgeColor = isMeeting ? colors.barAccent : statusColor(t.status ?? '', colors);
            return (
              <TouchableOpacity
                key={t.id}
                onPress={isMeeting ? () => nav.navigate('MeetingNotes', { id: t.meetingId }) : undefined}
                onLongPress={() => confirmDeleteEntry(t.id)}
              >
                <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  {isMeeting && <Ionicons name="calendar-outline" size={16} color={colors.sub} />}
                  {!!badgeLabel && (
                    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: `${badgeColor}29`, alignSelf: 'flex-start' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: badgeColor }}>{badgeLabel}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.sub }}>{t.date}</Text>
                    {isMeeting ? (
                      <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>{t.meetingTitle}</Text>
                    ) : (
                      !!t.note && <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>{t.note}</Text>
                    )}
                  </View>
                  {isMeeting && <Ionicons name="chevron-forward" size={16} color={colors.sub} />}
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>Meetings</Text>
          <Text style={{ fontSize: 12, color: colors.subOnBg }}>{linkedMeetings.length} total</Text>
        </View>
        <View style={{ gap: 10, marginTop: 12 }}>
          {linkedMeetings.length === 0 && (
            <Text style={{ color: colors.subOnBg, fontSize: 13 }}>No meetings linked to this project yet.</Text>
          )}
          {linkedMeetings.map((m) => (
            <TouchableOpacity key={m.id} onPress={() => nav.navigate('MeetingNotes', { id: m.id })}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{m.title}</Text>
                  <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2 }}>{m.date} · {m.startTime}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.sub} />
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textOnBg }}>Add timeline update</Text>
              <TouchableOpacity onPress={() => setAddOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textOnBg} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>What happened?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {STATUSES.map((s) => (
                <TouchableOpacity key={s} onPress={() => setStatus(s)}>
                  <View
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: status === s ? colors.accent : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: status === s ? colors.accentOn : colors.sub }}>{s}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Note (optional)</Text>
            <Card style={{ marginBottom: 16, minHeight: 70 }}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Client called it off — budget frozen"
                placeholderTextColor={colors.sub}
                multiline
                style={{ fontSize: 14, color: colors.text, minHeight: 50 }}
              />
            </Card>

            <TouchableOpacity onPress={save} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>Save update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
