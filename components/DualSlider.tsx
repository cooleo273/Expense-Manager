import React, { useEffect, useRef, useState } from 'react';
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
  const [internal, setInternal] = useState<[number, number]>([values[0], values[1]]);
  const activeMarker = useRef<'left' | 'right' | null>(null);
  const panX = useRef(0);

  useEffect(() => {
    setInternal([values[0], values[1]]);
  }, [values]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));
  const snap = (val: number) => {
    if (!step || step <= 1) return val;
    return Math.round(val / step) * step;
  };

  const valueToPosition = (v: number) => {
    if (!layoutWidth) return 0;
    const ratio = (v - min) / (max - min || 1);
    return ratio * layoutWidth;
  };
  const positionToValue = (pos: number) => {
    const ratio = pos / (layoutWidth || 1);
    const raw = min + ratio * (max - min);
    return clamp(snap(raw));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        panX.current = 0;
        const touchX = evt.nativeEvent.locationX as number;
        const leftPos = valueToPosition(internal[0]);
        const rightPos = valueToPosition(internal[1]);
        activeMarker.current = Math.abs(touchX - leftPos) <= Math.abs(touchX - rightPos) ? 'left' : 'right';
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const touchXInView = (evt.nativeEvent.locationX ?? gestureState.moveX) as number;
        if (!activeMarker.current) {
          const leftPos = valueToPosition(internal[0]);
          const rightPos = valueToPosition(internal[1]);
          const distLeft = Math.abs(touchXInView - leftPos);
          const distRight = Math.abs(touchXInView - rightPos);
          activeMarker.current = distLeft <= distRight ? 'left' : 'right';
        }
        if (activeMarker.current === 'left') {
          const val = positionToValue(touchXInView);
          const limited = Math.min(val, internal[1]);
          const next: [number, number] = [limited, internal[1]];
          setInternal(next);
          onValuesChange?.(next);
        } else if (activeMarker.current === 'right') {
          const val = positionToValue(touchXInView);
          const limited = Math.max(val, internal[0]);
          const next: [number, number] = [internal[0], limited];
          setInternal(next);
          onValuesChange?.(next);
        }
      },
      onPanResponderRelease: () => {
        if (activeMarker.current) {
          onValuesChangeFinish?.(internal);
        }
        activeMarker.current = null;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        activeMarker.current = null;
      },
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  const MARKER_SIZE = 24;
  const leftPos = valueToPosition(internal[0]);
  const rightPos = valueToPosition(internal[1]);

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={(ev) => {
        const w = ev.nativeEvent.layout.width;
        setLayoutWidth(w);
      }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, trackStyle]} />
      <View style={[styles.selectedTrack, { left: leftPos, width: Math.max(2, rightPos - leftPos) }, selectedTrackStyle]} />

      <View
        style={[styles.marker, { left: leftPos - MARKER_SIZE / 2 }, markerStyle] as any}
        pointerEvents="none"
      />
      <View
        style={[styles.marker, { left: rightPos - MARKER_SIZE / 2 }, markerStyle] as any}
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
