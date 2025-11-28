import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { GestureResponderEvent, PanResponder, PanResponderGestureState, StyleSheet, View } from 'react-native';

type DualSliderProps = {
  min: number;
  max: number;
  step?: number;
  values: [number, number];
  onValuesChange?: (vals: [number, number]) => void;
  onValuesChangeFinish?: (vals: [number, number]) => void;
  containerStyle?: ViewStyle;
  trackStyle?: ViewStyle;
  selectedTrackStyle?: ViewStyle;
  markerStyle?: ViewStyle;
  pressedMarkerStyle?: ViewStyle;
};

export default function DualSlider({
  min,
  max,
  step = 1,
  values,
  onValuesChange,
  onValuesChangeFinish,
  containerStyle,
  trackStyle,
  selectedTrackStyle,
  markerStyle,
  pressedMarkerStyle,
}: DualSliderProps) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const layoutWidthRef = useRef(0);
  const [internal, setInternal] = useState<[number, number]>([values[0], values[1]]);
  const internalRef = useRef<[number, number]>([values[0], values[1]]);
  const activeMarker = useRef<'left' | 'right' | null>(null);

  const updateInternal = useCallback((next: [number, number]) => {
    if (next[0] === internalRef.current[0] && next[1] === internalRef.current[1]) {
      return;
    }
    internalRef.current = next;
    setInternal(next);
  }, []);

  useEffect(() => {
    if (values[0] !== internalRef.current[0] || values[1] !== internalRef.current[1]) {
      const next: [number, number] = [values[0], values[1]];
      internalRef.current = next;
      setInternal(next);
    }
  }, [values[0], values[1]]);

  useEffect(() => {
    internalRef.current = internal;
  }, [internal]);

  useEffect(() => {
    layoutWidthRef.current = layoutWidth;
  }, [layoutWidth]);

  const clamp = useCallback((val: number) => Math.max(min, Math.min(max, val)), [min, max]);
  const snap = useCallback(
    (val: number) => {
      if (!step || step <= 1) {
        return val;
      }
      return Math.round(val / step) * step;
    },
    [step],
  );

  const valueToPosition = useCallback(
    (v: number) => {
      if (!layoutWidth) return 0;
      const ratio = (v - min) / (max - min || 1);
      return ratio * layoutWidth;
    },
    [layoutWidth, max, min],
  );

  const positionToValue = useCallback(
    (pos: number) => {
      const width = layoutWidthRef.current || 1;
      const ratio = pos / width;
      const raw = min + ratio * (max - min);
      return clamp(snap(raw));
    },
    [clamp, max, min, snap],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
          const width = layoutWidthRef.current;
          if (width <= 0) {
            activeMarker.current = null;
            return;
          }
          const touchX = evt.nativeEvent.locationX ?? 0;
          const current = internalRef.current;
          const leftPos = valueToPosition(current[0]);
          const rightPos = valueToPosition(current[1]);
          activeMarker.current = Math.abs(touchX - leftPos) <= Math.abs(touchX - rightPos) ? 'left' : 'right';
        },
        onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          const width = layoutWidthRef.current;
          if (width <= 0) {
            return;
          }
          const current = internalRef.current;
          const touchXRaw = (evt.nativeEvent.locationX ?? gestureState.moveX) as number;
          const touchXInView = Math.max(0, Math.min(touchXRaw, width));
          if (!activeMarker.current) {
            const leftPos = valueToPosition(current[0]);
            const rightPos = valueToPosition(current[1]);
            activeMarker.current = Math.abs(touchXInView - leftPos) <= Math.abs(touchXInView - rightPos) ? 'left' : 'right';
          }
          if (activeMarker.current === 'left') {
            const val = positionToValue(touchXInView);
            const limited = Math.min(val, current[1]);
            const next: [number, number] = [limited, current[1]];
            updateInternal(next);
            onValuesChange?.(next);
          } else if (activeMarker.current === 'right') {
            const val = positionToValue(touchXInView);
            const limited = Math.max(val, current[0]);
            const next: [number, number] = [current[0], limited];
            updateInternal(next);
            onValuesChange?.(next);
          }
        },
        onPanResponderRelease: () => {
          if (activeMarker.current) {
            onValuesChangeFinish?.(internalRef.current);
          }
          activeMarker.current = null;
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: () => {
          activeMarker.current = null;
        },
        onShouldBlockNativeResponder: () => true,
      }),
    [positionToValue, updateInternal, valueToPosition, onValuesChange, onValuesChangeFinish],
  );

  const MARKER_SIZE = 24;
  const leftPos = valueToPosition(internal[0]);
  const rightPos = valueToPosition(internal[1]);

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={(ev) => {
        const w = ev.nativeEvent.layout.width;
        layoutWidthRef.current = w;
        setLayoutWidth(w);
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, trackStyle]} />
      <View style={[styles.selectedTrack, { left: leftPos, width: Math.max(2, rightPos - leftPos) }, selectedTrackStyle]} />

      <View
        style={[
          styles.marker,
          { left: leftPos - MARKER_SIZE / 2 },
          activeMarker.current === 'left' && pressedMarkerStyle ? pressedMarkerStyle : markerStyle,
        ] as any}
        pointerEvents="none"
      />
      <View
        style={[
          styles.marker,
          { left: rightPos - MARKER_SIZE / 2 },
          activeMarker.current === 'right' && pressedMarkerStyle ? pressedMarkerStyle : markerStyle,
        ] as any}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  track: {
    height: 4,
    backgroundColor: '#E6E6E6',
    borderRadius: 2,
  },
  selectedTrack: {
    position: 'absolute',
    height: 4,
    top: 22,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 12,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
  },
});
