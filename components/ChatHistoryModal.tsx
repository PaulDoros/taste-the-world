import { Id } from '@/convex/_generated/dataModel';
import React from 'react';
import { Modal, FlatList } from 'react-native';
import {
  Text,
  XStack,
  YStack,
  Button,
  useTheme,
  Card,
  ScrollView,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item._id === currentChatId;
    const date = new Date(item.lastMessageAt).toLocaleDateString();

    return (
      <Card
        bordered
        onPress={() => {
          onSelectChat(item._id);
          onClose();
        }}
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        animation="quick"
        backgroundColor={isSelected ? '$blue3' : '$background'}
        borderColor={isSelected ? '$blue8' : '$borderColor'}
        padding="$3"
        marginBottom="$3"
        elevation={2}
      >
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor={isSelected ? '$blue8' : '$gray5'}
            padding="$2.5"
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            {/* Use text color based on background contrast */}
            <FontAwesome5
              name={mode === 'chef' ? 'utensils' : 'plane'}
              size={14}
              color={isSelected ? 'white' : theme.color.get()}
            />
          </YStack>
          <YStack flex={1}>
            <Text
              fontWeight={isSelected ? '700' : '500'}
              numberOfLines={1}
              color={isSelected ? '$blue11' : '$color'}
              fontSize="$4"
            >
              {item.title || 'New Conversation'}
            </Text>
            <Text fontSize="$2" color="$gray10">
              {date}
            </Text>
          </YStack>
          {isSelected && (
            <FontAwesome5 name="check" size={16} color={theme.blue10?.get()} />
          )}
        </XStack>
      </Card>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top} // Ensure header isn't hidden on non-pageSheet modals if they fallback
      >
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
          <Button size="$3" chromeless onPress={onClose} color="$blue10">
            Done
          </Button>
        </XStack>

        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <YStack alignItems="center" marginTop="$10" gap="$4" opacity={0.5}>
              <FontAwesome5
                name="history"
                size={48}
                color={theme.color.get()}
              />
              <Text fontSize="$4" color="$color">
                No history yet
              </Text>
            </YStack>
          }
        />
      </YStack>
    </Modal>
  );
}
