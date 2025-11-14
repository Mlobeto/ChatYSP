import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { 
  sendMessageToAI, 
  addMessage, 
  setIsTyping,
  loadConversationHistory 
} from '../redux/chatSlice';
import ChatBubble from '../components/ChatBubble';

export default function ChatScreen() {
  const dispatch = useDispatch();
  const { 
    messages, 
    isTyping, 
    conversationId, 
    isLoading 
  } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Detectar cuando el teclado se abre/cierra
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll al final cuando aparece el teclado
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Cargar historial de conversación al montar el componente
    if (user?.id) {
      dispatch(loadConversationHistory());
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    // Auto-scroll al final cuando hay nuevos mensajes
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Limpiar input
    const messageText = inputText.trim();
    setInputText('');

    try {
      // Enviar mensaje a la IA (sendMessageToAI ya agrega el mensaje del usuario)
      await dispatch(sendMessageToAI({
        message: messageText,
        conversationId,
        context: {
          userId: user.id,
          userName: user.name,
          userCountry: user.country,
          conversationHistory: messages.slice(-10), // Últimos 10 mensajes para contexto
        }
      })).unwrap();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el mensaje. Verifica tu conexión e intenta nuevamente.'
      );
    }
  };

  const renderMessage = ({ item, index }) => (
    <ChatBubble 
      message={item} 
      isLastMessage={index === messages.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-primary-100 w-24 h-24 rounded-full items-center justify-center mb-6">
        <Ionicons name="chatbubbles" size={40} color="#0ea5e9" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        ¡Hola {user?.name}!
      </Text>
      <Text className="text-gray-600 text-center mb-6 leading-6">
        Soy tu coach personal de ChatYSP. Estoy aquí para ayudarte con consejos, 
        motivación y responder todas tus preguntas.
      </Text>
      <View className="bg-gray-50 rounded-xl p-4">
        <Text className="text-gray-700 font-medium mb-2">Puedes preguntarme sobre:</Text>
        <View className="space-y-1">
          <Text className="text-gray-600">• Consejos de desarrollo personal</Text>
          <Text className="text-gray-600">• Motivación y objetivos</Text>
          <Text className="text-gray-600">• Técnicas de comunicación</Text>
          <Text className="text-gray-600">• Estrategias de éxito</Text>
        </View>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View className="px-4 py-2 mb-2">
        <View className="flex-row items-center">
          <View className="bg-gray-200 rounded-2xl px-4 py-3">
            <View className="flex-row items-center space-x-1">
              <View className="w-2 h-2 bg-gray-500 rounded-full" />
              <View className="w-2 h-2 bg-gray-500 rounded-full mx-1" />
              <View className="w-2 h-2 bg-gray-500 rounded-full" />
            </View>
          </View>
          <Text className="text-gray-500 text-xs ml-2">Fede está escribiendo...</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View className="bg-primary-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <View className="bg-white w-10 h-10 rounded-full items-center justify-center mr-3">
            <Ionicons name="chatbubbles" size={20} color="#0ea5e9" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Coach IA</Text>
            <Text className="text-blue-100 text-sm">
              {isTyping ? 'Escribiendo...' : 'En línea'}
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <View className="flex-1">
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ 
              paddingVertical: 16,
              paddingBottom: isTyping ? 8 : 16
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            ListFooterComponent={renderTypingIndicator}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        )}
      </View>

      {/* Input */}
      <View 
        className="bg-white border-t border-gray-200 px-4 py-3"
        style={{ 
          paddingBottom: Platform.OS === 'ios' ? 20 : 12
        }}
      >
        <View className="flex-row items-end space-x-2">
          <View className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 max-h-24">
            <TextInput
              className="text-gray-900 text-base"
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="center"
              onFocus={() => {
                setIsInputFocused(true);
                // Scroll al final cuando el usuario empieza a escribir
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
              onBlur={() => setIsInputFocused(false)}
              maxLength={1000}
              style={{ 
                minHeight: 40,
                paddingTop: Platform.OS === 'ios' ? 10 : 8,
                paddingBottom: Platform.OS === 'ios' ? 10 : 8,
              }}
            />
          </View>
          
          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}