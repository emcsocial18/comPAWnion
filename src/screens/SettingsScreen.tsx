import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function SettingsScreen({ navigation }: any){
  const { premium, togglePremium, pet } = useContext(AppContext);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.badge, premium ? styles.premiumBadge : styles.freeBadge]}>
              <Text style={styles.badgeText}>{premium ? 'Premium' : 'Free'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FFD700' }]} 
            onPress={() => togglePremium()}
          >
            <Text style={styles.buttonText}>
              {premium ? 'Deactivate Premium' : 'Activate Premium'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { marginTop: 12 }]} 
            onPress={() => {
              Alert.alert(
                'Change Email',
                'Email change feature coming soon!',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={styles.buttonText}>Change Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { marginTop: 12 }]} 
            onPress={() => {
              Alert.alert(
                'Change Password',
                'Password change feature coming soon!',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pet Management</Text>
        
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation?.navigate('PetList')}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Pets</Text>
              <Text style={styles.menuSubtitle}>Manage all your pets</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Made with</Text>
            <Text style={styles.infoValue}>💙 by comPAWnion</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Logout functionality will be available in the next update!'
          );
        }}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf6',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#2b2b2b',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
  freeBadge: {
    backgroundColor: '#e0e0e0',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2b2b',
  },
  button: {
    backgroundColor: '#FF9B50',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#2b2b2b',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
