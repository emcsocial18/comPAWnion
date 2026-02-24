import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    const isFirebaseConfigured = auth.config.apiKey !== 'YOUR_API_KEY';
    
    if (!isFirebaseConfigured) {
      // Local mode - check for stored local user
      AsyncStorage.getItem('@localUser').then(storedUser => {
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      });
      return;
    }
    
    // Firebase mode - listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      
      if (firebaseUser) {
        // Store user ID for offline mode
        await AsyncStorage.setItem('@userId', firebaseUser.uid);
      } else {
        await AsyncStorage.removeItem('@userId');
      }
    });

    return unsubscribe;
  }, []);

  async function signup(email, password) {
    try {
      // Check if Firebase is configured
      const isFirebaseConfigured = auth.config.apiKey !== 'YOUR_API_KEY';
      
      if (!isFirebaseConfigured) {
        // Local mode - create new user
        const localUser = {
          uid: `local_${Date.now()}`,
          email: email,
          displayName: email.split('@')[0],
        };
        await AsyncStorage.setItem('@localUser', JSON.stringify(localUser));
        await AsyncStorage.setItem('@userId', localUser.uid);
        setUser(localUser);
        return { success: true, user: localUser };
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let message = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      return { success: false, error: message };
    }
  }

  async function login(email, password) {
    try {
      // Check if Firebase is configured
      const isFirebaseConfigured = auth.config.apiKey !== 'YOUR_API_KEY';
      
      if (!isFirebaseConfigured) {
        // Local mode - check local storage
        const storedUser = await AsyncStorage.getItem('@localUser');
        if (storedUser) {
          const localUser = JSON.parse(storedUser);
          setUser(localUser);
          return { success: true, user: localUser };
        }
        return { success: false, error: 'No local account found. Please sign up first.' };
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let message = 'Failed to sign in';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      return { success: false, error: message };
    }
  }

  async function logout() {
    try {
      const isFirebaseConfigured = auth.config.apiKey !== 'YOUR_API_KEY';
      
      if (!isFirebaseConfigured) {
        // Local mode
        await AsyncStorage.removeItem('@localUser');
        await AsyncStorage.removeItem('@userId');
        setUser(null);
        return { success: true };
      }
      
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to sign out' };
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
