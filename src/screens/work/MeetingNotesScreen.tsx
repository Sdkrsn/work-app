import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';

export function MeetingNotesScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { meetings, toggleActionItem, updateMeetingNotes, deleteMeeting } = useData();
  const meeting = meetings.find((m) => m.id === route.params?.id) ?? meetings[0];
  const [notes, setNotes] = useState(meeting?.notes ?? '');

  const confirmDelete = () => {
    if (!meeting) return;
    Alert.alert('Delete meeting?', `"${meeting.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMeeting(meeting.id);
          nav.goBack();
        },
      },
    ]);
  };

  if (!meeting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
        <Text style={{ color: colors.text }}>Meeting not found.</Text>
      </View>
    );
  }

  const done = (meeting.actionItems ?? []).filter((a) => a.done).length;

  return (
    <Screen>
      <ScreenHeader
        title={`${meeting.startTime}`}
        right={
          <TouchableOpacity
            onPress={confirmDelete}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.pillText} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textOnBg, marginTop: 6 }}>{meeting.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <View style={{ paddingVertical: 4, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.hairline }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{meeting.source} · synced</Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.subOnBg }}>
            {meeting.startTime}–{meeting.endTime}
          </Text>
        </View>

        {meeting.aiSummary && (
          <View style={{ marginTop: 18, backgroundColor: colors.deep, borderRadius: 20, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>
                AI summary
              </Text>
            </View>
            <Text style={{ fontSize: 13, lineHeight: 19, marginTop: 10, color: colors.deepText }}>
              {meeting.aiSummary}
            </Text>
          </View>
        )}

        {meeting.actionItems && meeting.actionItems.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>Action items</Text>
              <Text style={{ fontSize: 12, color: colors.subOnBg }}>
                {done} of {meeting.actionItems.length} done
              </Text>
            </View>
            <View style={{ gap: 8, marginTop: 10 }}>
              {meeting.actionItems.map((a) => (
                <TouchableOpacity key={a.id} onPress={() => toggleActionItem(meeting.id, a.id)}>
                  <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        backgroundColor: a.done ? colors.accent : 'transparent',
                        borderWidth: 1.5,
                        borderColor: a.done ? colors.accent : colors.hairline,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {a.done && <Ionicons name="checkmark" size={12} color={colors.accentOn} />}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        flex: 1,
                        color: colors.text,
                        textDecorationLine: a.done ? 'line-through' : 'none',
                      }}
                    >
                      {a.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg, marginTop: 20 }}>My notes</Text>
        <Card style={{ marginTop: 10, minHeight: 120 }}>
          <TextInput
            value={notes}
            onChangeText={(t) => {
              setNotes(t);
              updateMeetingNotes(meeting.id, t);
            }}
            placeholder="Dictate or type your notes…"
            placeholderTextColor={colors.sub}
            multiline
            style={{ fontSize: 13, lineHeight: 19, color: colors.text, minHeight: 90 }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}
