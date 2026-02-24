import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function ExportScreen(){
  const { pet, memories, premium } = useContext(AppContext);
  const data = { pet, memories, premium };
  const json = JSON.stringify(data, null, 2);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Export Data</Text>
      <Text style={styles.sub}>Copy the JSON below to save a backup.</Text>
      <ScrollView style={styles.box} contentContainerStyle={{padding:12}}>
        <Text selectable style={styles.json}>{json}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.done} onPress={()=>{ /* go back handled by nav */ }}>
        <Text style={{color:'#fff'}}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#fffaf6',padding:12},
  header:{fontSize:20,fontWeight:'600',marginBottom:8},
  sub:{color:'#666',marginBottom:8},
  box:{flex:1,backgroundColor:'#fff',borderRadius:8,borderWidth:1,borderColor:'#eee'},
  json:{fontFamily: 'monospace', color:'#222'},
  done:{backgroundColor:'#8eb6b9',padding:12,alignItems:'center',borderRadius:8,marginTop:12}
});
