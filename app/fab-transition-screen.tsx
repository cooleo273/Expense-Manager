import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fabTransitionStyles } from '@/styles/fab-transition.styles';

const { height: screenHeight } = Dimensions.get('window');

export default function FABTransitionScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const redWipeHeight = useSharedValue(0);
  const bottomSheetTranslateY = useSharedValue(screenHeight);

  const redWipeAnimatedStyle = useAnimatedStyle(() => ({
    height: redWipeHeight.value,
  }));

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomSheetTranslateY.value }],
  }));

  const handleFABPress = async () => {
    // Show Bottom Sheet
    bottomSheetTranslateY.value = withTiming(0, { duration: 100 });
    setShowBottomSheet(true);

    // Delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Red Wipe
    redWipeHeight.value = withTiming(screenHeight, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onTransitionComplete)();
      }
    });
  };

  const onTransitionComplete = () => {
    // Placeholder for navigation or next action
    console.log('Transition complete - navigate to next screen');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}>
        <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <ThemedText type="title">Primary Content</ThemedText>
          <ThemedText>This is the main scrollable content area.</ThemedText>
        </ThemedView>
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: palette.tint }]} onPress={handleFABPress}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {showBottomSheet && (
        <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
          <ThemedView style={[styles.bottomSheetContent, { backgroundColor: palette.card }]}>
            <ThemedText type="subtitle">Template: Large Commercial Bulbula!</ThemedText>
            <TouchableOpacity style={[styles.transferButton, { backgroundColor: palette.tint }]}>
              <ThemedText style={{ color: 'white' }}>Transfer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>
      )}

      <Animated.View style={[styles.redWipe, redWipeAnimatedStyle]} />
    </SafeAreaView>
  );
}

const styles = fabTransitionStyles;