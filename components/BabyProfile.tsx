import React, { useState } from 'react';
import {
  View,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  YStack,
  XStack,
  Input,
  Card,
  Theme,
  Separator,
  Sheet,
} from 'tamagui';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function BabyProfile({ userId }: { userId?: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isEditing, setIsEditing] = useState(false);
  const [showLogFood, setShowLogFood] = useState(false);

  // Profile Data
  const profile = useQuery(api.babyFood.getProfile);
  const triedFoods = useQuery(
    api.babyFood.getTriedFoods,
    profile ? { babyId: profile._id } : 'skip'
  );

  const createProfile = useMutation(api.babyFood.createProfile);
  const logTriedFood = useMutation(api.babyFood.logTriedFood);

  // Form State
  const [name, setName] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [allergies, setAllergies] = useState('');

  // Log Food State
  const [foodName, setFoodName] = useState('');
  const [reaction, setReaction] = useState<
    'liked' | 'neutral' | 'disliked' | 'allergic'
  >('liked');

  const handleCreateProfile = async () => {
    if (!name || !ageMonths) return;
    const birthDate =
      Date.now() - parseInt(ageMonths) * 30 * 24 * 60 * 60 * 1000;
    const allergyList = allergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await createProfile({
      name,
      birthDate,
      allergies: allergyList,
    });
    setIsEditing(false);
  };

  const handleLogFood = async () => {
    if (!profile || !foodName) return;
    await logTriedFood({
      babyId: profile._id,
      foodName,
      reaction,
      notes: '',
    });
    setFoodName('');
    setShowLogFood(false);
  };

  if (profile === undefined) return <ActivityIndicator />;

  if (profile === null || isEditing) {
    return (
      <Card
        elevate
        padded
        bordered
        marginVertical="$4"
        backgroundColor="$background"
      >
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="bold">
            Baby Profile 👶
          </Text>
          <Text fontSize="$3" color="$color.gray11Dark">
            Set up a profile to generate age-appropriate meal plans.
          </Text>

          <Input
            placeholder="Baby's Name"
            value={name}
            onChangeText={setName}
            backgroundColor="$background"
          />
          <Input
            placeholder="Age (in months)"
            keyboardType="numeric"
            value={ageMonths}
            onChangeText={setAgeMonths}
            backgroundColor="$background"
          />
          <Input
            placeholder="Allergies (comma separated)"
            value={allergies}
            onChangeText={setAllergies}
            backgroundColor="$background"
          />

          <XStack space="$2" justifyContent="flex-end">
            {profile && (
              <Button chromeless onPress={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button themeInverse onPress={handleCreateProfile}>
              {profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </XStack>
        </YStack>
      </Card>
    );
  }

  // Display Profile
  const age = Math.floor(
    (Date.now() - profile.birthDate) / (1000 * 60 * 60 * 24 * 30.44)
  );

  return (
    <YStack space="$4">
      {/* Header Card */}
      <Card elevate padded bordered backgroundColor="$pink3">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$8" fontWeight="bold" color="$color.gray12Dark">
              {profile.name}
            </Text>
            <Text fontSize="$4" color="$color.gray11Dark">
              {age} months old
            </Text>
            {profile.allergies.length > 0 && (
              <Text fontSize="$3" color="$red10">
                ⚠️ Allergies: {profile.allergies.join(', ')}
              </Text>
            )}
          </YStack>
          <Button
            icon={<FontAwesome5 name="cog" size={16} color={colors.text} />}
            circular
            size="$3"
            onPress={() => setIsEditing(true)}
          />
        </XStack>
      </Card>

      {/* Stats / Action */}
      <XStack space="$3" justifyContent="space-between">
        <Card
          flex={1}
          padded
          bordered
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="$5" fontWeight="bold">
            {triedFoods?.length || 0}
          </Text>
          <Text fontSize="$2" color="$gray10">
            Foods Tried
          </Text>
        </Card>
        <Button
          flex={2}
          themeInverse
          icon={<FontAwesome5 name="plus" size={16} color="white" />}
          onPress={() => setShowLogFood(true)}
        >
          Log New Food
        </Button>
      </XStack>

      {/* Tried Foods List */}
      <YStack space="$2">
        <Text fontSize="$5" fontWeight="bold">
          History
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$2">
            {triedFoods?.map((food: any) => (
              <Card
                key={food._id}
                padded
                bordered
                backgroundColor="$background"
              >
                <XStack space="$2" alignItems="center">
                  <Text>{getReactionEmoji(food.reaction)}</Text>
                  <Text fontWeight="bold" textTransform="capitalize">
                    {food.foodName}
                  </Text>
                </XStack>
              </Card>
            ))}
          </XStack>
        </ScrollView>
      </YStack>

      {/* Log Food Modal */}
      <Modal visible={showLogFood} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
              Log Tried Food
            </Text>

            <Input
              placeholder="Food Name (e.g. Sweet Potato)"
              value={foodName}
              onChangeText={setFoodName}
              marginBottom="$3"
            />

            <Text marginBottom="$2">Reaction:</Text>
            <XStack space="$2" marginBottom="$4">
              {['liked', 'neutral', 'disliked', 'allergic'].map((r) => (
                <Button
                  key={r}
                  size="$3"
                  backgroundColor={reaction === r ? '$blue9' : '$gray5'}
                  onPress={() => setReaction(r as any)}
                >
                  {getReactionEmoji(r)} {r}
                </Button>
              ))}
            </XStack>

            <Button themeInverse onPress={handleLogFood}>
              Save
            </Button>
            <Button
              chromeless
              marginTop="$2"
              onPress={() => setShowLogFood(false)}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </YStack>
  );
}

function getReactionEmoji(reaction: string) {
  switch (reaction) {
    case 'liked':
      return '😋';
    case 'neutral':
      return '😐';
    case 'disliked':
      return '🤢';
    case 'allergic':
      return '⚠️';
    default:
      return '❓';
  }
}

function ActivityIndicator() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Loading...</Text>
    </View>
  );
}
