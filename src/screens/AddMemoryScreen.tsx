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
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { AppContext } from '../context/AppContext';
import { createMemory } from '../models/memory';
import { colors } from '../theme';
import BackButton from '../components/BackButton';

export default function AddMemoryScreen({ navigation, route }: any) {
  const { pet, addMemory } = useContext(AppContext);
  const initialText = route?.params?.text || '';
  
  const [text, setText] = useState(initialText);
  const [photo, setPhoto] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!text.trim()) {
      newErrors.text = 'Please write something about your memory';
    } else if (text.trim().length < 3) {
      newErrors.text = 'Memory must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePhotoToAppDirectory = async (sourceUri: string) => {
    try {
      const filename = `memory_${Date.now()}.jpg`;
      const destPath = `${FileSystem.documentDirectory}memories/${filename}`;
      
      // Create memories directory if it doesn't exist
      const memDir = `${FileSystem.documentDirectory}memories`;
      const dirInfo = await FileSystem.getInfoAsync(memDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(memDir, { intermediates: true });
      }
      
      // Copy file to app directory
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destPath,
      });
      
      return destPath;
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
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
        // Save photo to permanent app directory
        const savedPath = await savePhotoToAppDirectory(result.assets[0].uri);
        setPhoto(savedPath);
        setVideo(null);
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
        try {
          // Save video to permanent app directory
          const filename = `memory_${Date.now()}.mp4`;
          const destPath = `${FileSystem.documentDirectory}memories/${filename}`;
          
          // Create memories directory if it doesn't exist
          const memDir = `${FileSystem.documentDirectory}memories`;
          const dirInfo = await FileSystem.getInfoAsync(memDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(memDir, { intermediates: true });
          }
          
          // Copy file to app directory
          await FileSystem.copyAsync({
            from: result.assets[0].uri,
            to: destPath,
          });
          
          setVideo(destPath);
          setPhoto(null);
        } catch (error) {
          console.error('Error saving video:', error);
          Alert.alert('Error', 'Failed to save video. Please try again.');
        }
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
    width: '100%',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4F8',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B8D4E8',
  },
  photoButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90E2',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 180,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  characterCountText: {
    fontSize: 13,
    color: colors.subtext,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: colors.subtext,
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.subtext,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
});
