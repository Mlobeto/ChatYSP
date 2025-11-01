import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#0ea5e9', 
  text = 'Cargando...', 
  showText = true,
  style = 'spinner' // 'spinner', 'dots', 'pulse'
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (style === 'spinner') {
      // Animación de rotación continua
      const spinAnimation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    } else if (style === 'pulse') {
      // Animación de pulso
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else if (style === 'dots') {
      // Animación de puntos secuencial
      const createDotAnimation = (dotValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dotValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(600 - delay),
          ])
        );
      };

      const dotAnimations = dotValues.map((dotValue, index) =>
        createDotAnimation(dotValue, index * 200)
      );

      dotAnimations.forEach(animation => animation.start());

      return () => {
        dotAnimations.forEach(animation => animation.stop());
      };
    }
  }, [style, animatedValue, pulseValue, dotValues]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      case 'medium':
      default:
        return 30;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  };

  const renderSpinner = () => (
    <Animated.View
      style={{
        transform: [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    >
      <Ionicons name="refresh" size={getSize()} color={color} />
    </Animated.View>
  );

  const renderPulse = () => (
    <Animated.View
      className="rounded-full items-center justify-center"
      style={{
        transform: [{ scale: pulseValue }],
        width: getSize(),
        height: getSize(),
        backgroundColor: color,
      }}
    >
      <Ionicons name="ellipsis-horizontal" size={getSize() * 0.6} color="white" />
    </Animated.View>
  );

  const renderDots = () => (
    <View className="flex-row items-center space-x-2">
      {dotValues.map((dotValue, index) => (
        <Animated.View
          key={index}
          className="rounded-full"
          style={{
            opacity: dotValue,
            transform: [
              {
                scale: dotValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
            width: getSize() * 0.3,
            height: getSize() * 0.3,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );

  const renderLoadingAnimation = () => {
    switch (style) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <View className="items-center justify-center p-4">
      {renderLoadingAnimation()}
      
      {showText && text && (
        <Text className={`${getTextSize()} text-gray-600 mt-3 text-center font-medium`}>
          {text}
        </Text>
      )}
    </View>
  );
}

// Componente para pantalla completa de carga
export function FullScreenLoader({ 
  text = 'Cargando...', 
  subtitle = null,
  style = 'spinner',
  backgroundColor = 'bg-white'
}) {
  return (
    <View className={`flex-1 items-center justify-center ${backgroundColor}`}>
      <LoadingSpinner 
        size="large" 
        text={text} 
        style={style}
      />
      {subtitle && (
        <Text className="text-gray-500 text-sm text-center mt-2 px-8">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// Componente para overlay de carga
export function LoadingOverlay({ 
  visible, 
  text = 'Cargando...', 
  style = 'spinner' 
}) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-xl p-6 items-center min-w-[120px]">
        <LoadingSpinner 
          size="medium" 
          text={text} 
          style={style}
        />
      </View>
    </View>
  );
}