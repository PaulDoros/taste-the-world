import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  Geojson,
} from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useCountries } from '@/hooks/useCountries';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { isPremiumCountry } from '@/constants/Config';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ErrorState } from '@/components/shared/ErrorState';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';

// Import local GeoJSON asset
const geoJsonData = require('../../assets/countries.json');

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { showError } = useAlertDialog();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const { countries, loading } = useCountries();
  const { visitedCountries, bucketList, isGuest, tier } = useUserStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  // Consider user a guest if local state says so OR tier is 'guest' (persisted)
  const isEffectiveGuest = isGuest || tier === 'guest';

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
    if (visitedCountries.includes(cca2)) return '#f59e0b'; // Gold (Visited)
    if (bucketList.includes(cca2)) return '#3b82f6'; // Blue (Bucket List)

    // Logic for available/locked
    if (!isEffectiveGuest) return '#10b981'; // Premium users see everything available (Green)
    if (!isPremiumCountry(name)) return '#10b981'; // Guest see free as Green

    return '#9ca3af'; // Guest see premium as Gray (Locked)
  };

  const openOfflineMaps = () => {
    const url = Platform.select({
      ios: 'comgooglemaps://',
      android: 'https://www.google.com/maps',
      default: 'https://www.google.com/maps',
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL('https://www.google.com/maps');
      }
    });
  };

  // Processing GeoJSON to create colored layers
  const { visitedGeo, bucketGeo, availableGeo, lockedGeo } = useMemo(() => {
    const visited: any = { type: 'FeatureCollection', features: [] };
    const bucket: any = { type: 'FeatureCollection', features: [] };
    const available: any = { type: 'FeatureCollection', features: [] };
    const locked: any = { type: 'FeatureCollection', features: [] };

    // Safely access features from the imported JSON
    const features = (geoJsonData as any)?.features || [];

    features.forEach((feature: any) => {
      const cca2 = feature?.properties?.ISO_A2;
      const name = feature?.properties?.NAME;

      if (!cca2) return;

      if (visitedCountries.includes(cca2)) {
        visited.features.push(feature);
      } else if (bucketList.includes(cca2)) {
        bucket.features.push(feature);
      } else {
        if (isEffectiveGuest) {
          if (isPremiumCountry(name)) {
            locked.features.push(feature);
          } else {
            available.features.push(feature);
          }
        } else {
          // Premium user - everything else is available
          available.features.push(feature);
        }
      }
    });

    return {
      visitedGeo: visited,
      bucketGeo: bucket,
      availableGeo: available,
      lockedGeo: locked,
    };
  }, [visitedCountries, bucketList, isGuest, tier]);

  const onRegionChange = (region: any) => {
    // console.log(region);
  };

  if (loading && countries.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.bg?.val || '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ marginTop: 16, color: theme.color?.val || '#000000' }}>
          {t('map_loading')}
        </Text>
      </View>
    );
  }

  // Error state - if countries failed to load and we have none
  if (countries.length === 0 && !loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.bg?.val || '#ffffff' },
        ]}
      >
        <ErrorState
          title={t('map_error_title')}
          message={t('map_error_message')}
          onRetry={() => router.replace('/(tabs)/map')} // Simple retry by reloading route
          retryText={t('map_retry')}
        />
      </View>
    );
  }

  if (!location) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background?.val || '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ marginTop: 10, color: theme.color?.val || '#000000' }}>
          {t('map_location_loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 60,
          longitudeDelta: 60,
        }}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={onRegionChange}
      >
        {/* Render GeoJSON Layers */}
        <Geojson
          geojson={visitedGeo}
          strokeColor="rgba(255, 255, 255, 0.5)"
          fillColor="rgba(245, 158, 11, 0.4)" // #f59e0b + opacity (Gold)
          strokeWidth={0.5}
        />
        <Geojson
          geojson={bucketGeo}
          strokeColor="rgba(255, 255, 255, 0.5)"
          fillColor="rgba(59, 130, 246, 0.4)" // #3b82f6 + opacity (Blue)
          strokeWidth={0.5}
        />
        <Geojson
          geojson={availableGeo}
          strokeColor="rgba(255, 255, 255, 0.5)"
          fillColor="rgba(16, 185, 129, 0.4)" // #10b981 + opacity (Green)
          strokeWidth={0.5}
        />
        <Geojson
          geojson={lockedGeo}
          strokeColor="rgba(255, 255, 255, 0.5)"
          fillColor="rgba(156, 163, 175, 0.4)" // #9ca3af + opacity (Gray)
          strokeWidth={0.5}
        />

        {countries.map((country: any) => {
          // Provide fallback for latlng if missing
          if (!country.latlng || country.latlng.length < 2) return null;

          const isLocked = isGuest && isPremiumCountry(country.name.common);
          const pinColor = getMarkerColor(country.cca2, country.name.common);

          return (
            <Marker
              key={country.cca2}
              coordinate={{
                latitude: country.latlng[0],
                longitude: country.latlng[1],
              }}
              pinColor={pinColor}
              opacity={isLocked ? 0.6 : 1}
            >
              <Callout
                onPress={() => {
                  if (isLocked) {
                    showError(
                      t('map_locked_upgrade', { country: country.name.common })
                    );
                  } else {
                    router.push(`/country/${country.cca2}`);
                  }
                }}
              >
                <View style={{ padding: 10, minWidth: 150 }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      marginBottom: 5,
                    }}
                  >
                    {country.name.common} {country.flag}
                  </Text>
                  <Text>
                    {t(isLocked ? 'map_locked_label' : 'map_view_recipes')}
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
          {
            top: insets.top + 16,
            backgroundColor: theme.card?.val || '#3d3d3d',
          },
        ]}
      >
        <Text
          style={[styles.legendTitle, { color: theme.color?.val || '#ffffff' }]}
        >
          {t('map_legend_title')}
        </Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
          <Text
            style={[
              styles.legendText,
              { color: theme.color?.val || '#ffffff' },
            ]}
          >
            {t('map_legend_available')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
          <Text
            style={[
              styles.legendText,
              { color: theme.color?.val || '#ffffff' },
            ]}
          >
            {t('map_legend_visited')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          <Text
            style={[
              styles.legendText,
              { color: theme.color?.val || '#ffffff' },
            ]}
          >
            {t('map_legend_bucket_list')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#9ca3af' }]} />
          <Text
            style={[
              styles.legendText,
              { color: theme.color?.val || '#ffffff' },
            ]}
          >
            {t('map_legend_locked')}
          </Text>
        </View>
      </View>

      {/* Offline Maps Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          right: 16,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <View
          style={{
            backgroundColor: colors.tint,
            borderRadius: 30,
            overflow: 'hidden',
          }}
        >
          <FontAwesome5.Button
            name="map-marked-alt"
            backgroundColor={colors.tint}
            onPress={openOfflineMaps}
            size={18}
          >
            {t('map_offline')}
          </FontAwesome5.Button>
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
