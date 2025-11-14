import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const options = {
  headerShown: false,
};

type FlashMode = 'off' | 'on';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: palette.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: palette.background }]}>
        <ThemedText style={{ textAlign: 'center', color: palette.text, marginBottom: Spacing.md }}>
          We need your permission to access the camera
        </ThemedText>
        <TouchableOpacity onPress={requestPermission} style={[styles.permissionButton, { backgroundColor: palette.tint }]}>
          <ThemedText style={{ color: '#FFFFFF', fontWeight: '600' }}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync();
      Alert.alert('Receipt captured', `Photo saved at ${photo?.uri}`);
      router.back();
    } catch (_error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleOpenGallery = () => {
    Alert.alert('Coming soon', 'Importing receipts from the gallery will arrive in a future update.');
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing={facing} flash={flash}>
        <View
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + Spacing.lg,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.back()}
              style={[styles.circleButton, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.topControls}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={toggleFlash}
                style={[styles.iconChip, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              >
                <MaterialCommunityIcons name={flash === 'off' ? 'flash-off' : 'flash'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.iconChip, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              >
                <MaterialCommunityIcons name="timer-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.iconChip, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              >
                <MaterialCommunityIcons name="aspect-ratio" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.frameContainer}>
            <View style={styles.receiptFrame}>
              <View style={[styles.frameCorner, styles.frameCornerTL]} />
              <View style={[styles.frameCorner, styles.frameCornerTR]} />
              <View style={[styles.frameCorner, styles.frameCornerBL]} />
              <View style={[styles.frameCorner, styles.frameCornerBR]} />
            </View>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleOpenGallery}
              style={[styles.smallCircleButton, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            >
              <MaterialCommunityIcons name="image-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.captureSection}>
              <Text style={styles.zoomLabel}>1x</Text>
              <TouchableOpacity accessibilityRole="button" onPress={takePicture} style={styles.captureOuter}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={toggleCameraFacing}
              style={[styles.smallCircleButton, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            >
              <MaterialCommunityIcons name="camera-switch" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  permissionButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconChip: {
    minWidth: 42,
    height: 42,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  iconChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptFrame: {
    width: '82%',
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(15,23,42,0.12)',
  },
  frameCorner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#FFFFFF',
  },
  frameCornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BorderRadius.md,
  },
  frameCornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BorderRadius.md,
  },
  frameCornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  frameCornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BorderRadius.md,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  smallCircleButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  zoomLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  captureOuter: {
    width: 84,
    height: 84,
    borderRadius: BorderRadius.round,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFFFFF',
  },
});
