import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PremiumLock(){
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Premium Feature</Text>
      <Text style={styles.sub}>This feature is available for Premium users only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{flex:1,alignItems:'center',justifyContent:'center',padding:16,backgroundColor:'#fffaf6'},
  title:{fontSize:18,fontWeight:'700',marginBottom:8},
  sub:{color:'#666',textAlign:'center'}
});
