import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { AppContext } from '../context/AppContext';
import { createMemory } from '../models/memory';
import { colors } from '../theme';
import BackButton from '../components/BackButton';

export default function AddMemoryScreen({ navigation, route }) {
  const { pet, addMemory } = useContext(AppContext);
  const initialText = route?.params?.text || '';
  
  const [text, setText] = useState(initialText);
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!text.trim()) {
      newErrors.text = 'Please write something about your memory';
    } else if (text.trim().length < 3) {
      newErrors.text = 'Memory must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add photos to memories.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setVideo(null); // Clear video if photo is selected
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add videos to memories.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setVideo(result.assets[0].uri);
        setPhoto(null); // Clear photo if video is selected
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);

    try {
      const memory = createMemory({
        petId: pet?.id,
        text: text.trim(),
        photo,
        video,
      });

      await addMemory(memory);
      
      Alert.alert('Success', 'Memory saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save memory. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add a Memory</Text>
        <Text style={styles.subtitle}>
          Capture a special moment with {pet?.name || 'your pet'}
        </Text>

        {photo && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.removePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {video && (
          <View style={styles.photoPreview}>
            <Video
              source={{ uri: video }}
              style={styles.photo}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => setVideo(null)}
            >
              <Text style={styles.removePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mediaButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonIcon}>
              {photo ? '📷' : '📷'}
            </Text>
            <Text style={styles.photoButtonText}>
              {photo ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton} onPress={pickVideo}>
            <Text style={styles.photoButtonIcon}>
              {video ? '🎥' : '🎥'}
            </Text>
            <Text style={styles.photoButtonText}>
              {video ? 'Change Video' : 'Add Video'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Memory *</Text>
          <TextInput
            style={[styles.textInput, errors.text && styles.inputError]}
            placeholder="Write about a special moment...

What happened? How did it make you feel? What made it special?"
            placeholderTextColor={colors.subtext}
            value={text}
            onChangeText={(value) => {
              setText(value);
              if (errors.text) {
                setErrors({ ...errors, text: null });
              }
            }}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />
          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {text.length} / 1000
            </Text>
          </View>
          {errors.text && <Text style={styles.errorText}>{errors.text}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Memory</Text>
          )}
        </TouchableOpacity>
        
        <BackButton 
          label="Cancel"
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 25,
    lineHeight: 22,
  },
  photoPreview: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 15,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
    gap: 8,
  },
  photoButtonIcon: {
    fontSize: 24,
  },
  photoButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.muted,
    minHeight: 200,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  characterCountText: {
    fontSize: 12,
    color: colors.subtext,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.subtext,
    fontSize: 16,
  },
});
