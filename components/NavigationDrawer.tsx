import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = 280;

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const router = useRouter();
  const { showToast } = useToast();
  const [isMounted, setIsMounted] = useState(visible);
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const navigationItems = [
    { label: 'Debts', route: '/reminders', icon: 'credit-card-clock' },
    { label: 'Budgets', route: '/analysis', icon: 'chart-pie' },
    { label: 'Accounts', route: '/accounts', icon: 'wallet-outline' },
    { label: 'Category', route: '/analysis', icon: 'shape-outline' },
    { label: 'Settings', route: '/settings', icon: 'cog-outline' },
    { label: 'Templates', route: '/support', icon: 'file-document-edit-outline' },
    { label: 'Help', route: '/support', icon: 'help-circle-outline' },
  ];

  const handleNavigate = (route: string, label: string) => {
    onClose();

    if (['Debts', 'Budgets', 'Accounts', 'Category', 'Templates'].includes(label)) {
      showToast(`${label} feature is not available yet`);
      return;
    }

    if (route) {
      router.push(route as any);
    }
  };

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (isMounted) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [animation, isMounted, visible]);

  if (!isMounted) {
    return null;
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { pointerEvents: 'box-none' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: palette.card,
              transform: [{ translateX }],
              paddingTop: Math.max(insets.top, 24),
            },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>J</Text>
            </View>
            <View>
              <Text style={[styles.profileName, { color: palette.text }]}>John Doe</Text>
              <Text style={[styles.profileHint, { color: palette.icon }]}>Premium Member</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
              <MaterialCommunityIcons name="close" size={20} color={palette.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, { borderBottomColor: palette.border }]}
                onPress={() => handleNavigate(item.route, item.label)}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={palette.icon}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: palette.text, fontSize: FontSizes.lg }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footerSection}>
            <TouchableOpacity
              style={[styles.footerButton, { borderColor: palette.border }]}
              onPress={() => {
                // Close the drawer and navigate to the legacy page
                onClose();
                router.push('/legacy');
              }}
            >
              <Text style={{ color: palette.text }}>Legacy Mode</Text>
              <MaterialCommunityIcons name="toggle-switch-off-outline" size={22} color={palette.icon} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    padding: Spacing.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.drawerSubtle,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.round,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarInitial: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.heavy as any,
    color: '#1F2933',
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.heavy as any,
  },
  profileHint: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.sm,
  },
  dismissButton: {
    marginLeft: 'auto',
    padding: Spacing.xs,
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,231,235,0.7)',
    paddingTop: Spacing.lg,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
});