import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { AppContext } from '../context/AppContext';

export default function AdBanner({style}){
  const { premium } = useContext(AppContext);
  if(premium) return null;
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Support the app and remove ads with Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#c9d6d6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginTop: 8,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  }
});
