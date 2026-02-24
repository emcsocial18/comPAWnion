import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function SettingsScreen({ navigation }) {
  const { premium, togglePremium, pet, memories, clearAllData: clearAppData } = useContext(AppContext);
  const { user, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleDonation = () => {
    Alert.alert(
      'Support comPAWnion',
      'Thank you for considering a donation! This helps us keep the app running and ad-free for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate',
          onPress: () => {
            Alert.alert('Thank you!', 'Donation feature coming soon');
          },
        },
      ]
    );
  };

  const handleUpgradePremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Remove ads and unlock exclusive features:\n\n• Ad-free experience\n• Pet customization\n• Memory Walks\n• Rainbow Bridge memorial space',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            togglePremium(true);
            Alert.alert('Welcome to Premium!', 'All features are now unlocked');
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        pet,
        memories,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Share the data
      await Share.share({
        message: jsonString,
        title: 'comPAWnion Backup',
      });

      Alert.alert('Success', 'Data exported! Save this backup in a safe place.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your data including pet profile, memories, and sign you out. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Logout first
              await logout();
              // Clear all app data
              await clearAppData();
              // Clear everything from storage just to be sure
              await AsyncStorage.clear();
              Alert.alert('Cleared', 'All data has been deleted.', [
                { text: 'OK', onPress: () => {
                  // The navigation will automatically go to Onboarding due to state changes
                }}
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Pets</Text>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('PetList')}
        >
          <Text style={styles.cardTitle}>🐾 Manage Pets</Text>
          <Text style={styles.cardSubtext}>
            Switch between pets or add new ones
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Status</Text>
        <View style={styles.card}>
          <Text style={styles.statusText}>
            {premium ? '✓ Premium Active' : 'Free Plan'}
          </Text>
          {!premium && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePremium}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
          {premium && (
            <Text style={styles.premiumInfo}>
              Thank you for supporting comPAWnion! 💙
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.card} onPress={handleDonation}>
          <Text style={styles.cardTitle}>💝 Make a Donation</Text>
          <Text style={styles.cardSubtext}>
            Support the development of comPAWnion
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity 
          style={styles.card} 
          onPress={exportData}
          disabled={isExporting || !pet}
        >
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>📤 Export Backup</Text>
              <Text style={styles.cardSubtext}>
                Save your pet and memories to a backup file
              </Text>
            </View>
            {isExporting && <ActivityIndicator color={colors.primary} />}
          </View>
        </TouchableOpacity>
        
        {!pet && (
          <Text style={styles.warningText}>
            Create a pet profile to enable data export
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ad Policy</Text>
          <Text style={styles.cardSubtext}>
            Free users see small banner ads. Premium removes all ads and unlocks
            exclusive features.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={[styles.card, styles.dangerCard]}
          onPress={handleClearAllData}
        >
          <Text style={[styles.cardTitle, styles.dangerText]}>Clear All Data</Text>
          <Text style={styles.cardSubtext}>
            Delete all data and start fresh
          </Text>
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Signed in as:</Text>
            <Text style={styles.cardSubtext}>{user.email}</Text>
          </View>
          <TouchableOpacity
            style={[styles.card, styles.dangerCard]}
            onPress={async () => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out? Your data will be cleared.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      const result = await logout();
                      if (result.success) {
                        // Clear app data when signing out
                        await clearAppData();
                      } else {
                        Alert.alert('Error', result.error || 'Failed to sign out');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.cardTitle, styles.dangerText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.version}>comPAWnion v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.subtext,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  cardSubtext: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumInfo: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  dangerText: {
    color: '#e74c3c',
  },
  warningText: {
    fontSize: 12,
    color: '#e67e22',
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 10,
  },
  version: {
    textAlign: 'center',
    color: colors.subtext,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
