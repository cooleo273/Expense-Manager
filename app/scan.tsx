import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapReceiptToExpense, normalizeCasing } from '@/utils/receipt-mapper';

export const options = {
  headerShown: false,
};

export default function ScanScreen() {
  const navigation = useNavigation();
  React.useEffect(() => {
    navigation.setOptions({ headerShown: false, headerLeft: () => null, headerTitle: '' });
    return () => {
    };
  }, [navigation]);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const { showToast } = useToast();
  const cameraRef = useRef<CameraView>(null);
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const statusMessages = ['Processing receipt…', 'Analyzing category…', 'Hang on—just a moment…'];

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const uploadReceipt = useCallback(async (uri: string) => {
    const endpoint = `${apiBaseUrl}/api/receipt/parse`;
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);

    console.debug('[Scan] Uploading receipt', { endpoint, uri });
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

    const json = await response.json();
    console.debug('[Scan] receipt parse response', JSON.stringify(json, null, 2));
    return json;
  }, [apiBaseUrl]);

  const processReceipt = useCallback(
    async (uri: string) => {
      const proxyResponse = await uploadReceipt(uri);
      console.debug('[Scan] proxyResponse', JSON.stringify(proxyResponse, null, 2));
      const mappedExpense = mapReceiptToExpense(proxyResponse?.fields);
      console.debug('[Scan] mappedExpense', JSON.stringify(mappedExpense, null, 2));
      if (!mappedExpense) {
        throw new Error('Receipt fields unavailable');
      }

      const apiRecords = proxyResponse?.fields?.records ?? [];
      const items = mappedExpense.expense?.items ?? [];
      const receiptDate = mappedExpense.expense?.date ?? null;
      const receiptTime = mappedExpense.expense?.time ?? null;
      const computeOccurredAt = () => {
        if (!receiptDate) return undefined;
        const combined = receiptTime ? `${receiptDate}T${receiptTime}` : receiptDate;
        const parsed = new Date(combined);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
        return undefined;
      };
      const occurredAtForRecord = computeOccurredAt();

      setIsProcessing(false);
      setIsAnalyzing(true);
      let resolvedRecords: any[] | undefined = undefined;
      try {
        if (apiRecords.length > 0) {
          resolvedRecords = apiRecords.map((record: any) => ({
            amount: (typeof record.amount === 'number' ? record.amount.toFixed(2) : `${record.amount}`),
            category: record.category ?? '',
            subcategoryId: record.subcategoryId ?? '',
            payee: record.payee ?? mappedExpense.expense?.payee ?? mappedExpense.expense?.merchant ?? '',
            note: normalizeCasing(record.note ?? record.description ?? mappedExpense.expense?.note ?? '') ?? '',
            labels: [],
            occurredAt: record.occurredAt ? new Date(record.occurredAt).toISOString() : occurredAtForRecord,
          })) as any[];
        } else if (items.length > 0) {
          resolvedRecords = items.map((it) => ({
            amount: (typeof it.total === 'number' ? it.total.toFixed(2) : `${it.total}`),
            category: mappedExpense.expense?.category ?? '',
            subcategoryId: mappedExpense.expense?.subcategoryId ?? '',
            payee: mappedExpense.expense?.payee ?? mappedExpense.expense?.merchant ?? '',
            note: normalizeCasing(it.description ?? mappedExpense.expense?.note ?? '') ?? '',
            labels: [],
            occurredAt: occurredAtForRecord,
          })) as any[];
        }
      } finally {
        setIsAnalyzing(false);
      }

      const payloadToSend: any = (resolvedRecords && resolvedRecords.length > 0)
        ? { records: resolvedRecords }
        : {
            draftPatch: {
              ...(mappedExpense.draftPatch ?? {}),
              ...(occurredAtForRecord ? { occurredAt: occurredAtForRecord } : {}),
            },
          };
      console.debug('[Scan] outgoing parsed payload', JSON.stringify(payloadToSend, null, 2));
      const encodedFields = encodeURIComponent(JSON.stringify(payloadToSend));
      showToast('Receipt imported');
      router.replace({
        pathname: '/log-expenses-list',
        params: { parsed: encodedFields },
      });
    },
    [router, showToast, uploadReceipt]
  );
  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, base64: false });
      if (!photo?.uri) {
        throw new Error('Unable to capture photo');
      }

      await processReceipt(photo.uri);
    } catch (error) {
      console.error('Receipt capture failed', error);
      showToast('Could not process receipt', { tone: 'error' });
      Alert.alert('Receipt scan failed', 'Please try again or upload another file.');
    } finally {
      setIsProcessing(false);
    }
  }, [cameraRef, isProcessing, processReceipt, showToast]);

  const handleOpenGallery = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow photo library access to import receipts.');
        return;
      }

      const selection = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        quality: 0.9,
      });

      if (selection.canceled || !selection.assets?.length) {
        return;
      }

      const asset = selection.assets[0];
      if (!asset?.uri) {
        throw new Error('No image selected');
      }

      if (asset.type && asset.type !== 'image') {
        Alert.alert('Invalid selection', 'Please select an image file from your library.');
        return;
      }

      setIsProcessing(true);
      await processReceipt(asset.uri);
    } catch (error) {
      console.error('Gallery import failed', error);
      showToast('Could not import receipt', { tone: 'error' });
      Alert.alert('Receipt import failed', 'Please try again with a different image.');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, processReceipt, showToast]);

  useEffect(() => {
    if (!(isProcessing || isAnalyzing)) {
      setStatusStep(0);
      return;
    }

    setStatusStep(0);
    const interval = setInterval(() => {
      setStatusStep((prev) => (prev + 1) % statusMessages.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isAnalyzing, isProcessing, statusMessages.length]);

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
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing={facing} flash="off" />
      <View
        style={[
          styles.overlay,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
              <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
            </TouchableOpacity>
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
      {(isProcessing || isAnalyzing) && (
        <View style={[styles.processingOverlay, { backgroundColor: '#FFFFFF' }]}>
          <ActivityIndicator size="large" color={palette.tint} />
          <Text style={[styles.processingText, { color: palette.text }]}>
            {statusMessages[statusStep]}
          </Text>
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
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  backButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
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
