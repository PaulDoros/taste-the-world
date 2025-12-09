import { Id } from '@/convex/_generated/dataModel';
import React from 'react';
import {
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, XStack, YStack, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface ChatHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  chats: any[];
  onSelectChat: (chatId: Id<'chats'>) => void;
  currentChatId?: Id<'chats'>;
  mode: 'chef' | 'travel';
}

export function ChatHistoryModal({
  visible,
  onClose,
  chats,
  onSelectChat,
  currentChatId,
  mode,
}: ChatHistoryModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item._id === currentChatId;
    const date = new Date(item.lastMessageAt).toLocaleDateString();

    return (
      <TouchableOpacity
        onPress={() => {
          onSelectChat(item._id);
          onClose();
        }}
        style={[
          styles.chatItem,
          {
            backgroundColor: isSelected ? colors.tint + '20' : colors.card,
            borderColor: isSelected ? colors.tint : colors.border,
          },
        ]}
      >
        <XStack alignItems="center" gap="$3">
          <View
            style={{
              backgroundColor: isSelected ? colors.tint : '$gray5',
              padding: 10,
              borderRadius: 20,
            }}
          >
            <FontAwesome5
              name={mode === 'chef' ? 'utensils' : 'plane'}
              size={16}
              color={isSelected ? 'white' : colors.text}
            />
          </View>
          <YStack flex={1}>
            <Text
              fontWeight={isSelected ? '700' : '500'}
              numberOfLines={1}
              color={colors.text}
            >
              {item.title || 'New Conversation'}
            </Text>
            <Text fontSize="$2" color="$gray10">
              {date}
            </Text>
          </YStack>
          {isSelected && (
            <FontAwesome5 name="check" size={16} color={colors.tint} />
          )}
        </XStack>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <XStack
          padding="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$6" fontWeight="700">
            History
          </Text>
          <Button size="$3" chromeless onPress={onClose}>
            <Text color="$blue10">Done</Text>
          </Button>
        </XStack>

        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <YStack alignItems="center" marginTop="$10" gap="$4" opacity={0.5}>
              <FontAwesome5 name="history" size={48} color={colors.text} />
              <Text fontSize="$4">No history yet</Text>
            </YStack>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
});
