import React, { useContext, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../theme';
import { AppContext } from '../context/AppContext';

// Updated: 2026-02-09 - NEW DESIGN
const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({navigation}){
  const { completeOnboarding } = useContext(AppContext);
  const [videoError, setVideoError] = useState(false);

  async function handleGetStarted(){
    await completeOnboarding();
    if (navigation) {
      navigation.replace('Login');
    }
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Video Background */}
      {!videoError ? (
        <Video
          source={require('../../assets/intro.mp4')}
          style={styles.videoBackground}
          resizeMode={ResizeMode.STRETCH}
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
          onError={(error) => {
            console.log('Video load error:', error);
            setVideoError(true);
          }}
          onLoad={() => console.log('Video loaded successfully')}
        />
      ) : (
        <View style={styles.videoBackground}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>🐾</Text>
            <Text style={styles.placeholderText}>comPAWnion</Text>
          </View>
        </View>
      )}
      
      {/* Gradient at bottom only */}
      <View style={styles.bottomGradient} />
      
      {/* Welcome text positioned at top over logo */}
      <View style={styles.topContent}>
        <Text style={styles.title}>Welcome to</Text>
      </View>
      
      {/* Subtitle positioned in middle between rainbow and kids */}
      <View style={styles.middleContent}>
        <Text style={styles.subtitle}>Your companion for cherishing pet memories and creating meaningful moments together 💛</Text>
      </View>
      
      {/* Content positioned at bottom */}
      <View style={styles.bottomContent}>
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>🐾 Let's Paw! 🐾</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.45,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE8D6',
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF9B50',
  },
  topContent: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  middleContent: {
    position: 'absolute',
    top: height * 0.31,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    alignItems: 'center',
    zIndex: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  bottomContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 30,
    paddingBottom: 50,
    zIndex: 3,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    lineHeight: 17,
  },
  getStartedButton: {
    backgroundColor: '#FF9B50',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  getStartedText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
