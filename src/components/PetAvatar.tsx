import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
};

const PetAvatar: React.FC<Props> = ({ uri, size = 96, onPress }) => {
  const style = [styles.container, { width: size, height: size, borderRadius: size/2 }];
  if(onPress) return (
    <TouchableOpacity onPress={onPress} style={style as any}>
      {uri ? <Image source={{ uri }} style={styles.image} /> : <Text style={styles.emoji}>🐾</Text>}
    </TouchableOpacity>
  );
  return (
    <View style={style as any}>
      {uri ? <Image source={{ uri }} style={styles.image} /> : <Text style={styles.emoji}>🐾</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container:{backgroundColor:'#eee',alignItems:'center',justifyContent:'center',overflow:'hidden'},
  image:{width:'100%',height:'100%'},
  emoji:{fontSize:32}
});

export default PetAvatar;
