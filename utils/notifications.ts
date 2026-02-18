import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configure standard notification behavior
 * Should be called at app startup
 */
export async function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Request permissions for notifications
 */
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

/**
 * Schedule a notification for a specific date
 */
export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data: Record<string, any> = {}
) {
  // Ensure permission before scheduling
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return null;

  // Don't schedule in the past
  if (triggerDate.getTime() <= Date.now()) return null;

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

/**
 * Schedule flight reminders (24h and 3h before)
 */
export async function scheduleFlightReminders(
  tripId: string,
  destination: string,
  flightNumber: string,
  flightDate: number
) {
  const date = new Date(flightDate);
  const identifiers = [];

  // 24 Hours before
  const reminder24h = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const id24 = await scheduleNotification(
    `Upcoming Trip to ${destination}!`,
    `Your flight ${flightNumber ? `(${flightNumber}) ` : ''}departs in 24 hours. Check your packing list!`,
    reminder24h,
    { tripId, type: 'flight_24h' }
  );
  if (id24) identifiers.push(id24);

  // 3 Hours before
  const reminder3h = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const id3 = await scheduleNotification(
    `Flight Departing Soon`,
    `It's almost time! Head to the airport for your trip to ${destination}.`,
    reminder3h,
    { tripId, type: 'flight_3h' }
  );
  if (id3) identifiers.push(id3);

  return identifiers;
}

/**
 * Cancel specific notifications
 */
export async function cancelNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel ALL scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.tripId) {
          // Navigate to the trip details
          router.push(`/wallet/${data.tripId}` as any);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [router]);
}
