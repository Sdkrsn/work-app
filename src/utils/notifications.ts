import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let permissionChecked = false;

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!permissionChecked) {
    permissionChecked = true;
    const requested = await Notifications.requestPermissionsAsync();
    return !!requested.granted;
  }
  return false;
}

/** Schedules a local reminder `minutesBefore` before `meetingStart`. Returns the notification id, or null if it couldn't be scheduled (permission denied, or the time is already in the past). */
export async function scheduleMeetingReminder(
  title: string,
  meetingStart: Date,
  minutesBefore = 10
): Promise<string | null> {
  try {
    const granted = await ensurePermission();
    if (!granted) return null;

    const fireAt = new Date(meetingStart.getTime() - minutesBefore * 60 * 1000);
    if (fireAt.getTime() <= Date.now()) return null;

    if (Platform.OS === 'android') {
      const exact = await Notifications.getExactAlarmPermissionsAsync?.();
      if (exact && !exact.granted) {
        await Notifications.requestExactAlarmPermissionsAsync?.();
      }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming meeting',
        body: `${title} starts in ${minutesBefore} minutes`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelReminder(id?: string) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or invalid — nothing to do
  }
}
