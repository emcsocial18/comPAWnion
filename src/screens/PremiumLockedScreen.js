import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function PremiumLockedScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Locked Feature</Text>
      <Text style={styles.text}>This feature is available for Premium users only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:12,backgroundColor:'#fffaf6',justifyContent:'center',alignItems:'center'},
  header:{fontSize:20,fontWeight:'600',marginBottom:8},
  text:{color:'#666',textAlign:'center'}
});
