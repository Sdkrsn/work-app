import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useData } from '../../store/DataContext';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PayslipEntry } from '../../store/types';
import { lastWorkingDayOfMonth } from '../../utils/payday';

function paydayInfo() {
  const now = new Date();
  let next = lastWorkingDayOfMonth(now.getFullYear(), now.getMonth());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next = lastWorkingDayOfMonth(now.getFullYear(), now.getMonth() + 1);
  }
  const prev = lastWorkingDayOfMonth(next.getFullYear(), next.getMonth() - 1);
  const totalSpan = next.getTime() - prev.getTime();
  const elapsed = now.getTime() - prev.getTime();
  const pct = Math.max(4, Math.min(100, Math.round((elapsed / totalSpan) * 100)));
  const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    days,
    pct,
    label: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    prevLabel: prev.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    nextLabel: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function SalaryScreen() {
  const { colors } = useTheme();
  const { salary, addPayslip, deletePayslip } = useData();
  const info = paydayInfo();
  const avg = salary.history.reduce((sum, h) => sum + h.amount, 0) / Math.max(1, salary.history.length);

  const [addOpen, setAddOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<PayslipEntry | null>(null);
  const [month, setMonth] = useState(currentMonthLabel());
  const [amount, setAmount] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setMonth(currentMonthLabel());
    setAmount('');
    setImageUri(undefined);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!req.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.getCameraPermissionsAsync();
    if (!perm.granted) {
      const req = await ImagePicker.requestCameraPermissionsAsync();
      if (!req.granted) return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const save = () => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!month.trim() || isNaN(parsed)) {
      Alert.alert('Missing info', 'Add a month label and a valid amount.');
      return;
    }
    addPayslip({ month: month.trim(), amount: parsed, payslipUri: imageUri });
    setAddOpen(false);
    resetForm();
  };

  const confirmDelete = (entry: PayslipEntry) => {
    Alert.alert('Delete this payslip?', `"${entry.month}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePayslip(entry.id);
          setViewEntry(null);
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Payday"
        right={
          <TouchableOpacity
            onPress={() => setAddOpen(true)}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={18} color={colors.accentOn} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.deep, borderRadius: 24, padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.deepSub, fontWeight: '600', textTransform: 'uppercase' }}>
            Next payday
          </Text>
          <Text style={{ fontSize: 56, fontWeight: '700', color: colors.deepText, marginTop: 8 }}>{info.days}</Text>
          <Text style={{ fontSize: 13, color: colors.deepSub, marginTop: -4 }}>days to go · {info.label}</Text>
          <View style={{ height: 8, width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 18, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${info.pct}%`, backgroundColor: colors.barAccent, borderRadius: 4 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: colors.deepSub }}>{info.prevLabel}</Text>
            <Text style={{ fontSize: 11, color: colors.deepSub }}>{info.nextLabel}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: colors.sub, fontWeight: '600', textTransform: 'uppercase' }}>
              Last credited
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 6 }}>
              {salary.currency}
              {salary.history[0]?.amount.toLocaleString('en-IN') ?? '—'}
            </Text>
            <Text style={{ fontSize: 11, color: colors.sub, marginTop: 2 }}>{salary.history[0]?.month ?? 'No payslips yet'}</Text>
          </Card>
          <View style={{ flex: 1, backgroundColor: colors.accent, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontSize: 11, color: colors.accentOn, fontWeight: '600', opacity: 0.85 }}>AVG / MONTH</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.accentOn, marginTop: 6 }}>
              {salary.currency}
              {salary.history.length ? Math.round(avg).toLocaleString('en-IN') : '—'}
            </Text>
            <Text style={{ fontSize: 11, color: colors.accentOn, opacity: 0.85, marginTop: 2 }}>
              Last {salary.history.length} months
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textOnBg }}>Payment history</Text>
          <TouchableOpacity onPress={() => setAddOpen(true)}>
            <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '600' }}>+ Add payslip</Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 8, marginTop: 10 }}>
          {salary.history.length === 0 && (
            <Text style={{ color: colors.subOnBg, fontSize: 13 }}>No payslips yet — tap &quot;Add payslip&quot; to log your first one.</Text>
          )}
          {salary.history.map((h) => (
            <TouchableOpacity key={h.id} onPress={() => setViewEntry(h)}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  {h.payslipUri ? (
                    <Image source={{ uri: h.payslipUri }} style={{ width: 34, height: 34, borderRadius: 11 }} />
                  ) : (
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        backgroundColor: colors.hairline,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="cash-outline" size={15} color={colors.text} />
                    </View>
                  )}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{h.month}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                  {salary.currency}
                  {h.amount.toLocaleString('en-IN')}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add payslip modal */}
      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textOnBg }}>Add payslip</Text>
              <TouchableOpacity onPress={() => { setAddOpen(false); resetForm(); }}>
                <Ionicons name="close" size={22} color={colors.textOnBg} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Month</Text>
            <Card style={{ marginBottom: 14 }}>
              <TextInput value={month} onChangeText={setMonth} style={{ fontSize: 14, color: colors.text }} placeholder="e.g. December 2026" placeholderTextColor={colors.sub} />
            </Card>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Amount credited</Text>
            <Card style={{ marginBottom: 14 }}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={{ fontSize: 14, color: colors.text }}
                placeholder="145000"
                placeholderTextColor={colors.sub}
              />
            </Card>

            <Text style={{ fontSize: 12, color: colors.subOnBg, fontWeight: '600', marginBottom: 6 }}>Payslip photo (optional)</Text>
            {imageUri ? (
              <View style={{ marginBottom: 14 }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 14 }} resizeMode="cover" />
                <TouchableOpacity onPress={() => setImageUri(undefined)} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.danger, fontWeight: '600' }}>Remove photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <TouchableOpacity onPress={takePhoto} style={{ flex: 1 }}>
                  <Card style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <Ionicons name="camera-outline" size={20} color={colors.text} />
                    <Text style={{ fontSize: 12, color: colors.text, marginTop: 6 }}>Camera</Text>
                  </Card>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickFromLibrary} style={{ flex: 1 }}>
                  <Card style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <Ionicons name="images-outline" size={20} color={colors.text} />
                    <Text style={{ fontSize: 12, color: colors.text, marginTop: 6 }}>Gallery</Text>
                  </Card>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={save} style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.accentOn, fontWeight: '700', fontSize: 14 }}>Save payslip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View payslip modal */}
      <Modal visible={!!viewEntry} animationType="fade" transparent onRequestClose={() => setViewEntry(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          {viewEntry && (
            <View style={{ backgroundColor: colors.bg, borderRadius: 20, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnBg }}>{viewEntry.month}</Text>
                <TouchableOpacity onPress={() => setViewEntry(null)}>
                  <Ionicons name="close" size={22} color={colors.textOnBg} />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textOnBg, marginTop: 8 }}>
                {salary.currency}
                {viewEntry.amount.toLocaleString('en-IN')}
              </Text>
              {viewEntry.payslipUri ? (
                <Image source={{ uri: viewEntry.payslipUri }} style={{ width: '100%', height: 320, borderRadius: 14, marginTop: 16 }} resizeMode="contain" />
              ) : (
                <Text style={{ color: colors.subOnBg, marginTop: 16, fontSize: 13 }}>No photo attached to this entry.</Text>
              )}
              <TouchableOpacity onPress={() => confirmDelete(viewEntry)} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 13 }}>Delete this payslip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </Screen>
  );
}
