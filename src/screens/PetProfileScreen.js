import React, { useState, useContext, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import { createPet } from '../models/pet';
import { colors } from '../theme';
import BackButton from '../components/BackButton';
import BreedSelector from '../components/BreedSelector';
import { getBreedById } from '../data/breeds';

export default function PetProfileScreen({ navigation, route }) {
  const { pet, savePet, premium, completeOnboarding, onboardingDone } = useContext(AppContext);
  const mode = route?.params?.mode || 'edit';
  const isAddingNew = route?.params?.isAddingNew || false;
  const isNewPet = mode === 'remember' || mode === 'create' || isAddingNew;
  // For edit mode, check the pet's isPawPal property; for new pets, check the mode
  // isPawPal = true for living pets (create mode)
  // isPawPal = false for memorial pets (remember mode)
  const isPawPal = mode === 'edit' ? (pet?.isPawPal ?? false) : mode === 'create';
  
  console.log('PetProfileScreen - mode:', mode, 'isPawPal:', isPawPal, 'isNewPet:', isNewPet, 'isAddingNew:', isAddingNew);

  // Only use pet data when in edit mode, not when creating new pets
  const [name, setName] = useState(isNewPet ? '' : (pet?.name || ''));
  const [species, setSpecies] = useState(isNewPet ? '' : (pet?.species || ''));
  const [breed, setBreed] = useState(isNewPet ? '' : (pet?.breed || ''));
  const [traits, setTraits] = useState(isNewPet ? '' : (pet?.traits || ''));
  const [habits, setHabits] = useState(isNewPet ? '' : (pet?.habits || ''));
  const [photo, setPhoto] = useState(isNewPet ? null : (pet?.photo || null));
  const [birthDate, setBirthDate] = useState(isNewPet ? '' : (pet?.birthDate || ''));
  const [age, setAge] = useState(''); // Always calculate from birthDate, don't use saved age
  const [datePassed, setDatePassed] = useState(isNewPet ? '' : (pet?.datePassed || ''));
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showDatePassedPicker, setShowDatePassedPicker] = useState(false);
  const [showBreedSelector, setShowBreedSelector] = useState(false);
  const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
  const [selectedDatePassed, setSelectedDatePassed] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const calculateAge = (dateString, endDateString) => {
    if (!dateString || !dateString.trim()) return '';
    
    try {
      let parsedDate = null;
      
      // First try MM/DD/YYYY format (most reliable)
      const slashParts = dateString.trim().split('/');
      if (slashParts.length === 3) {
        const month = parseInt(slashParts[0]);
        const day = parseInt(slashParts[1]);
        const year = parseInt(slashParts[2]);
        if (!isNaN(month) && !isNaN(day) && !isNaN(year) && 
            month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1900) {
          parsedDate = new Date(year, month - 1, day);
        }
      }
      
      // If slash format failed, try natural language parsing
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        parsedDate = new Date(dateString.trim());
      }
      
      // If still invalid, return empty
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        console.log('Invalid date:', dateString);
        return '';
      }
      
      // For memorial pets, use "Remembered Since" date as end date if available
      // For living pets or when no end date specified, use today
      let endDate;
      if (endDateString && endDateString.trim()) {
        const endParts = endDateString.trim().split('/');
        if (endParts.length === 3) {
          const month = parseInt(endParts[0]);
          const day = parseInt(endParts[1]);
          const year = parseInt(endParts[2]);
          if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
            endDate = new Date(year, month - 1, day);
          } else {
            endDate = new Date();
          }
        } else {
          endDate = new Date();
        }
      } else {
        endDate = new Date();
      }
      
      endDate.setHours(0, 0, 0, 0);
      parsedDate.setHours(0, 0, 0, 0);
      
      // Don't allow birth date after end date
      if (parsedDate > endDate) {
        console.log('Birth date after end date');
        return '';
      }
      
      // Calculate difference
      let years = endDate.getFullYear() - parsedDate.getFullYear();
      let months = endDate.getMonth() - parsedDate.getMonth();
      let days = endDate.getDate() - parsedDate.getDate();
      
      // Adjust for day of month not yet reached
      if (days < 0) {
        months--;
      }
      
      // Adjust for month not yet reached this year
      if (months < 0) {
        years--;
        months += 12;
      }
      
      console.log('Birth date:', parsedDate.toLocaleDateString(), 'End date:', endDate.toLocaleDateString());
      console.log('Age calculation - Years:', years, 'Months:', months);
      
      // Format the result
      if (years > 0) {
        if (months > 0) {
          return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
        }
        return `${years} year${years !== 1 ? 's' : ''} old`;
      } else if (months > 0) {
        return `${months} month${months !== 1 ? 's' : ''} old`;
      } else {
        return 'Less than a month old';
      }
    } catch (error) {
      console.log('Age calculation error:', error);
      return '';
    }
  };

  const handleBirthDateChange = (text) => {
    setBirthDate(text);
    // Auto-calculate age when birth date changes
    const endDate = (!isPawPal && datePassed) ? datePassed : undefined;
    const calculatedAge = calculateAge(text, endDate);
    console.log('Birth date:', text, 'Calculated age:', calculatedAge);
    if (calculatedAge) {
      setAge(calculatedAge);
    } else if (text.trim() === '') {
      setAge('');
    }
  };

  const onBirthDatePickerChange = (event, selectedDate) => {
    console.log('Birth date picker changed:', event.type, selectedDate);
    
    // On iOS with spinner, we use custom buttons, so just update the temp value
    if (Platform.OS === 'ios') {
      if (selectedDate) {
        setSelectedBirthDate(selectedDate);
      }
      return; // Don't close picker, let Done/Cancel buttons handle it
    }
    
    // Android: Handle dismissal (user cancelled)
    if (event.type === 'dismissed') {
      setShowBirthDatePicker(false);
      return;
    }
    
    // Android: Handle date selection (user pressed OK)
    if (event.type === 'set' && selectedDate) {
      setSelectedBirthDate(selectedDate);
      const formatted = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
      console.log('Formatted birth date:', formatted);
      setBirthDate(formatted);
      const endDate = (!isPawPal && datePassed) ? datePassed : undefined;
      const calculatedAge = calculateAge(formatted, endDate);
      if (calculatedAge) {
        setAge(calculatedAge);
      }
      setShowBirthDatePicker(false);
    }
  };

  const onDatePassedPickerChange = (event, selectedDate) => {
    console.log('Date passed picker changed:', event.type, selectedDate);
    
    // On iOS with spinner, we use custom buttons, so just update the temp value
    if (Platform.OS === 'ios') {
      if (selectedDate) {
        setSelectedDatePassed(selectedDate);
      }
      return; // Don't close picker, let Done/Cancel buttons handle it
    }
    
    // Android: Handle dismissal (user cancelled)
    if (event.type === 'dismissed') {
      setShowDatePassedPicker(false);
      return;
    }
    
    // Android: Handle date selection (user pressed OK)
    if (event.type === 'set' && selectedDate) {
      setSelectedDatePassed(selectedDate);
      const formatted = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
      console.log('Formatted date passed:', formatted);
      setDatePassed(formatted);
      setShowDatePassedPicker(false);
    }
  };

  // Auto-calculate age when component mounts or birthDate/datePassed changes
  useEffect(() => {
    console.log('useEffect triggered - birthDate:', birthDate, 'datePassed:', datePassed, 'isPawPal:', isPawPal);
    if (birthDate && birthDate.trim()) {
      // For memorial pets, use datePassed as end date; for living pets, use today
      const endDate = (!isPawPal && datePassed) ? datePassed : undefined;
      const calculatedAge = calculateAge(birthDate, endDate);
      console.log('Calculated age in useEffect:', calculatedAge);
      if (calculatedAge) {
        setAge(calculatedAge);
      }
    } else {
      setAge('');
    }
  }, [birthDate, datePassed, isPawPal]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    console.log('pickImage called');
    Alert.alert(
      'Upload Pet Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              console.log('Requesting camera permissions...');
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              console.log('Camera permission result:', permissionResult);
              
              if (!permissionResult.granted) {
                Alert.alert(
                  'Permission Required',
                  'Please allow camera access to take a photo.'
                );
                return;
              }

              console.log('Launching camera...');
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              console.log('Camera result:', result);
              if (!result.canceled) {
                console.log('Setting photo to:', result.assets[0].uri);
                setPhoto(result.assets[0].uri);
                Alert.alert('Success', 'Photo added successfully!');
              }
            } catch (error) {
              console.error('Camera error:', error);
              Alert.alert('Error', `Failed to take photo: ${error.message}`);
            }
          }
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              console.log('Requesting media library permissions...');
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              console.log('Media library permission result:', permissionResult);
              
              if (!permissionResult.granted) {
                Alert.alert(
                  'Permission Required',
                  'Please allow access to your photo library to upload a pet photo.'
                );
                return;
              }

              console.log('Launching image picker...');
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              console.log('Image picker result:', result);
              if (!result.canceled) {
                console.log('Setting photo to:', result.assets[0].uri);
                setPhoto(result.assets[0].uri);
                Alert.alert('Success', 'Photo added successfully!');
              }
            } catch (error) {
              console.error('Image picker error:', error);
              Alert.alert('Error', `Failed to pick image: ${error.message}`);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleSave = () => {
    // Simple validation
    if (!name || name.trim().length < 2) {
      Alert.alert('Required', 'Please enter a pet name (at least 2 characters)');
      return;
    }

    // Create pet data
    const petData = {
      id: isNewPet ? Date.now().toString() : (pet?.id || Date.now().toString()),
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      traits: traits.trim(),
      habits: habits.trim(),
      photo,
      birthDate: birthDate.trim(),
      age: age.trim(),
      datePassed: datePassed.trim(),
      isPawPal,
      createdAt: Date.now()
    };

    // Save pet
    savePet(petData);
    
    // Complete onboarding if new pet
    if (isNewPet) {
      completeOnboarding();
    }
    
    // Show success and navigate
    Alert.alert('Success!', 'Pet profile saved!', [
      {
        text: 'OK',
        onPress: () => {
          if (navigation) {
            if (isNewPet) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            } else {
              navigation.goBack();
            }
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isNewPet ? (isPawPal ? 'Create Your PawPal' : 'Fur-ever Bestfriend') : 'Pet Profile'}
        </Text>
        
        {isNewPet && (
          <Text style={styles.subtitle}>
            {isPawPal 
              ? 'Create a new virtual companion to chat and play with'
              : 'A place to cherish your pet\'s memories.'}
          </Text>
        )}

        <Text style={styles.sectionHeader}>📸 Pet Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoUploadButton} onPress={pickImage}>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Text style={styles.changePhotoText}>Tap to change photo</Text>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Add Pet Photo</Text>
              <Text style={styles.uploadHint}>Take a photo or choose from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pet Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter pet's name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: null });
              }
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Species</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dog, Cat, Rabbit"
            placeholderTextColor={colors.subtext}
            value={species}
            onChangeText={setSpecies}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TouchableOpacity
            style={[styles.input, styles.breedButton]}
            onPress={() => setShowBreedSelector(true)}
          >
            <View style={styles.breedButtonContent}>
              {breed && getBreedById(breed) && (
                <Text style={styles.breedEmoji}>{getBreedById(breed).emoji}</Text>
              )}
              <Text style={breed && getBreedById(breed) ? styles.breedText : styles.breedPlaceholder}>
                {breed && getBreedById(breed) ? getBreedById(breed).name : 'Select breed'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <BreedSelector
          visible={showBreedSelector}
          selectedBreed={breed}
          onSelectBreed={setBreed}
          onClose={() => setShowBreedSelector(false)}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{isPawPal ? 'Birth Date / Gotcha Day' : 'Birth Date / Gotcha Day'}</Text>
          <View style={[styles.input, styles.dateButton]}>
            <Text style={birthDate ? styles.dateText : styles.datePlaceholder}>
              {birthDate || 'Select date'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('Birth date button pressed');
                setShowBirthDatePicker(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          {showBirthDatePicker && (
            <View>
              <DateTimePicker
                value={selectedBirthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onBirthDatePickerChange}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity 
                    style={[styles.datePickerButton, styles.cancelButton]}
                    onPress={() => setShowBirthDatePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.datePickerButton, styles.doneButton]}
                    onPress={() => {
                      const formatted = `${selectedBirthDate.getMonth() + 1}/${selectedBirthDate.getDate()}/${selectedBirthDate.getFullYear()}`;
                      setBirthDate(formatted);
                      const endDate = (!isPawPal && datePassed) ? datePassed : undefined;
                      const calculatedAge = calculateAge(formatted, endDate);
                      if (calculatedAge) {
                        setAge(calculatedAge);
                      }
                      setShowBirthDatePicker(false);
                    }}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {!isPawPal && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age at time of passing (auto-calculated)</Text>
            <TextInput
              key={age}
              style={[styles.input, { backgroundColor: '#f5f5f5', color: '#666' }]}
              placeholder="Enter birth date and remembered date to calculate"
              placeholderTextColor={colors.subtext}
              value={age}
              editable={false}
            />
            <Text style={styles.hint}>Calculated from birth date to remembered date</Text>
          </View>
        )}

        {!isPawPal && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remembered Since 🤍</Text>
            <View style={[styles.input, styles.dateButton]}>
              <Text style={datePassed ? styles.dateText : styles.datePlaceholder}>
                {datePassed || 'Select date'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Date passed button pressed, isPawPal:', isPawPal);
                  setShowDatePassedPicker(true);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            {showDatePassedPicker && (
              <View>
                <DateTimePicker
                  value={selectedDatePassed}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDatePassedPickerChange}
                  maximumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity 
                      style={[styles.datePickerButton, styles.cancelButton]}
                      onPress={() => setShowDatePassedPicker(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.datePickerButton, styles.doneButton]}
                      onPress={() => {
                        const formatted = `${selectedDatePassed.getMonth() + 1}/${selectedDatePassed.getDate()}/${selectedDatePassed.getFullYear()}`;
                        setDatePassed(formatted);
                        setShowDatePassedPicker(false);
                      }}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personality Traits</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Playful, loyal, gentle..."
            placeholderTextColor={colors.subtext}
            value={traits}
            onChangeText={setTraits}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Habits & Favorites</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Loved belly rubs, favorite toy, daily routines..."
            placeholderTextColor={colors.subtext}
            value={habits}
            onChangeText={setHabits}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {!premium && (
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumText}>
              🔒 Advanced pet customization available with Premium
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isNewPet ? '🐾 Save & Continue 🐾' : '💾 Save Changes'}
          </Text>
        </TouchableOpacity>
        
        <BackButton 
          label={isNewPet ? "Back" : "Cancel"}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
          onPress={() => {
            if (isNewPet) {
              // During onboarding, go back to pet mode selection
              navigation.navigate('PetModeSelection');
            } else {
              // When editing, just go back
              navigation.goBack();
            }
          }}
        />
      </ScrollView>
    </View>
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
    fontSize: 32,
    fontWeight: '800',
    color: '#FF9B50',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#2b2b2b',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  photoUploadButton: {
    alignSelf: 'center',
    marginBottom: 30,
    width: '100%',
  },
  uploadPlaceholder: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 5,
  },
  uploadHint: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoButton: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
    marginBottom: 5,
  },
  photoPlaceholderSubtext: {
    color: colors.subtext,
    fontSize: 14,
    fontWeight: '600',
  },
  photoPlaceholderHint: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breedButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breedEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  breedText: {
    fontSize: 16,
    color: colors.text,
  },
  breedPlaceholder: {
    fontSize: 16,
    color: colors.subtext,
  },
  chevron: {
    fontSize: 24,
    color: colors.subtext,
    fontWeight: '300',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: colors.subtext,
  },
  calendarIcon: {
    fontSize: 20,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  premiumInfo: {
    backgroundColor: '#fff9e6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  premiumText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF9B50',
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
    fontSize: 22,
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.muted,
    backgroundColor: '#f8f8f8',
  },
  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: colors.primary,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: colors.subtext,
    fontSize: 16,
  },
});
