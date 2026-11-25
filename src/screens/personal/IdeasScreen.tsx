import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Idea } from '../../store/types';

const FILTERS = ['All', 'Startup', 'Side project', 'Random'] as const;

const tagColors = (tag: Idea['tag'], colors: any) =>
  tag === 'Startup'
    ? { bg: `${colors.nitro}29`, fg: colors.nitro }
    : tag === 'Random'
    ? { bg: `${colors.deadline}29`, fg: colors.deadline }
    : { bg: colors.hairline, fg: colors.sub };

export function IdeasScreen() {
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const { ideas, toggleIdeaStar, deleteIdea } = useData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const shown = ideas.filter((i) => filter === 'All' || i.tag === filter);

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Delete idea?', `"${title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteIdea(id) },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Ideas vault"
        right={
          <TouchableOpacity
            onPress={() => nav.navigate('IdeaForm')}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}>
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: filter === f ? colors.accent : colors.pill,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: filter === f ? colors.accentOn : '#FFFFFF' }}>
                {f === 'All' ? `All · ${ideas.length}` : f}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {shown.length === 0 && (
          <Text style={{ color: colors.subOnBg, fontSize: 13 }}>No ideas yet — tap + to add your first one.</Text>
        )}
        <View style={{ gap: 10 }}>
          {shown.map((idea) => {
            const tc = tagColors(idea.tag, colors);
            return (
              <TouchableOpacity
                key={idea.id}
                onPress={() => nav.navigate('IdeaForm', { id: idea.id })}
                onLongPress={() => confirmDelete(idea.id, idea.title)}
                activeOpacity={0.8}
              >
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', flex: 1, color: colors.text }}>{idea.title}</Text>
                    <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: tc.bg }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: tc.fg }}>{idea.tag}</Text>
                    </View>
                  </View>
                  {!!idea.desc && (
                    <Text style={{ fontSize: 12, color: colors.sub, marginTop: 6, lineHeight: 17 }}>{idea.desc}</Text>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ fontSize: 11, color: colors.sub }}>{idea.createdAt}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => toggleIdeaStar(idea.id)}>
                        <Ionicons
                          name={idea.starred ? 'star' : 'star-outline'}
                          size={14}
                          color={idea.starred ? colors.nitro : colors.sub}
                        />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.sub }}>{idea.stage}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 20, backgroundColor: colors.deep, borderRadius: 20, padding: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.nitro, textTransform: 'uppercase' }}>
            Prompt of the day
          </Text>
          <Text style={{ fontSize: 13, marginTop: 8, lineHeight: 19, color: colors.deepText }}>
            What&apos;s something you wish existed that you&apos;d use every week yourself?
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
