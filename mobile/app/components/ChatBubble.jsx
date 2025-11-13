import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatBubble({ message, isLastMessage = false }) {
  // Soportar tanto el formato viejo como el nuevo
  const isUser = message.isUser ?? (message.type === 'user');
  const messageText = message.text ?? message.content ?? '';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className={`px-4 mb-3 ${isLastMessage ? 'mb-4' : ''}`}>
      <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Avatar del coach IA */}
          {!isUser && (
            <View className="flex-row items-center mb-1">
              <View className="bg-primary-500 w-6 h-6 rounded-full items-center justify-center mr-2">
                <Ionicons name="chatbubbles" size={12} color="white" />
              </View>
              <Text className="text-gray-600 text-xs font-medium">Coach IA</Text>
            </View>
          )}

          {/* Burbuja del mensaje */}
          <View
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary-500 rounded-br-md'
                : 'bg-gray-200 rounded-bl-md'
            }`}
          >
            <Text
              className={`text-base leading-5 ${
                isUser ? 'text-white' : 'text-gray-900'
              }`}
            >
              {messageText}
            </Text>
          </View>

          {/* Timestamp */}
          <Text
            className={`text-xs text-gray-500 mt-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {timestamp}
          </Text>

          {/* Estado del mensaje para usuario */}
          {isUser && (
            <View className="flex-row items-center mt-1">
              <Ionicons
                name={message.status === 'sent' ? 'checkmark' : 'checkmark-done'}
                size={12}
                color={message.status === 'read' ? '#0ea5e9' : '#6B7280'}
              />
              {message.status === 'read' && (
                <Ionicons name="checkmark" size={12} color="#0ea5e9" />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}