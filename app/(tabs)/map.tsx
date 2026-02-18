import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import MapScreenImpl from '@/components/screens/MapScreenImpl';

export default function MapScreen() {
  const logActivity = useMutation(api.gamification.logActivity);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      // Log "map_interaction" to trigger "World Traveler" badge
      logActivity({ actionType: 'map_interaction', token }).catch((err) =>
        console.log('Map log failed', err)
      );
    }
  }, [token, user]);

  return <MapScreenImpl />;
}
