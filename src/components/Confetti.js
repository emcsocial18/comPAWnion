import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const confettiColors = ['#FF9B50', '#FFD4B8', '#FFE8D6', '#FFF9F0', '#2b2b2b'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Confetti({ visible }) {
  const confettiItems = Array.from({ length: 24 }, (_, i) => ({
    key: i,
    left: randomInt(0, width - 24),
    color: confettiColors[randomInt(0, confettiColors.length - 1)],
    delay: randomInt(0, 400),
    duration: randomInt(1200, 2200),
  }));

  const anims = useRef(confettiItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      anims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: height,
          duration: confettiItems[i].duration,
          delay: confettiItems[i].delay,
          useNativeDriver: true,
        }).start();
      });
    } else {
      anims.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width, height, pointerEvents: 'none' }}>
      {confettiItems.map((item, i) => (
        <Animated.View
          key={item.key}
          style={{
            position: 'absolute',
            left: item.left,
            top: 0,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: item.color,
            opacity: 0.85,
            transform: [{ translateY: anims[i] }],
          }}
        />
      ))}
    </View>
  );
}
