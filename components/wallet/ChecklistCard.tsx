import React, { useState, useEffect } from 'react';
import { Alert, Pressable, Platform, Switch } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Input,
  Heading,
  Separator,
  Label,
  useTheme,
} from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { playSound } from '@/utils/sounds';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface ChecklistCardProps {
  trip: any;
  token: string;
  updateTrip: any;
}

export const ChecklistCard = ({
  trip,
  token,
  updateTrip,
}: ChecklistCardProps) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [optimisticChecklist, setOptimisticChecklist] = useState<any[]>([]);

  // Reminder State
  const [editingReminderIndex, setEditingReminderIndex] = useState<
    number | null
  >(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [repeatReminder, setRepeatReminder] = useState(false);

  useEffect(() => {
    if (trip?.checklist) {
      setOptimisticChecklist(trip.checklist);
    }
  }, [trip?.checklist]);

  const handleToggleChecklist = async (index: number) => {
    if (!trip) return;
    const prevChecklist = [...optimisticChecklist];
    const newChecklist = [...optimisticChecklist];

    const isChecking = !newChecklist[index].checked;
    newChecklist[index] = { ...newChecklist[index], checked: isChecking };

    // Play sound
    if (isChecking) {
      playSound('tap');
    }

    // Cancel notification if checking off
    if (isChecking && newChecklist[index].notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          newChecklist[index].notificationId
        );
        newChecklist[index].notificationId = undefined; // Clear ID
      } catch (e) {
        console.error('Failed to cancel notification', e);
      }
    }

    setOptimisticChecklist(newChecklist);
    try {
      await updateTrip({ id: trip._id, token, checklist: newChecklist });
    } catch (e) {
      setOptimisticChecklist(prevChecklist);
    }
  };

  const handleSetReminder = async (index: number) => {
    // Basic validation
    if (!reminderDate || !reminderTime) {
      Alert.alert('Error', 'Please set date and time.');
      return;
    }

    const [year, month, day] = reminderDate.split('-').map(Number);
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const triggerDate = new Date(year, month - 1, day, hours, minutes);

    console.log('Attempting to schedule reminder:', {
      reminderDate,
      reminderTime,
      triggerDate: triggerDate.toString(),
      now: new Date().toString(),
    });

    if (isNaN(triggerDate.getTime()) || triggerDate.getTime() < Date.now()) {
      Alert.alert('Error', 'Invalid or past date/time.');
      return;
    }

    // Check permissions explicitly
    const { status } = await Notifications.getPermissionsAsync();
    console.log('Current notification permission status:', status);

    let finalStatus = status;
    if (status !== 'granted') {
      console.log('Requesting permissions...');
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
      console.log('New permission status:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to set reminders.'
      );
      return;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Packing Reminder',
          body: `Don't forget: ${optimisticChecklist[index].text}`,
          sound: true,
          color: theme.tint.get(),
          data: {
            tripId: trip._id,
            checklistText: optimisticChecklist[index].text,
            type: 'checklist_reminder',
          },
        },
        trigger: repeatReminder
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 60 * 60,
              repeats: true,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
            },
      });

      // Update DB
      const newChecklist = [...optimisticChecklist];
      newChecklist[index] = {
        ...newChecklist[index],
        notificationId: identifier,
      };
      setOptimisticChecklist(newChecklist);
      await updateTrip({ id: trip._id, token, checklist: newChecklist });

      Alert.alert(
        'Reminder Set',
        repeatReminder
          ? 'Repeats hourly until checked.'
          : 'Notification scheduled.'
      );
      setEditingReminderIndex(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to schedule.');
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim() || !trip) return;
    const newItem = { text: newChecklistItem.trim(), checked: false };
    const prevChecklist = [...optimisticChecklist];
    const newChecklist = [...optimisticChecklist, newItem];
    setOptimisticChecklist(newChecklist);
    setNewChecklistItem('');
    try {
      await updateTrip({ id: trip._id, token, checklist: newChecklist });
    } catch (e) {
      setOptimisticChecklist(prevChecklist);
    }
  };

  const handleDeleteChecklistItem = async (index: number) => {
    playSound('tap');
    if (!trip) return;
    const item = optimisticChecklist[index];

    // Attempt to cancel by ID if present
    if (item.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(item.notificationId);
    }

    // Safety net: Search for and cancel any notifications matching this item's text and trip
    // This handles cases where state might be out of sync or ID was lost
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const targetBody = `Don't forget: ${item.text}`;

      for (const notif of scheduled) {
        const data = notif.content.data;
        const body = notif.content.body;
        const identifier = notif.identifier;

        // Condition 1: Matches Trip ID and specific text (New System)
        const isExactMatch =
          data?.tripId === trip._id && data?.checklistText === item.text;

        // Condition 2: Matches Body Text exactly (Legacy/Orphaned System)
        // We match "Don't forget: [text]"
        const isLegacyMatch =
          !data?.tripId && // Only check legacy if no ID present (safety)
          body === targetBody;

        // Condition 3: User complaining about "every hour", so check repeat interval if possible
        // (Expo doesn't easily expose trigger details in all returns, but we can assume)

        if (
          (isExactMatch || isLegacyMatch) &&
          identifier !== item.notificationId
        ) {
          console.log(`Canceling orphaned notification (${identifier}):`, body);
          await Notifications.cancelScheduledNotificationAsync(identifier);
        }
      }
    } catch (e) {
      console.warn('Error clearing notifications:', e);
    }

    const prevChecklist = [...optimisticChecklist];
    const newChecklist = optimisticChecklist.filter((_, i) => i !== index);
    setOptimisticChecklist(newChecklist);
    try {
      await updateTrip({ id: trip._id, token, checklist: newChecklist });
    } catch (e) {
      setOptimisticChecklist(prevChecklist);
    }
  };

  return (
    <YStack gap="$3">
      <Heading size="$5">Packing Checklist</Heading>
      <GlassCard contentContainerStyle={{ padding: 16 }}>
        <YStack gap="$3">
          {optimisticChecklist.map((item, index) => (
            <YStack key={index}>
              <GlassCard
                variant="thin"
                borderRadius={12}
                contentContainerStyle={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                }}
                style={{ marginBottom: 8 }}
                backgroundColor={
                  item.checked ? theme.background.get() : undefined
                }
                backgroundOpacity={item.checked ? 0.3 : 0.1}
              >
                <XStack alignItems="center" gap="$3">
                  <Pressable
                    onPress={() => handleToggleChecklist(index)}
                    hitSlop={10}
                    android_ripple={{
                      color:
                        Platform.OS === 'android'
                          ? `${theme.tint.get()}30`
                          : undefined,
                      borderless: true,
                      radius: 20,
                    }}
                  >
                    <FontAwesome5
                      name={item.checked ? 'check-circle' : 'circle'}
                      size={20}
                      color={
                        item.checked ? theme.tint.get() : theme.color.get()
                      }
                      style={{ opacity: item.checked ? 1 : 0.5 }}
                    />
                  </Pressable>
                  <Text
                    flex={1}
                    fontSize="$3"
                    fontWeight={item.checked ? '400' : '500'}
                    textDecorationLine={item.checked ? 'line-through' : 'none'}
                    opacity={item.checked ? 0.5 : 1}
                    color="$color"
                  >
                    {item.text}
                  </Text>
                  <XStack gap="$1">
                    <GlassButton
                      size="small"
                      icon={item.notificationId ? 'bell' : 'bell'}
                      variant="default"
                      backgroundOpacity={0}
                      onPress={() => {
                        if (editingReminderIndex === index) {
                          setEditingReminderIndex(null);
                        } else {
                          // Pre-fill with now + 1h
                          const now = new Date(Date.now() + 3600000);
                          setReminderDate(now.toISOString().split('T')[0]);
                          setReminderTime(
                            `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`
                          );
                          setEditingReminderIndex(index);
                        }
                      }}
                      textColor={
                        item.notificationId ? theme.tint.get() : '$color11'
                      }
                    />
                    <GlassButton
                      size="small"
                      icon="times"
                      variant="default"
                      backgroundOpacity={0}
                      onPress={() => handleDeleteChecklistItem(index)}
                      textColor="$red10"
                    />
                  </XStack>
                </XStack>

                {/* Reminder Config Panel */}
                {editingReminderIndex === index && (
                  <YStack marginTop="$3">
                    <Separator borderColor="$borderColor" marginBottom="$3" />
                    <YStack gap="$2">
                      <Heading size="$3" fontWeight="bold">
                        Set Reminder
                      </Heading>
                      <XStack gap="$2">
                        <GlassCard
                          variant="thin"
                          style={{ flex: 2 }}
                          borderRadius={8}
                          contentContainerStyle={{ paddingHorizontal: 8 }}
                        >
                          <Input
                            unstyled
                            height={36}
                            placeholder="YYYY-MM-DD"
                            value={reminderDate}
                            onChangeText={setReminderDate}
                            backgroundColor="transparent"
                            borderWidth={0}
                          />
                        </GlassCard>
                        <GlassCard
                          variant="thin"
                          style={{ flex: 1 }}
                          borderRadius={8}
                          contentContainerStyle={{ paddingHorizontal: 8 }}
                        >
                          <Input
                            unstyled
                            height={36}
                            placeholder="HH:MM"
                            value={reminderTime}
                            onChangeText={setReminderTime}
                            backgroundColor="transparent"
                            borderWidth={0}
                          />
                        </GlassCard>
                      </XStack>
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        marginTop="$2"
                      >
                        <Label fontSize="$3">Repeat Hourly</Label>
                        <Switch
                          value={repeatReminder}
                          onValueChange={setRepeatReminder}
                          trackColor={{
                            false: colors.border,
                            true: colors.tint,
                          }}
                          thumbColor="white"
                        />
                      </XStack>
                      <GlassButton
                        style={{ marginTop: 16 }}
                        size="small"
                        label="Save Reminder"
                        onPress={() => handleSetReminder(index)}
                        variant="active"
                        backgroundColor={theme.tint.get()}
                      />
                    </YStack>
                  </YStack>
                )}
              </GlassCard>
            </YStack>
          ))}
          <Separator marginVertical="$2" />
          <XStack gap="$2">
            <GlassCard
              variant="thin"
              style={{ flex: 1 }}
              borderRadius={12}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <Input
                unstyled
                height={44}
                placeholder="Add item..."
                value={newChecklistItem}
                onChangeText={setNewChecklistItem}
                backgroundColor="transparent"
                borderWidth={0}
              />
            </GlassCard>
            <GlassButton
              size="medium"
              icon="plus"
              onPress={handleAddChecklistItem}
              variant="active"
            />
          </XStack>
        </YStack>
      </GlassCard>
    </YStack>
  );
};
