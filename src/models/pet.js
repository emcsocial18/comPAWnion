export function createPet({id, name, species, breed, traits, habits, photo, isPawPal = false, customization = null}){
  return {
    id: id || Date.now().toString(), 
    name, 
    species, 
    breed, 
    traits, 
    habits, 
    photo, 
    isPawPal,
    customization,
    createdAt: Date.now()
  };
}
