import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function BannerAd({ style }: { style?: any }){
  const { premium } = useContext(AppContext);
  if(premium) return null;
  return (
    <View style={[styles.ad, style]}>
      <Text style={styles.text}>Ad placeholder — upgrade to Premium to remove ads</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ad:{height:60,backgroundColor:'#c9d6d6',alignItems:'center',justifyContent:'center',borderRadius:8,marginTop:8},
  text:{color:'#fff'}
});
