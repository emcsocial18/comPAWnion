import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';

export default function AnimatedBreedPreview({ emoji }) {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.25,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [emoji]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Text
        style={{
          fontSize: 80,
          transform: [{ scale: bounceAnim }],
        }}
      >
        {emoji}
      </Animated.Text>
    </View>
  );
}
