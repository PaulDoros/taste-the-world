import React from 'react';
import { Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack, Text } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { Translations, Language, FLAGS } from '@/constants/Translations';
import { haptics } from '@/utils/haptics';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageSelectorModal({
  visible,
  onClose,
}: LanguageSelectorModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    haptics.selection();
    setLanguage(lang);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <XStack
          padding="$4"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$5" fontWeight="700" color={colors.text}>
            {t('settings_select_language')}
          </Text>
          <GlassButton
            size="small"
            label=""
            onPress={onClose}
            icon="times"
            backgroundColor={undefined}
            shadowRadius={3}
            backgroundOpacity={0}
            textColor={colors.text}
          />
        </XStack>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {(Object.keys(Translations) as Language[]).map((lang) => (
            <GlassCard
              key={lang}
              borderRadius={16}
              borderRadiusInside={16}
              shadowRadius={5}
              backgroundColor={
                language === lang ? `${colors.tint}20` : undefined
              }
              intensity={language === lang ? 60 : 30}
              style={{ marginBottom: 12 }}
            >
              <Pressable
                onPress={() => handleLanguageSelect(lang)}
                style={({ pressed }) => ({
                  padding: 16,
                  opacity: pressed ? 0.9 : 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 16, // Ensure interaction matches rounded corners
                  borderWidth: language === lang ? 1 : 0,
                  borderColor: language === lang ? colors.tint : 'transparent',
                })}
              >
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  flex={1}
                >
                  <XStack alignItems="center" gap="$3">
                    <Text fontSize="$8">{FLAGS[lang]}</Text>
                    <YStack>
                      <Text
                        fontSize="$4"
                        fontWeight="600"
                        color={language === lang ? colors.tint : colors.text}
                      >
                        {Translations[lang].languageName}
                      </Text>
                      <Text fontSize="$2" color="$color11">
                        {lang.toUpperCase()}
                      </Text>
                    </YStack>
                  </XStack>
                  {language === lang && (
                    <FontAwesome5 name="check" size={16} color={colors.tint} />
                  )}
                </XStack>
              </Pressable>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
