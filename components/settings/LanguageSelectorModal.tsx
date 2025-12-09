import React from 'react';
import { Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack, Text, Button, Card } from 'tamagui';
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
          <Button
            size="$3"
            chromeless
            onPress={onClose}
            icon={<FontAwesome5 name="times" size={16} color={colors.text} />}
          />
        </XStack>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {(Object.keys(Translations) as Language[]).map((lang) => (
            <Card
              key={lang}
              padding="$4"
              marginBottom="$3"
              bordered
              backgroundColor={language === lang ? colors.tint + '20' : '$card'}
              borderColor={language === lang ? colors.tint : '$borderColor'}
              pressStyle={{ scale: 0.98 }}
              onPress={() => handleLanguageSelect(lang)}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" space="$3">
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
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
