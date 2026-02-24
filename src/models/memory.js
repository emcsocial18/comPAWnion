export function createMemory({id, petId, text, photo, video, date, isChatMessage = false}){
  return {
    id: id || Date.now().toString(), 
    petId, 
    text, 
    photo,
    video, 
    date: date || new Date().toISOString(),
    isChatMessage
  };
}
