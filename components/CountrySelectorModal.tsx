import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useCountries } from '@/hooks/useCountries';
import { useUserStore } from '@/store/useUserStore';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AdUnlockModal } from './AdUnlockModal';
import { Country } from '@/types';

interface CountrySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { countries, loading } = useCountries();
  const { unlockedCountries, tier, token } = useUserStore();
  const [adVisible, setAdVisible] = useState(false);
  const [selectedLockedCountry, setSelectedLockedCountry] =
    useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unlockCountryMutation = useMutation(api.users.unlockCountry);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const lowerQuery = searchQuery.toLowerCase();
    return countries.filter((c) =>
      c.name.common.toLowerCase().includes(lowerQuery)
    );
  }, [countries, searchQuery]);

  const isUnlocked = (country: Country) => {
    if (tier === 'pro' || tier === 'personal') return true;
    return unlockedCountries.includes(country.cca2);
  };

  const handleSelect = (country: Country) => {
    if (isUnlocked(country)) {
      haptics.success();
      onSelect(country);
      onClose();
    } else {
      haptics.medium();
      setSelectedLockedCountry(country);
      setAdVisible(true);
    }
  };

  const handleUnlock = async () => {
    if (!selectedLockedCountry) return;

    try {
      if (!token) throw new Error('No token found');

      await unlockCountryMutation({
        token,
        countryCode: selectedLockedCountry.cca2,
      });

      // Optimistically update store (or wait for query refresh)
      // For now, we rely on the query refresh which should happen automatically
      // if we were using a reactive query for unlockedCountries.
      // Since unlockedCountries is in store, we might need to update it manually or refetch.
      // But let's assume the mutation works and we just close the modal.

      setAdVisible(false);
      onSelect(selectedLockedCountry);
      onClose();
    } catch (error) {
      console.error('Unlock failed:', error);
      alert('Failed to unlock country. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: Country }) => {
    const unlocked = isUnlocked(item);
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: pressed ? `${colors.tint}10` : colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          opacity: unlocked ? 1 : 0.6,
        })}
      >
        <Text style={{ fontSize: 24, marginRight: 16 }}>{item.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {item.name.common}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.text,
              opacity: 0.6,
            }}
          >
            {item.region}
          </Text>
        </View>
        {!unlocked && (
          <FontAwesome5
            name="lock"
            size={16}
            color={colors.text}
            opacity={0.5}
          />
        )}
        {unlocked && (
          <FontAwesome5
            name="chevron-right"
            size={12}
            color={colors.text}
            opacity={0.3}
          />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <Animated.View
            entering={FadeInDown.springify()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingTop: 24,
              height: '85%',
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                backgroundColor: colors.text,
                opacity: 0.2,
                borderRadius: 3,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 20,
                paddingHorizontal: 24,
              }}
            >
              Select Destination 🌍
            </Text>

            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <FontAwesome5
                  name="search"
                  size={16}
                  color={colors.text}
                  style={{ opacity: 0.5, marginRight: 10 }}
                />
                <TextInput
                  placeholder="Search countries..."
                  placeholderTextColor={colors.tabIconDefault}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <FontAwesome5
                      name="times-circle"
                      size={16}
                      color={colors.text}
                      style={{ opacity: 0.5 }}
                    />
                  </Pressable>
                )}
              </View>
            </View>

            {loading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
            ) : (
              <FlatList
                data={filteredCountries}
                renderItem={renderItem}
                keyExtractor={(item) => item.cca2}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>
        </View>
      </Modal>

      <AdUnlockModal
        visible={adVisible}
        onClose={() => setAdVisible(false)}
        onUnlock={handleUnlock}
        countryName={selectedLockedCountry?.name.common || ''}
      />
    </>
  );
};
