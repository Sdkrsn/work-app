import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import { useTheme } from '../theme/ThemeContext';
import { useData } from '../store/DataContext';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { parseOpportunityCsv } from '../utils/importOpportunityCsv';

function Row({
  icon,
  label,
  sub,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            backgroundColor: danger ? `${colors.danger}22` : colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: danger ? colors.danger : colors.text }}>{label}</Text>
          {!!sub && <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2 }}>{sub}</Text>}
        </View>
        {onPress && <Ionicons name="chevron-forward" size={16} color={colors.sub} />}
      </Card>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const { colors, scheme, toggleScheme } = useTheme();
  const { resetAll, loadSampleData, addProject } = useData();
  const [importing, setImporting] = useState(false);

  const confirmReset = () => {
    Alert.alert(
      'Reset all data?',
      'This clears every meeting, task, project, idea and journal entry stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAll },
      ]
    );
  };

  const confirmSample = () => {
    Alert.alert(
      'Load sample data?',
      'This adds demo meetings, tasks, projects and ideas so you can try the app out.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Load sample data', onPress: loadSampleData },
      ]
    );
  };

  const importCsv = async () => {
    try {
      const picked = await File.pickFileAsync({ mimeTypes: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain', '*/*'] });
      if (picked.canceled) return;

      setImporting(true);
      const text = await picked.result.text();
      const { projects, skippedRows } = parseOpportunityCsv(text);

      if (projects.length === 0) {
        Alert.alert('Nothing to import', 'No rows with an opportunity name were found in that file.');
        return;
      }

      Alert.alert(
        `Import ${projects.length} opportunit${projects.length === 1 ? 'y' : 'ies'}?`,
        `This adds them as new projects, each with its update history pulled from the sheet's dated notes.${
          skippedRows ? ` ${skippedRows} blank row${skippedRows === 1 ? '' : 's'} were skipped.` : ''
        }`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: () => {
              projects.forEach((p) => addProject(p));
              Alert.alert('Imported', `Added ${projects.length} project${projects.length === 1 ? '' : 's'} from the tracker.`);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Import failed', err?.message ?? 'Could not read that file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subOnBg, textTransform: 'uppercase', marginBottom: 10 }}>
          Appearance
        </Text>
        <View style={{ gap: 8 }}>
          <Row
            icon={scheme === 'dark' ? 'moon' : 'sunny'}
            label={scheme === 'dark' ? 'Dark mode' : 'Light mode'}
            sub="Tap to switch"
            onPress={toggleScheme}
          />
        </View>

        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subOnBg, textTransform: 'uppercase', marginTop: 24, marginBottom: 10 }}>
          Data
        </Text>
        <View style={{ gap: 8 }}>
          <Row
            icon="document-attach-outline"
            label={importing ? 'Importing…' : 'Import opportunity tracker (CSV)'}
            sub="Bring in projects and their update history from a tracker spreadsheet"
            onPress={importing ? undefined : importCsv}
          />
          {importing && <ActivityIndicator color={colors.accent} />}
          <Row icon="flask-outline" label="Load sample data" sub="Fill the app with demo content to try it out" onPress={confirmSample} />
          <Row icon="trash-outline" label="Reset all data" sub="Permanently clear everything stored on this device" onPress={confirmReset} danger />
        </View>

        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subOnBg, textTransform: 'uppercase', marginTop: 24, marginBottom: 10 }}>
          About
        </Text>
        <Card>
          <Text style={{ fontSize: 13, color: colors.sub, lineHeight: 19 }}>
            All your data is stored only on this device — nothing is sent anywhere. A fresh install always starts empty;
            use &quot;Load sample data&quot; above anytime you want to try the app with demo content.{'\n\n'}
            Tip: press and hold any meeting, task, idea, journal entry or payslip to delete it.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
