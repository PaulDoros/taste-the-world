import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { YStack, XStack, Heading, Text, Button, Card, Spinner } from 'tamagui';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { TripInfoCard } from '@/components/wallet/TripInfoCard';
import { ChecklistCard } from '@/components/wallet/ChecklistCard';
import { DocumentsCard } from '@/components/wallet/DocumentsCard';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();

  const trip = useQuery(api.trips.getTrip, {
    id: id as Id<'trips'>,
    token: token || undefined,
  });
  const updateTrip = useMutation(api.trips.updateTrip);
  const generateUploadUrl = useMutation(api.trips.generateUploadUrl);

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  if (!trip) {
    return (
      <ScreenLayout
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        edges={['top', 'left', 'right']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Spinner size="large" color={colors.tint} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      {/* Hero Header */}
      <View style={{ height: 200, marginBottom: -40 }}>
        <LinearGradient
          colors={[colors.tint, '#3B82F6']} // Gradient based on primary color
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            padding: 20,
            paddingTop: 60,
            justifyContent: 'center',
          }}
        >
          <XStack alignItems="center" gap="$3" marginBottom="$4">
            <Button
              size="$3"
              circular
              backgroundColor="rgba(255,255,255,0.2)"
              icon={<FontAwesome5 name="arrow-left" size={16} color="white" />}
              onPress={() => router.back()}
            />
            <Text color="white" fontWeight="600" fontSize="$3" opacity={0.9}>
              TRIP DETAILS
            </Text>
          </XStack>

          <Heading size="$9" color="white" fontWeight="900" letterSpacing={-1}>
            {trip.destination}
          </Heading>
          <XStack alignItems="center" marginTop="$2" gap="$2">
            <FontAwesome5
              name="calendar-alt"
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text color="white" opacity={0.9} fontSize="$4" fontWeight="600">
              {format(new Date(trip.startDate), 'MMM dd, yyyy')}
            </Text>
          </XStack>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <YStack gap="$6">
          {/* Trip Info */}
          <TripInfoCard trip={trip} token={token!} updateTrip={updateTrip} />

          {/* Checklist Section */}
          <ChecklistCard trip={trip} token={token!} updateTrip={updateTrip} />

          {/* Documents Section */}
          <DocumentsCard
            trip={trip}
            token={token!}
            updateTrip={updateTrip}
            generateUploadUrl={generateUploadUrl}
            onViewImage={(url) => setFullScreenImage(url)}
          />

          {/* Itinerary Section */}
          {trip.notes && (
            <YStack gap="$3">
              <Heading size="$5">Itinerary</Heading>
              <Card padded bordered>
                <Markdown
                  style={{
                    body: { color: colors.text, fontSize: 16, lineHeight: 24 },
                    heading1: {
                      color: colors.tint,
                      fontSize: 24,
                      fontWeight: 'bold',
                      marginTop: 16,
                      marginBottom: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.tint,
                      paddingBottom: 4,
                    },
                    heading2: {
                      color: colors.text,
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginTop: 12,
                      marginBottom: 6,
                    },
                    link: {
                      color: colors.tint,
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                    },
                    list_item: { color: colors.text, marginBottom: 4 },
                    code_inline: {
                      backgroundColor: 'transparent',
                      color: '#FF9800',
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      fontWeight: 'bold',
                    },
                    code_block: {
                      backgroundColor:
                        colorScheme === 'dark' ? '#333' : '#f0f0f0',
                      color: colors.text,
                      borderRadius: 8,
                      padding: 8,
                    },
                    strong: {
                      color: '#4CAF50', // Green for highlight
                      fontWeight: 'bold',
                    },
                    em: {
                      color: '#F44336', // Red for highlight
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                    },
                  }}
                  rules={{
                    link: (node, children, parent, styles) => {
                      const href = node.attributes.href;
                      // Match colors from Chef screen logic
                      if (href === 'fish')
                        return (
                          <Text
                            key={node.key}
                            style={{ color: '#009688', fontWeight: 'bold' }}
                          >
                            {children}
                          </Text>
                        );
                      if (href === 'dairy')
                        return (
                          <Text
                            key={node.key}
                            style={{ color: '#3F51B5', fontWeight: 'bold' }}
                          >
                            {children}
                          </Text>
                        );
                      if (href === 'time')
                        return (
                          <Text
                            key={node.key}
                            style={{ color: '#9C27B0', fontWeight: 'bold' }}
                          >
                            {children}
                          </Text>
                        );

                      return (
                        <Text
                          key={node.key}
                          style={styles.link}
                          onPress={() => Linking.openURL(node.attributes.href)}
                        >
                          {children}
                        </Text>
                      );
                    },
                  }}
                >
                  {trip.notes}
                </Markdown>
              </Card>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10,
              padding: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
            }}
            onPress={() => setFullScreenImage(null)}
          >
            <FontAwesome5 name="times" size={24} color="white" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScreenLayout>
  );
}
