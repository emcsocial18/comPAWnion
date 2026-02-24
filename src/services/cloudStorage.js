import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Sync pets to cloud
export async function syncPetsToCloud(userId, pets) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    const userPetsRef = doc(db, 'users', userId, 'data', 'pets');
    await setDoc(userPetsRef, {
      pets: pets,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error syncing pets to cloud:', error);
    return { success: false, error: error.message };
  }
}

// Get pets from cloud
export async function getPetsFromCloud(userId) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    const userPetsRef = doc(db, 'users', userId, 'data', 'pets');
    const docSnap = await getDoc(userPetsRef);
    
    if (docSnap.exists()) {
      return { success: true, pets: docSnap.data().pets || [] };
    } else {
      return { success: true, pets: [] };
    }
  } catch (error) {
    console.error('Error getting pets from cloud:', error);
    return { success: false, error: error.message };
  }
}

// Sync memories to cloud
export async function syncMemoriesToCloud(userId, petId, memories) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    const petMemoriesRef = doc(db, 'users', userId, 'pets', petId);
    await setDoc(petMemoriesRef, {
      memories: memories,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error syncing memories to cloud:', error);
    return { success: false, error: error.message };
  }
}

// Get memories from cloud
export async function getMemoriesFromCloud(userId, petId) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    const petMemoriesRef = doc(db, 'users', userId, 'pets', petId);
    const docSnap = await getDoc(petMemoriesRef);
    
    if (docSnap.exists()) {
      return { success: true, memories: docSnap.data().memories || [] };
    } else {
      return { success: true, memories: [] };
    }
  } catch (error) {
    console.error('Error getting memories from cloud:', error);
    return { success: false, error: error.message };
  }
}

// Sync all data to cloud
export async function syncAllDataToCloud(userId, pets, currentPetId, memories) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    // Sync pets
    await syncPetsToCloud(userId, pets);
    
    // Sync memories for current pet
    if (currentPetId) {
      await syncMemoriesToCloud(userId, currentPetId, memories);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing all data:', error);
    return { success: false, error: error.message };
  }
}

// Get all data from cloud
export async function getAllDataFromCloud(userId) {
  if (!userId) return { success: false, error: 'Not authenticated' };
  
  try {
    const petsResult = await getPetsFromCloud(userId);
    
    if (!petsResult.success) {
      return petsResult;
    }
    
    return { 
      success: true, 
      pets: petsResult.pets
    };
  } catch (error) {
    console.error('Error getting all data from cloud:', error);
    return { success: false, error: error.message };
  }
}
