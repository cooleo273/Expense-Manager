import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapReceiptToExpense } from '@/utils/receipt-mapper';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const cameraRef = useRef<CameraView>(null);
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const uploadReceipt = useCallback(async (uri: string) => {
    const endpoint = `${apiBaseUrl}/api/receipt/parse`;
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = 'Receipt upload failed';
      try {
        const errorPayload = await response.json();
        if (errorPayload?.error) {
          message = errorPayload.error;
        }
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return response.json();
  }, [apiBaseUrl]);

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) {
      return;
    }
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, base64: false });
      if (!photo?.uri) {
        throw new Error('Unable to capture photo');
      }

      const proxyResponse = await uploadReceipt(photo.uri);
      const mappedExpense = mapReceiptToExpense(proxyResponse?.fields);
      if (!mappedExpense) {
        throw new Error('Receipt fields unavailable');
      }
      const encodedFields = encodeURIComponent(JSON.stringify(mappedExpense));

      showToast('Receipt imported');
      router.replace({
        pathname: '/log-expenses-list',
        params: { parsed: encodedFields },
      });
    } catch (error) {
      console.error('Receipt processing failed', error);
      showToast('Could not process receipt');
      Alert.alert('Receipt scan failed', 'Please try again or upload another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenGallery = () => {
    Alert.alert('Coming soon', 'Importing receipts from the gallery will arrive in a future update.');
  };

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
              <TouchableOpacity
                accessibilityRole="button"
                onPress={takePicture}
                style={[
                  styles.captureOuter,
                  isProcessing && { opacity: 0.6 },
                ]}
                disabled={isProcessing}
              >
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
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>Processing receipt…</Text>
        </View>
      )}
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  processingText: {
    color: '#FFFFFF',
    marginTop: Spacing.md,
    fontWeight: '600',
  },
});
