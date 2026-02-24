import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateResponse } from '../services/ai';
import { AppContext } from '../context/AppContext';

export default function ChatBox() {
  const { pet } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Load chat history for current pet
  useEffect(() => {
    if (!pet?.id) return;
    const loadMessages = async () => {
      const key = `@chat_${pet.id}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [pet?.id]);

  // Save chat history when messages change
  useEffect(() => {
    if (!pet?.id) return;
    const saveMessages = async () => {
      const key = `@chat_${pet.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    };
    if (messages.length > 0) saveMessages();
  }, [messages, pet?.id]);

  const sendMessage = async () => {
    if (!input.trim() || !pet) return;
    const userMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    // Use generateResponse for consistent AI logic (uses Heart to Paw API if enabled)
    const aiResponseText = await generateResponse(pet, input, messages);
    const aiMessage = { type: 'ai', text: aiResponseText };
    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const renderItem = ({ item }) => {
    const isUser = item.type === 'user';
    // Debug log for pet photo
    if (!isUser) {
      console.log('ChatBox: pet.photo =', pet?.photo);
    }
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          pet?.photo && typeof pet.photo === 'string' && pet.photo.length > 0 ? (
            <Image
              source={{ uri: pet.photo }}
              style={styles.petAvatar}
              onError={() => {
                console.warn('ChatBox: Failed to load pet photo:', pet.photo);
              }}
            />
          ) : (
            <View style={styles.petAvatarPlaceholder}>
              <Text style={styles.petAvatarEmoji}>{pet?.isPawPal ? '🐾' : '💙'}</Text>
              {pet?.photo && typeof pet.photo === 'string' && pet.photo.length === 0 && (
                <Text style={{ color: 'red', fontSize: 10 }}>Photo missing</Text>
              )}
            </View>
          )
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text style={isUser ? styles.userText : styles.aiText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.chatContainer}
      />

      {loading && <ActivityIndicator size="small" color="#00aaff" />}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} disabled={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles declaration moved to the end of the file to avoid redeclaration error.
import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { respond } from '../services/ai';

function Message({m}){
  return (
    <View style={[styles.msg, {alignSelf: m.from==='user'? 'flex-end':'flex-start', backgroundColor: m.from==='user'? '#bfe8e8':'#fff'}]}>
      <Text>{m.text}</Text>
    </View>
  );
}

export default function ChatBox({mode='memorial', premium=false}){
  const [messages, setMessages] = useState([]);
  const initRef = useRef(false);

  useEffect(()=>{
    if(initRef.current) return;
    initRef.current = true;
    setMessages([{id:'1',from:'pet',text: mode==='memorial'? 'I remember the warm sun on our walks...':'Whee! Let\'s play!'}]);
  },[mode]);
  const { addMemory } = useContext(AppContext);
  const [text, setText] = useState('');

  function send(){
    if(!text.trim()) return;
    const user = {id:Date.now().toString(),from:'user',text};
    setMessages(prev=>[...prev,user]);
    // mock AI response
    (async ()=>{
      const respText = await respond(mode, text);
      const petMsg = {id:(Date.now()+1).toString(),from:'pet',text:respText};
      setMessages(prev=>[...prev, petMsg]);
    })();
    setText('');
  }

  async function saveLastPetMessage(){
    try{
      const lastPet = [...messages].reverse().find(m=>m.from==='pet');
      if(!lastPet) return;
      const item = {id: Date.now().toString(), text: lastPet.text, date: new Date().toISOString()};
      await addMemory(item);
      setMessages(prev=>[...prev,{id:(Date.now()+2).toString(),from:'system',text:'Memory saved.'}]);
    }catch(e){ }
  }

  return (
    <View style={styles.container}>
      <FlatList data={messages} keyExtractor={m=>m.id} renderItem={({item})=><Message m={item} />} style={styles.list} />
      <View style={styles.inputRow}>
        <TextInput value={text} onChangeText={setText} placeholder="Say something..." style={styles.input} />
        <TouchableOpacity style={styles.send} onPress={send}><Text style={{color:'#fff'}}>Send</Text></TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',justifyContent:'flex-end',paddingVertical:6}}>
        <TouchableOpacity style={[styles.send,{backgroundColor:'#b08bb0'}]} onPress={saveLastPetMessage}><Text style={{color:'#fff'}}>Save Last</Text></TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  chatContainer: { padding: 16, paddingBottom: 80 },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  petAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#FFE8D6',
    borderWidth: 2,
    borderColor: '#FFD4B8',
  },
  petAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD4B8',
  },
  petAvatarEmoji: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#00aaff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  userText: { color: '#fff', fontSize: 16 },
  aiText: { color: '#000', fontSize: 16 },
});
