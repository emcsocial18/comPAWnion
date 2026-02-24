export const KEYS = {
  PREMIUM: 'premium_active',
  PET: 'pet_profile',
  MEMORIES: 'memories',
  ONBOARDING: 'onboarding_done',
  PET_TYPE: 'pet_type'
};

export async function saveJSON(key, value, AsyncStorage){
  try{ await AsyncStorage.setItem(key, JSON.stringify(value)); }catch(e){}
}

export async function loadJSON(key, AsyncStorage){
  try{ const raw = await AsyncStorage.getItem(key); return raw? JSON.parse(raw): null; }catch(e){ return null; }
}
