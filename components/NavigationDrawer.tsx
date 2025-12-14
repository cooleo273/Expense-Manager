import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import { generateRealisticMockData } from '@/utils/mock-data-generator';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, DevSettings, Easing, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageSwitcher } from './LanguageSwitcher';

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
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(visible);
  const [developerToggle, setDeveloperToggle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const navigationItems = [
    { label: t('debts'), route: '/reminders', icon: 'credit-card-clock', },
    { label: t('budgets'), route: '/analysis', icon: 'chart-pie' },
    { label: t('accounts'), route: '/accounts', icon: 'wallet-outline' },
    { label: t('statistics'), route: '/analysis', icon: 'shape-outline' },
    { label: t('settings'), route: '/settings', icon: 'cog-outline' },
    { label: t('templates'), route: '/templates', icon: 'file-document-edit-outline' },
    { label: t('help'), route: '/support', icon: 'help-circle-outline' },
  ];

  const handleNavigate = (route: string, label: string) => {
    

    if (![t('help')].includes(label)) {
      onClose();
      showToast(t('feature_not_available'));
      return;
    }

    if (route) {
      router.push(route as any);
    }
  };

  const handleMockDataToggle = async (nextValue: boolean) => {
    if (isGenerating) {
      return;
    }
    if (!nextValue) {
      setDeveloperToggle(false);
      return;
    }

    setDeveloperToggle(true);
    setIsGenerating(true);
    try {
      const { count } = await generateRealisticMockData();
      showToast(`Generated ${count} mock records`, { tone: 'success' });
    } catch (error) {
      console.error('Failed to generate mock data', error);
      showToast('Failed to generate mock data', { tone: 'error' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setDeveloperToggle(false), 400);
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
              <Text style={[styles.profileName, { color: palette.text }]}>Dagi Wube</Text>
              <Text style={[styles.profileHint, { color: palette.icon }]}>dagi@HCI.com</Text>
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
                  color={item.route !== "/support" ? '#ccc' : palette.icon}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ color: item.route !== "/support" ? '#ccc' : palette.text, fontSize: FontSizes.lg }}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.developerRow, { borderColor: 'transparent' }]}>
              <View style={styles.developerCopy}>
                <Text style={{ color: palette.text, fontSize: FontSizes.lg }}>Language</Text>
              </View>
              <LanguageSwitcher
                value={i18n.language as 'en' | 'fr'}
                onChange={async (newLang) => {
                  await StorageService.setLanguage(newLang);
                  await i18n.changeLanguage(newLang);
                  if (DevSettings?.reload) {
                    DevSettings.reload();
                  } else if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
              />
            </View>

            <View style={[styles.sectionDivider, { borderBottomColor: palette.border }]} />
            <Text style={[styles.sectionLabel, { color: palette.icon }]}>Developer</Text>
            <View style={[styles.developerRow, { borderColor: palette.border }]}>
              <View style={styles.developerCopy}>
                <Text style={[styles.developerTitle, { color: palette.text }]}>Generate Mock Data</Text>
                <Text style={[styles.developerSubtitle, { color: palette.icon }]}>
                  Populate three years of realistic transactions across every category.
                </Text>
              </View>
              <Switch
                value={developerToggle}
                onValueChange={handleMockDataToggle}
                disabled={isGenerating}
                trackColor={{ false: '#D1D5DB', true: `${palette.tint}66` }}
                thumbColor={developerToggle ? palette.tint : '#f4f3f4'}
              />
            </View>
            <Text style={[styles.developerHint, { color: palette.icon }]}>Toggle to immediately regenerate sample data.</Text>
          </ScrollView>

          <View style={styles.footerSection}>
            <TouchableOpacity
              style={[styles.footerButton, { borderColor: palette.border }]}
              onPress={() => {
                onClose();
                router.push('/legacy');
              }}
            >
              <Text style={{ color: palette.text }}>{t('legacy_mode')}</Text>
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
  sectionDivider: {
    borderBottomWidth: 1,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  developerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  developerCopy: {
    flex: 1,
  },
  developerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold as any,
  },
  developerSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  developerHint: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});