import React, {useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, LinearGradient, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import { colors } from '../theme';

const PET_VARIANT_IMAGES = {
  dog_1: require('../../assets/PawPal_Options/dog_1.png'),
  dog_2: require('../../assets/PawPal_Options/dog_2.png'),
  cat_1: require('../../assets/PawPal_Options/cat_1.jpg'),
  cat_2: require('../../assets/PawPal_Options/cat.png'),
  hamster_1: require('../../assets/PawPal_Options/hamster.png'),
  hamster_2: require('../../assets/PawPal_Options/hamster.png'),
  guinea_pig_1: require('../../assets/PawPal_Options/guinea_pig.png'),
  guinea_pig_2: require('../../assets/PawPal_Options/guinea_pig.png'),
  rabbit_1: require('../../assets/PawPal_Options/rabbit.png'),
  rabbit_2: require('../../assets/PawPal_Options/rabbit.png'),
};

export default function HomeScreen({navigation}){
  const { premium, pet, clearAllData } = useContext(AppContext);
  const { logout } = useAuth();

  const handleDevReset = async () => {
    Alert.alert(
      'DEV: Reset App',
      'Clear all data and return to onboarding?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            await clearAllData();
            await AsyncStorage.clear();
            Alert.alert('Reset Complete', 'App data cleared. Reloading...');
          }
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}> 
      {/* DEV: Reset Button */}
      <TouchableOpacity 
        style={styles.devResetButton}
        onPress={handleDevReset}
      >
        <Text style={styles.devResetText}>DEV: Reset to Onboarding</Text>
      </TouchableOpacity>

      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <View style={styles.petInfoRow}>
          {pet?.imageId && PET_VARIANT_IMAGES[pet.imageId] ? (
            <Image source={PET_VARIANT_IMAGES[pet.imageId]} style={styles.petPhoto} />
          ) : pet?.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.petPhoto} />
          ) : (
            <View style={styles.petPhotoPlaceholder}>
              <Text style={styles.petPhotoEmoji}>{pet?.isPawPal ? '🐾' : '💙'}</Text>
            </View>
          )}
          <View style={styles.petInfo}>
            <View style={styles.petNameRow}>
              <Text style={styles.petName}>{pet?.name || 'Your Pet'}</Text>
              {pet?.name && <Text style={styles.pawIcon}>🐾</Text>}
            </View>
            {pet?.species && <Text style={styles.petSpecies}>{pet.species}</Text>}
            {pet?.age && <Text style={styles.petAge}>{pet.age.replace(/old$/i, 'of love').replace(/^(\d+)/, '$1')}</Text>}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spend Time With {pet?.name || 'Your Pet'}</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.chatCard]}
            onPress={() => navigation.navigate('Chat')}
          >
            <View style={styles.iconRow}>
              <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.iconConnector}>→</Text>
              <Text style={styles.actionIcon}>🐾</Text>
            </View>
            <Text style={styles.actionTitle}>Heart to Paw</Text>
            <Text style={styles.actionSubtitle}>
              {pet?.isPawPal ? 'Your on-demand dose of pawsitivity.' : 'Because your bond never fades...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.letterCard]}
            onPress={() => navigation.navigate('DearPet')}
          >
            <View style={styles.overlappingIconContainer}>
              <Text style={styles.paperIcon}>📄</Text>
              <Text style={styles.paperHeartIcon}>💕</Text>
              <Text style={styles.handIcon}>✍️</Text>
            </View>
            <Text style={styles.actionTitle}>Dear {pet?.name}</Text>
            <Text style={styles.actionSubtitle}>A place to share your day, your thoughts, and your heart.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, pet?.isPawPal ? styles.pawpalTimeCard : styles.memoriesCard]}
            onPress={() => navigation.navigate(pet?.isPawPal ? 'PawPalTime' : 'Memories')}
          >
            <Text style={styles.actionIcon}>{pet?.isPawPal ? '🐾' : '📖'}</Text>
            <Text style={styles.actionTitle}>{pet?.isPawPal ? 'PawPal Time' : 'Memories'}</Text>
            <Text style={styles.actionSubtitle}>
              {pet?.isPawPal ? 'Feed, play, and bond!' : 'Your cherished moments'}
            </Text>
          </TouchableOpacity>

          {!pet?.isPawPal && (
            <TouchableOpacity 
              style={[styles.actionCard, styles.profileCard]}
              onPress={() => navigation.navigate('PetProfile')}
            >
              <Text style={styles.actionIcon}>🐾</Text>
              <Text style={styles.actionTitle}>Profile</Text>
              <Text style={styles.actionSubtitle}>About your pet</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Switch Pet Section */}
      <TouchableOpacity 
        style={styles.switchPetButton}
        onPress={() => navigation.navigate('PetModeSelection')}
      >
        <Text style={styles.switchPetButtonText}>➕ Add Another Pet</Text>
      </TouchableOpacity>

      {/* Premium Features */}
      {!pet?.isPawPal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meaningful Spaces</Text>
          <Text style={styles.sectionSubtitle}>Unlock deeper ways to remember</Text>
          
          <TouchableOpacity 
            style={[styles.featureCard, !premium && styles.lockedCard]}
            onPress={() => navigation.navigate('MemoryWalks')}
          >
            <View style={styles.featureContent}>
              <Text style={styles.featureIcon}>{premium ? '🚶' : '🔒'}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Memory Walks</Text>
                <Text style={styles.featureDescription}>
                  Walk through your memories, one moment at a time
                </Text>
              </View>
            </View>
            {!premium && <Text style={styles.premiumBadge}>Explore Premium</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, !premium && styles.lockedCard]}
            onPress={() => navigation.navigate('RainbowBridge')}
          >
            <View style={styles.featureContent}>
              <Text style={styles.featureIcon}>{premium ? '🌈' : '🔒'}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Rainbow Bridge</Text>
                <Text style={styles.featureDescription}>
                  A peaceful place to honor their memory
                </Text>
              </View>
            </View>
            {!premium && <Text style={styles.premiumBadge}>Explore Premium</Text>}
          </TouchableOpacity>
        </View>
      )}

      <AdBanner style={styles.ad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#E8F4F8',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  petPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFE8D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  petPhotoEmoji: {
    fontSize: 36,
  },
  petInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pawIcon: {
    fontSize: 16,
    marginLeft: 6,
    opacity: 0.7,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  petName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#DAA520',
  },
  petSpecies: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  petAge: {
    fontSize: 13,
    color: '#8B7355',
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chatCard: {
    backgroundColor: '#E8F4FD',
  },
  letterCard: {
    backgroundColor: '#FFE8F5',
  },
  memoryCard: {
    backgroundColor: '#FFEEE8',
  },
  memoriesCard: {
    backgroundColor: '#FFF9E8',
  },
  pawpalTimeCard: {
    backgroundColor: '#E8F9F0',
  },
  profileCard: {
    backgroundColor: '#F3F0F8',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconConnector: {
    fontSize: 20,
    color: '#FF9B50',
    marginHorizontal: 8,
    fontWeight: '700',
  },
  heartIcon: {
    fontSize: 28,
    marginBottom: 0,
  },
  overlappingIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  paperIcon: {
    fontSize: 44,
    position: 'absolute',
  },
  paperHeartIcon: {
    fontSize: 14,
    position: 'absolute',
    left: 10,
    bottom: 12,
  },
  handIcon: {
    fontSize: 28,
    position: 'absolute',
    left: 18,
    top: 10,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockedCard: {
    opacity: 0.7,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  premiumBadge: {
    backgroundColor: '#FFE87C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    fontSize: 11,
    fontWeight: '600',
    color: '#8B6914',
  },
  ad: {
    marginTop: 12,
  },
  devResetButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  devResetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  switchPetButton: {
    marginTop: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
