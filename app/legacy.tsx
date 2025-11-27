import React from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function LegacyScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}> 
      <Image source={require('../assets/images/expense-manager.jpg')} style={styles.image} resizeMode="cover" />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Close legacy view"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 12 }]}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color={palette.text} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 24,
    zIndex: 1000,
  },
});
