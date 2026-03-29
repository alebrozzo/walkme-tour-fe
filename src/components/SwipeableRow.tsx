import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SWIPE_DELETE_WIDTH = 72;
export const SWIPE_THRESHOLD_PX = 5;

export interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  isRTL: boolean;
  deleteAccessibilityLabel: string;
}

export default function SwipeableRow({ children, onDelete, isRTL, deleteAccessibilityLabel }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isRTLRef = useRef(isRTL);
  isRTLRef.current = isRTL;
  const currentValueRef = useRef(0);
  const startOffsetRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentValueRef.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const snapToStable = useCallback(
    (rawCurrent: number) => {
      const rtl = isRTLRef.current;
      if (rawCurrent > SWIPE_DELETE_WIDTH / 2) {
        Animated.spring(translateX, {
          toValue: rtl ? SWIPE_DELETE_WIDTH : -SWIPE_DELETE_WIDTH,
          useNativeDriver: true,
        }).start();
        setIsOpen(true);
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        setIsOpen(false);
      }
    },
    [translateX],
  );
  const snapToStableRef = useRef(snapToStable);
  snapToStableRef.current = snapToStable;

  const close = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setIsOpen(false);
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > SWIPE_THRESHOLD_PX,
      onPanResponderGrant: () => {
        const rtl = isRTLRef.current;
        startOffsetRef.current = rtl ? currentValueRef.current : -currentValueRef.current;
      },
      onPanResponderMove: (_, gs) => {
        const rtl = isRTLRef.current;
        const rawTotal = startOffsetRef.current + (rtl ? gs.dx : -gs.dx);
        const clamped = Math.min(Math.max(rawTotal, 0), SWIPE_DELETE_WIDTH);
        translateX.setValue(rtl ? clamped : -clamped);
      },
      onPanResponderRelease: (_, gs) => {
        const rtl = isRTLRef.current;
        snapToStableRef.current(startOffsetRef.current + (rtl ? gs.dx : -gs.dx));
      },
      onPanResponderTerminate: () => {
        const rtl = isRTLRef.current;
        snapToStableRef.current(rtl ? currentValueRef.current : -currentValueRef.current);
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.clip, { direction: 'ltr' }]}>
        <View style={[styles.deleteArea, isRTL ? styles.deleteAreaRTL : styles.deleteAreaLTR]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              close();
              onDelete();
            }}
            accessibilityRole="button"
            accessibilityLabel={deleteAccessibilityLabel}
            accessibilityElementsHidden={!isOpen}
            importantForAccessibility={isOpen ? 'yes' : 'no'}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[styles.content, { direction: isRTL ? 'rtl' : 'ltr' }, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clip: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  content: {
    backgroundColor: '#F0F4FF',
  },
  deleteArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SWIPE_DELETE_WIDTH,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAreaLTR: {
    right: 0,
  },
  deleteAreaRTL: {
    left: 0,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: SWIPE_DELETE_WIDTH,
  },
  deleteIcon: {
    fontSize: 22,
  },
});
