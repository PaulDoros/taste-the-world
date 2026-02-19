import React, { useCallback, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import MapScreenImpl from '@/components/screens/MapScreenImpl';

function MapSkeleton() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

export default function MapScreen() {
  const logActivity = useMutation(api.gamification.logActivity);
  const { token, user } = useAuth();

  const [ready, setReady] = useState(Platform.OS !== 'android'); // iOS mounts immediately

  useFocusEffect(
    useCallback(() => {
      // Delay heavy mount on Android so tab switch stays smooth
      const t = setTimeout(
        () => setReady(true),
        Platform.OS === 'android' ? 60 : 0
      );

      // Log when the screen is focused (not just mounted)
      if (token && user) {
        logActivity({ actionType: 'map_interaction', token }).catch((err) =>
          console.log('Map log failed', err)
        );
      }

      return () => {
        clearTimeout(t);

        // Option A: unmount heavy map when leaving tab (BEST performance)
        if (Platform.OS === 'android') setReady(false);

        // Option B: keep it mounted (keeps map state, but less perf win)
        // (just remove the setReady(false) line)
      };
    }, [token, user, logActivity])
  );

  return ready ? <MapScreenImpl /> : <MapSkeleton />;
}
