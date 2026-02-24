import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { AppContext } from '../context/AppContext';

export default function PetModeSelectionScreen({ navigation }) {
  const { pet, pets } = useContext(AppContext);

  function handleRememberPet() {
    if (navigation) {
      navigation.replace('PetProfile', { isNewPet: true, mode: 'remember' });
    }
  }

  function handleCreateVirtual() {
    if (navigation) {
      navigation.replace('CreateVirtualPawPal');
    }
  }

  function handleGoToHome() {
    if (navigation && pet) {
      navigation.replace('Main');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/comPAWnion Logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.greeting}>Hey, paw-some human!</Text>
        <Text style={styles.subtitle}>How would you like to begin?</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionCard, styles.rememberCard]} 
          onPress={handleRememberPet}
        >
          <Video 
            source={require('../../assets/fureverbestfriend.mp4')} 
            style={styles.optionImage}
            resizeMode={ResizeMode.STRETCH}
            shouldPlay={true}
            isLooping={true}
            isMuted={true}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, styles.virtualCard]} 
          onPress={handleCreateVirtual}
        >
          <Video 
            source={require('../../assets/virtualpawpal.mp4')} 
            style={styles.optionImage}
            resizeMode={ResizeMode.STRETCH}
            shouldPlay={true}
            isLooping={true}
            isMuted={true}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>Additional pets can be added anytime.</Text>
      
      {pet && pets && pets.length > 0 && (
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleGoToHome}
        >
          <Text style={styles.homeButtonText}>Already have a pet? Go to Home →</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf6',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 450,
    height: 140,
    marginTop: 10,
    marginBottom: 0,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF9B50',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2b2b2b',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    color: '#666',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontWeight: '800',
  },
  optionsContainer: {
    gap: 24,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    height: 220,
  },
  rememberCard: {
    borderColor: '#B8A4D9',
  },
  virtualCard: {
    borderColor: '#4FC3F7',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  footerNote: {
    fontSize: 18,
    color: '#FF9B50',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  homeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#FF9B50',
  },
  homeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FF9B50',
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 14,
    color: '#FF9B50',
    fontWeight: '600',
    textAlign: 'center',
  },
});
