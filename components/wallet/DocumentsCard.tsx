import React, { useState } from 'react';
import { Image, Alert, Pressable, Platform } from 'react-native';
import { YStack, XStack, Text, Button, Heading, Spinner, Stack } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { FadeInImage } from '@/components/ui/FadeInImage';

interface DocumentsCardProps {
  trip: any;
  token: string;
  updateTrip: any;
  generateUploadUrl: any;
  onViewImage: (url: string) => void;
}

export const DocumentsCard = ({
  trip,
  token,
  updateTrip,
  generateUploadUrl,
  onViewImage,
}: DocumentsCardProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const { uri, mimeType } = result.assets[0];

        // Step 1: Get Upload URL
        const uploadUrl = await generateUploadUrl({ token });

        // Step 2: Upload File
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': mimeType || 'application/octet-stream' },
          body: {
            uri,
            name: 'upload',
            type: mimeType || 'application/octet-stream',
          } as any,
        });

        if (!response.ok) throw new Error('Upload failed');
        const { storageId } = await response.json();

        // Step 3: Update Trip
        const currentDocs = trip?.idDocuments || [];
        await updateTrip({
          id: trip._id,
          token,
          idDocuments: [...currentDocs, storageId],
        });

        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <YStack gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Heading size="$5">ID Documents & Tickets</Heading>
        <Button
          size="$3"
          theme="active"
          icon={<FontAwesome5 name="upload" size={12} />}
          onPress={handleUploadDocument}
          disabled={isUploading}
        >
          {isUploading ? <Spinner color="white" /> : 'Upload'}
        </Button>
      </XStack>

      <XStack flexWrap="wrap" gap="$3">
        {trip.ticketUrl && (
          <Pressable
            onPress={() => onViewImage(trip.ticketUrl)}
            android_ripple={{
              color:
                Platform.OS === 'android' ? 'rgba(255,255,255,0.3)' : undefined,
              borderless: false,
              foreground: true,
            }}
            style={({ pressed }) => ({
              width: '47%',
              height: 150,
              opacity: Platform.OS === 'ios' && pressed ? 0.9 : 1,
            })}
          >
            <GlassCard
              style={{ width: '100%', height: '100%' }}
              contentContainerStyle={{ padding: 0 }}
            >
              <FadeInImage
                source={{ uri: trip.ticketUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <Stack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                backgroundColor="rgba(0,0,0,0.6)"
                padding={4}
              >
                <Text color="white" fontSize="$2" textAlign="center">
                  Ticket
                </Text>
              </Stack>
            </GlassCard>
          </Pressable>
        )}
        {trip.idDocumentUrls &&
          trip.idDocumentUrls.map((url: string, i: number) => (
            <Pressable
              key={i}
              onPress={() => onViewImage(url)}
              android_ripple={{
                color:
                  Platform.OS === 'android'
                    ? 'rgba(255,255,255,0.3)'
                    : undefined,
                borderless: false,
                foreground: true,
              }}
              style={({ pressed }) => ({
                width: '47%',
                height: 150,
                opacity: Platform.OS === 'ios' && pressed ? 0.9 : 1,
              })}
            >
              <GlassCard
                style={{ width: '100%', height: '100%' }}
                contentContainerStyle={{ padding: 0 }}
              >
                <FadeInImage
                  source={{ uri: url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </GlassCard>
            </Pressable>
          ))}
        {!trip.ticketUrl &&
          (!trip.idDocumentUrls || trip.idDocumentUrls.length === 0) && (
            <Text color="$color11" fontStyle="italic">
              No documents uploaded yet.
            </Text>
          )}
      </XStack>
    </YStack>
  );
};
