import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProjectSource } from '../../store/types';
import { todayISO } from '../../utils/date';

const SOURCES: ProjectSource[] = ['Mindteck', 'Self-sourced', 'Other'];

export function ProjectFormScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { projects, addProject, updateProject, deleteProject } = useData();
  const editing = projects.find((p) => p.id === route.params?.id);

  const [name, setName] = useState(editing?.name ?? '');
  const [company, setCompany] = useState(editing?.company ?? '');
  const [about, setAbout] = useState(editing?.about ?? '');
  const [source, setSource] = useState<ProjectSource>(editing?.source ?? 'Mindteck');
  const [role, setRole] = useState(editing?.role ?? '');

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Add a title', 'What are we calling this project/opportunity?');
      return;
    }
    if (editing) {
      updateProject(editing.id, {
        name: name.trim(),
        company: company.trim() || undefined,
        about: about.trim() || undefined,
        source,
        role: role.trim() || undefined,
      });
      nav.goBack();
    } else {
      const id = addProject({
        name: name.trim(),
        company: company.trim() || undefined,
        about: about.trim() || undefined,
        source,
        role: role.trim() || undefined,
        team: company.trim() || 'Unassigned',
        status: 'Opportunity',
        pct: 0,
        mine: true,
        timeline: [{ id: 'init', date: todayISO(), status: 'Opportunity' }],
      });
      nav.replace('ProjectDetail', { id });
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Delete project?', `"${editing.name}" and its whole timeline will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProject(editing.id);
          nav.navigate('ProjectsMain');
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title={editing ? 'Edit project' : 'New project'}
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
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>
          Title — what we&apos;re doing
        </Text>
        <Card style={{ marginBottom: 16 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Checkout automation pitch"
            placeholderTextColor={colors.sub}
            style={{ fontSize: 14, color: colors.text }}
          />
        </Card>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 8 }}>Comes through</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {SOURCES.map((s) => (
            <TouchableOpacity key={s} onPress={() => setSource(s)}>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: source === s ? colors.accent : colors.surface,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: source === s ? colors.accentOn : colors.sub }}>{s}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Client / company name</Text>
        <Card style={{ marginBottom: 16 }}>
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder="Fill in anytime"
            placeholderTextColor={colors.sub}
            style={{ fontSize: 14, color: colors.text }}
          />
        </Card>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>What their company is about</Text>
        <Card style={{ marginBottom: 16, minHeight: 80 }}>
          <TextInput
            value={about}
            onChangeText={setAbout}
            placeholder="Fill in anytime — what do they do?"
            placeholderTextColor={colors.sub}
            multiline
            style={{ fontSize: 14, color: colors.text, minHeight: 60 }}
          />
        </Card>

        <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Your role (optional)</Text>
        <Card style={{ marginBottom: 20 }}>
          <TextInput
            value={role}
            onChangeText={setRole}
            placeholder="e.g. SPOC"
            placeholderTextColor={colors.sub}
            style={{ fontSize: 14, color: colors.text }}
          />
        </Card>

        <TouchableOpacity onPress={save} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>{editing ? 'Save changes' : 'Add project'}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
