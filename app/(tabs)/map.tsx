import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useCountries } from '@/hooks/useCountries';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { isPremiumCountry } from '@/constants/Config';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { countries, loading } = useCountries();
  const { visitedCountries, bucketList, isGuest } = useUserStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const getMarkerColor = (cca2: string, name: string) => {
    if (visitedCountries.includes(cca2)) return '#10b981'; // Green (Visited)
    if (bucketList.includes(cca2)) return '#3b82f6'; // Blue (Bucket List)
    if (isGuest && !isPremiumCountry(name)) return '#ef4444'; // Red (Free/Default)
    if (isGuest && isPremiumCountry(name)) return '#9ca3af'; // Gray (Locked)
    return '#ef4444'; // Red (Default)
  };

  if (loading && countries.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ marginTop: 16, color: colors.text }}>
          Loading World Map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 80,
          longitudeDelta: 80,
        }}
        showsUserLocation={true}
        showsCompass={false}
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
      >
        {countries.map((country) => {
          // Skip countries without lat/lng
          if (!country.latlng || country.latlng.length < 2) return null;

          const isLocked = isGuest && isPremiumCountry(country.name.common);
          const color = getMarkerColor(country.cca2, country.name.common);

          return (
            <Marker
              key={country.cca2}
              coordinate={{
                latitude: country.latlng[0],
                longitude: country.latlng[1],
              }}
              pinColor={color}
              opacity={isLocked ? 0.6 : 1}
            >
              <Callout
                tooltip
                onPress={() => {
                  if (isLocked) {
                    alert(
                      '🔒 Upgrade to Premium to explore ' + country.name.common
                    );
                  } else {
                    router.push(`/country/${country.cca2}` as any);
                  }
                }}
              >
                <View
                  style={[styles.callout, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.calloutTitle, { color: colors.text }]}>
                    {country.flag} {country.name.common}
                  </Text>
                  <Text
                    style={[styles.calloutSubtitle, { color: colors.tint }]}
                  >
                    {isLocked ? 'Locked 🔒' : 'Tap to Explore →'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Legend Overlay */}
      <View
        style={[
          styles.legend,
          { top: insets.top + 16, backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.legendTitle, { color: colors.text }]}>
          Travel Map
        </Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Visited
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Bucket List
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Explore
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  callout: {
    padding: 12,
    borderRadius: 12,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    left: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#3d3d3d',
      },
    ],
  },
];
