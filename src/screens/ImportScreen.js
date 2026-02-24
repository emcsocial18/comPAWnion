import React, {useState, useContext} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';

export default function ImportScreen({navigation}){
  const [text, setText] = useState('');
  const { savePet, addMemory, togglePremium } = useContext(AppContext);

  function doImport(){
    try{
      const data = JSON.parse(text);
      if(data.pet) savePet(data.pet);
      if(Array.isArray(data.memories)){
        // add memories (replace existing by adding each)
        data.memories.slice().reverse().forEach(m=> addMemory(m));
      }
      if(typeof data.premium === 'boolean') togglePremium(data.premium);
      Alert.alert('Import complete');
      navigation.goBack();
    }catch(e){
      Alert.alert('Import failed','Invalid JSON');
    }
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Import Data</Text>
      <Text style={styles.sub}>Paste a JSON backup below to restore pet and memories.</Text>
      <TextInput value={text} onChangeText={setText} multiline style={styles.input} placeholder="Paste JSON here" />
      <TouchableOpacity style={styles.import} onPress={doImport}><Text style={{color:'#fff'}}>Import</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fffaf6',padding:12},
  header:{fontSize:20,fontWeight:'600',marginBottom:8},
  sub:{color:'#666',marginBottom:8},
  input:{backgroundColor:'#fff',padding:12,borderRadius:8,minHeight:200,textAlignVertical:'top'},
  import:{backgroundColor:'#8eb6b9',padding:12,alignItems:'center',borderRadius:8,marginTop:12}
});
