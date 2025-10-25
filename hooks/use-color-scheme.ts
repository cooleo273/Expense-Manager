import { useThemeContext } from '@/contexts/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
	const { colorScheme } = useThemeContext();
	return colorScheme;
}

export function useThemePreference() {
	const { preference, setPreference, togglePreference } = useThemeContext();
	return { preference, setPreference, togglePreference };
}
