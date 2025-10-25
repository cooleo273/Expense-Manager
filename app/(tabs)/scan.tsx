import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  if (!permission) {
    return <ThemedView style={styles.container}><ThemedText>Requesting camera permission...</ThemedText></ThemedView>;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Camera permission is required to scan receipts.</ThemedText>
        <TouchableOpacity onPress={requestPermission} style={[styles.button, { backgroundColor: palette.tint }]}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleScan = () => {
    setScanning(true);
    // Simulate OCR
    setTimeout(() => {
      setScanning(false);
      Alert.alert('Scan Complete', 'Receipt scanned and processed.');
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <ThemedText style={styles.title}>Scan Receipt</ThemedText>
          <TouchableOpacity onPress={handleScan} style={[styles.scanButton, { backgroundColor: palette.success }]}>
            <ThemedText style={styles.buttonText}>{scanning ? 'Scanning...' : 'Scan Now'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: palette.accent }]}
            onPress={() => Alert.alert('Import from gallery', 'Image picker coming soon – connect to your photos to upload receipts.')}
          >
            <ThemedText style={styles.buttonText}>Import from Gallery</ThemedText>
          </TouchableOpacity>
        </View>
      </CameraView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'white' },
  scanButton: { padding: 16, borderRadius: 16, marginBottom: 16, minWidth: 200, alignItems: 'center' },
  button: { padding: 16, borderRadius: 16, marginBottom: 16, minWidth: 200, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16 },
});