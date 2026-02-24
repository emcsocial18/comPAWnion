import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

interface BackButtonProps {
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

export default function BackButton({ 
  label = '← Back', 
  style, 
  textStyle,
  onPress 
}: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    console.log('BackButton pressed');
    console.log('Has onPress prop:', !!onPress);
    console.log('Can go back:', navigation.canGoBack());
    
    if (onPress) {
      console.log('Calling custom onPress');
      onPress();
    } else if (navigation.canGoBack()) {
      console.log('Navigating back');
      navigation.goBack();
    } else {
      console.log('Cannot go back - no navigation history');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.muted,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
