import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from '../utils/storage';
import { useAuth } from './AuthContext';

export const AppContext = createContext(null);

export function AppProvider({children}){
  const { user } = useAuth();
  const [premium, setPremium] = useState(false);
  const [pet, setPet] = useState(null); // Currently selected pet
  const [pets, setPets] = useState([]); // Array of all pets
  const [memories, setMemories] = useState([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use userId as part of the storage key
  function getUserKey(base) {
    return user && user.uid ? `${base}_${user.uid}` : base;
  }

  useEffect(()=>{ (async ()=>{
    try{
      const p = await AsyncStorage.getItem(KEYS.PREMIUM);
      setPremium(p === '1');
      const rawPet = await AsyncStorage.getItem(getUserKey(KEYS.PET));
      if(rawPet) setPet(JSON.parse(rawPet));
      // Load all pets for this user
      const rawPets = await AsyncStorage.getItem(getUserKey('@pets'));
      setPets(rawPets ? JSON.parse(rawPets) : []);
      const rawMem = await AsyncStorage.getItem(getUserKey(KEYS.MEMORIES));
      setMemories(rawMem ? JSON.parse(rawMem) : []);
      const onb = await AsyncStorage.getItem(KEYS.ONBOARDING);
      setOnboardingDone(onb === '1');
    }catch(e){}
    finally {
      setLoading(false);
    }
  })(); },[user]);

  async function togglePremium(next){
    const val = typeof next === 'boolean' ? next : !premium;
    setPremium(val);
    try{ await AsyncStorage.setItem(KEYS.PREMIUM, val? '1':'0'); }catch(e){}
  }

  async function savePet(p){
    setPet(p);
    try{ 
      await AsyncStorage.setItem(getUserKey(KEYS.PET), JSON.stringify(p)); 
      // Also add to pets array if new
      const existingIndex = pets.findIndex(pet => pet.id === p.id);
      let updatedPets;
      if (existingIndex >= 0) {
        updatedPets = [...pets];
        updatedPets[existingIndex] = p;
      } else {
        updatedPets = [...pets, p];
      }
      setPets(updatedPets);
      await AsyncStorage.setItem(getUserKey('@pets'), JSON.stringify(updatedPets));
    }catch(e){}
  }

  async function switchPet(selectedPet){
    setPet(selectedPet);
    try{ await AsyncStorage.setItem(getUserKey(KEYS.PET), JSON.stringify(selectedPet)); }catch(e){}
  }

  async function deletePet(petId){
    const updatedPets = pets.filter(p => p.id !== petId);
    setPets(updatedPets);
    try{ 
      await AsyncStorage.setItem(getUserKey('@pets'), JSON.stringify(updatedPets)); 
      // If deleted current pet, switch to another or clear
      if (pet?.id === petId) {
        const newCurrent = updatedPets[0] || null;
        setPet(newCurrent);
        if (newCurrent) {
          await AsyncStorage.setItem(getUserKey(KEYS.PET), JSON.stringify(newCurrent));
        } else {
          await AsyncStorage.removeItem(getUserKey(KEYS.PET));
        }
      }
    }catch(e){}
  }

  async function addMemory(item){
    const next = [item, ...memories];
    setMemories(next);
    try{ await AsyncStorage.setItem(KEYS.MEMORIES, JSON.stringify(next)); }catch(e){}
  }

  async function completeOnboarding(){
    setOnboardingDone(true);
    try{ await AsyncStorage.setItem(KEYS.ONBOARDING, '1'); }catch(e){}
  }

  async function clearAllData(){
    setPet(null);
    setPets([]);
    setMemories([]);
    setPremium(false);
    setOnboardingDone(false);
    try{
      await AsyncStorage.removeItem(getUserKey(KEYS.PET));
      await AsyncStorage.removeItem(getUserKey('@pets'));
      await AsyncStorage.removeItem(getUserKey(KEYS.MEMORIES));
      await AsyncStorage.removeItem(KEYS.PREMIUM);
      await AsyncStorage.removeItem(KEYS.ONBOARDING);
    }catch(e){}
  }

  return (
    <AppContext.Provider value={{
      premium, 
      togglePremium, 
      pet, 
      savePet,
      pets,
      switchPet,
      deletePet,
      memories, 
      addMemory, 
      onboardingDone, 
      completeOnboarding,
      clearAllData,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}
