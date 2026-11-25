import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { switchMode } from '../../navigation/navigationRef';
import { todayISO } from '../../utils/date';

export function PersonalHomeScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { ideas, journal, addJournalEntry, deleteJournalEntry } = useData();
  const [draft, setDraft] = useState('');

  const confirmDeleteEntry = (id: string) => {
    Alert.alert('Delete entry?', 'This journal entry will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  };

  const topIdea = ideas[0];
  const todaysEntry = journal.find((j) => j.date === todayISO());

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 13, color: colors.subOnBg, fontWeight: '500' }}>Personal space</Text>
          <Text style={{ fontSize: 27, fontWeight: '700', color: colors.textOnBg, marginTop: 4 }}>Just you, Sid</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={toggleScheme}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={scheme === 'dark' ? 'moon' : 'sunny'} size={18} color={colors.pillText} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchMode('Work')}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="briefcase-outline" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => nav.navigate('Ideas')}>
          <View style={{ backgroundColor: colors.deep, borderRadius: 22, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="bulb-outline" size={20} color={colors.nitro} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.deepText }}>Ideas vault</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.deepSub }}>{ideas.length} ideas →</Text>
            </View>
            {topIdea && (
              <Text style={{ fontSize: 12, color: colors.deepSub, marginTop: 10, lineHeight: 17 }}>
                &quot;{topIdea.title}&quot; — added recently
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg }}>Quick journal</Text>
          <Card style={{ marginTop: 12, borderStyle: 'dashed' as any }}>
            <Text style={{ fontSize: 12, color: colors.sub, fontWeight: '600' }}>One good thing today?</Text>
            <TextInput
              value={draft || todaysEntry?.note || ''}
              onChangeText={setDraft}
              onSubmitEditing={() => {
                if (draft.trim()) {
                  addJournalEntry(todayISO(), draft.trim());
                  setDraft('');
                }
              }}
              placeholder="Write a line…"
              placeholderTextColor={colors.sub}
              style={{ fontSize: 13, marginTop: 8, color: colors.text }}
            />
          </Card>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg, marginTop: 24 }}>Recent entries</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {journal.length === 0 && <Text style={{ color: colors.sub, fontSize: 13 }}>Nothing yet — write your first line above.</Text>}
          {journal.slice(0, 5).map((j) => (
            <TouchableOpacity key={j.id} onLongPress={() => confirmDeleteEntry(j.id)}>
              <Card>
                <Text style={{ fontSize: 11, color: colors.sub }}>{j.date}</Text>
                <Text style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>{j.note}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
