import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type Language = 'en' | 'fr';

type LanguageSwitcherProps = {
  value: Language;
  onChange: (value: Language) => void;
  style?: StyleProp<ViewStyle>;
};

export function LanguageSwitcher({ value, onChange, style }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const languages: Language[] = ['en', 'fr'];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: palette.border,
          backgroundColor: palette.card,
        },
        style,
      ]}
    >
      {languages.map((lang, index) => {
        const isActive = lang === value;
        const isLast = index === languages.length - 1;

        return (
          <View key={lang} style={styles.chipContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t(lang)}
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(lang)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? `${palette.tint}33` // 20% opacity tint
                    : palette.card,
                },
              ]}
            >
              {lang === 'en' && (
                <Image
                  source={require('../assets/images/uk.png')}
                  style={styles.flag}
                  resizeMode="contain"
                />
              )}
              {lang === 'fr' && (
                <Image
                  source={require('../assets/images/fr.png')}
                  style={styles.flag}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
            {!isLast && (
              <View style={[styles.separator, { backgroundColor: palette.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexShrink: 0,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  flag: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 0.4,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
