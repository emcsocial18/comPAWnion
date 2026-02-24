import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import AdBanner from '../components/AdBanner';
import { colors } from '../theme';
import { createMemory } from '../models/memory';
import { generateResponse } from '../services/ai';

// Animated typing indicator component
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const translateY1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const translateY2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const translateY3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.typingBubble}>
      <Text style={styles.petAvatar}>🐾</Text>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: translateY3 }] }]} />
      </View>
    </View>
  );
}

// Message bubble component
function MessageBubble({ message, isUser, onLongPress }) {
  const { pet } = useContext(AppContext);
  
  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={isUser ? 1 : 0.7}
      style={[styles.messageRow, isUser && styles.messageRowUser]}
    >
      {!isUser && (
        <View style={styles.petAvatarContainer}>
          <Text style={styles.petAvatarText}>{pet?.isPawPal ? '🐾' : '💙'}</Text>
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.petBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.text}
        </Text>
      </View>
      {isUser && (
        <View style={styles.userAvatarContainer}>
          <Text style={styles.userAvatar}>👤</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { pet, premium, addMemory } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: pet?.isPawPal 
        ? `Hey! I'm ${pet?.name || 'your PawPal'}! What's up? 😊`
        : `Hi... I'm so glad you're here 💙`,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate realistic typing delay
    const typingDelay = 800 + Math.random() * 1200;
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    try {
      // Generate AI response
      const petResponse = await generateResponse(pet, userMessage.text, messages);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: petResponse,
        isUser: false,
      };

      setMessages([...newMessages, botMessage]);
      setIsTyping(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      setIsTyping(false);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: pet?.isPawPal 
          ? "Oops! Can you say that again?" 
          : "I'm having trouble hearing you right now... I'm still here 💙",
        isUser: false,
      };
      setMessages([...newMessages, errorMessage]);
    }
  };

  const saveAsMemory = (message) => {
    Alert.alert(
      'Save as Memory',
      'Do you want to save this message as a memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            const memory = createMemory({
              petId: pet?.id,
              text: message.text,
              isChatMessage: true,
            });
            await addMemory(memory);
            Alert.alert('Saved', 'Message saved to memories');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isUser={msg.isUser}
              onLongPress={() => !msg.isUser && saveAsMemory(msg)}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={pet?.isPawPal ? "Message..." : "Message..."}
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            editable={!isTyping}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!input.trim() || isTyping) && styles.sendButtonDisabled
            ]} 
            onPress={sendMessage}
            disabled={isTyping || !input.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {!premium && <AdBanner />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  petAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  petAvatarText: {
    fontSize: 18,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  userAvatar: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#FF9B50',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2b2b2b',
  },
  userMessageText: {
    color: '#fff',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  petAvatar: {
    fontSize: 18,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9B50',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2b2b2b',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#FF9B50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9B50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
});
