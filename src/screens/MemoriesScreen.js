import React, {useContext} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { AppContext } from '../context/AppContext';
import MemoryCard from '../components/MemoryCard';
import AdBanner from '../components/AdBanner';
import { colors } from '../theme';

export default function MemoriesScreen({navigation}){
  const { memories, premium } = useContext(AppContext);

  return (
    <View style={[styles.container,{backgroundColor: colors.background}] }>
      <Text style={[styles.header,{color: colors.text}]}>Memories</Text>
      {memories.length === 0 ? (
        <View style={{padding:12}}><Text style={{color:colors.subtext}}>No memories yet — add one to begin</Text></View>
      ) : (
        <FlatList 
          data={memories} 
          keyExtractor={(i)=>i.id} 
          renderItem={({item})=> <MemoryCard memory={item} />} 
        />
      )}
      <TouchableOpacity style={[styles.add,{backgroundColor: colors.primary}]} onPress={()=>navigation.navigate('AddMemory')}>
        <Text style={{color:'#fff'}}>Add Memory</Text>
      </TouchableOpacity>
      <AdBanner style={styles.ad} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:12,backgroundColor:'#fffaf6'},
  header:{fontSize:20,fontWeight:'600',marginBottom:8},
  add:{backgroundColor:'#8eb6b9',padding:12,alignItems:'center',borderRadius:8,marginTop:12},
  ad:{height:60,backgroundColor:'#c9d6d6',alignItems:'center',justifyContent:'center',borderRadius:8,marginTop:8}
});
