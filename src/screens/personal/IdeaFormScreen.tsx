import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Idea } from '../../store/types';

const TAGS: Idea['tag'][] = ['Startup', 'Side project', 'Random'];
const STAGES: Idea['stage'][] = ['Idea', 'Sketching', 'Researching', 'Building'];

export function IdeaFormScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { ideas, addIdea, updateIdea, deleteIdea } = useData();
  const editing = ideas.find((i) => i.id === route.params?.id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [desc, setDesc] = useState(editing?.desc ?? '');
  const [tag, setTag] = useState<Idea['tag']>(editing?.tag ?? 'Random');
  const [stage, setStage] = useState<Idea['stage']>(editing?.stage ?? 'Idea');
  const [starred, setStarred] = useState(editing?.starred ?? false);

  const save = () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Your idea needs at least a title.');
      return;
    }
    if (editing) {
      updateIdea(editing.id, { title: title.trim(), desc: desc.trim(), tag, stage, starred });
    } else {
      addIdea({ title: title.trim(), desc: desc.trim(), tag, stage, starred });
    }
    nav.goBack();
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Delete idea?', `"${editing.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteIdea(editing.id);
          nav.goBack();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={editing ? 'Edit idea' : 'New idea'}
        right={
          editing ? (
            <TouchableOpacity
              onPress={confirmDelete}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.pillText} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Title</Text>
        <Card style={{ marginBottom: 16 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Farmers-market finder"
            placeholderTextColor={colors.sub}
            style={{ fontSize: 14, color: colors.text }}
          />
        </Card>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Description</Text>
        <Card style={{ marginBottom: 16, minHeight: 90 }}>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder="What's the idea, in a line or two?"
            placeholderTextColor={colors.sub}
            multiline
            style={{ fontSize: 14, color: colors.text, minHeight: 70 }}
          />
        </Card>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Category</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {TAGS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTag(t)}>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: tag === t ? colors.accent : colors.surface,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: tag === t ? colors.accentOn : colors.sub }}>{t}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Stage</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {STAGES.map((s) => (
            <TouchableOpacity key={s} onPress={() => setStage(s)}>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: stage === s ? colors.accent : colors.surface,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: stage === s ? colors.accentOn : colors.sub }}>{s}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => setStarred((s) => !s)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Ionicons name={starred ? 'star' : 'star-outline'} size={18} color={starred ? colors.nitro : colors.sub} />
            <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>Starred idea</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={save} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>{editing ? 'Save changes' : 'Add idea'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
