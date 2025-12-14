import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCustomHeaderStyles } from "@/styles/custom-header.styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function SupportScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const navigation = useNavigation();
  const customHeaderStyles = useMemo(
    () => getCustomHeaderStyles(palette),
    [palette]
  );
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <ThemedView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <View style={customHeaderStyles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={palette.icon}
          />
        </TouchableOpacity>
        <ThemedText
          style={{
            fontSize: 18,
            flex: 1,
            fontWeight: "600",
            color: palette.text,
          }}
        >
          {t("help")}
        </ThemedText>
      </View>
      <ScrollView contentContainerStyle={{ gap: 16, padding: Spacing.lg }}>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <ThemedText type="title">Expense Manager 2.0</ThemedText>
          <ThemedText>
            This is a simplified new version of the Expense Manager app.
          </ThemedText>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <ThemedText type="subtitle">FAQ</ThemedText>

          <View>
            <TouchableOpacity
              onPress={() => setExpanded(expanded === 1 ? null : 1)}
              style={styles.faqQuestion}
            >
              <ThemedText style={{ color: palette.icon }}>
                Q: How do I add my expenses from a receipt?
              </ThemedText>
              <MaterialCommunityIcons
                name={expanded === 1 ? "chevron-up" : "chevron-down"}
                size={24}
                color={palette.icon}
              />
            </TouchableOpacity>
            {expanded === 1 && (
              <ThemedText>
                A: Press the + Button** on the main screen, then select the
                **Camera Button**. You can either capture a new photo of your
                receipt or browse an existing image from your gallery. Expense
                Manager uses intelligent OCR technology to read the
                contents—including items, prices, and the total—and
                automatically categorizes the items for you.
              </ThemedText>
            )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => setExpanded(expanded === 2 ? null : 2)}
              style={styles.faqQuestion}
            >
              <ThemedText style={{ color: palette.icon }}>
                Q: What is different in this new version?
              </ThemedText>
              <MaterialCommunityIcons
                name={expanded === 2 ? "chevron-up" : "chevron-down"}
                size={24}
                color={palette.icon}
              />
            </TouchableOpacity>
            {expanded === 2 && (
              <ThemedText>
                A: The entire application has been redesigned to be much more
                **mobile friendly** and intuitive. We focused on improving
                navigation, speeding up load times, and optimizing the interface
                for one-handed use. You will notice a cleaner look, clearer
                reporting charts, and a simplified workflow for expense entry.
              </ThemedText>
            )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => setExpanded(expanded === 3 ? null : 3)}
              style={styles.faqQuestion}
            >
              <ThemedText style={{ color: palette.icon }}>
                Q: How do I manage my debts?
              </ThemedText>
              <MaterialCommunityIcons
                name={expanded === 3 ? "chevron-up" : "chevron-down"}
                size={24}
                color={palette.icon}
              />
            </TouchableOpacity>
            {expanded === 3 && (
              <ThemedText>
                A: Debt and loan management features (tracking money owed to or
                by others) are **not supported at the moment**. We are currently
                prioritizing core expense and budget tracking. This is a highly
                requested feature and we plan to add dedicated debt management
                functionality in a future major update.
              </ThemedText>
            )}
          </View>

          {/* 4. How do I export my records */}
          <View>
            <TouchableOpacity
              onPress={() => setExpanded(expanded === 4 ? null : 4)}
              style={styles.faqQuestion}
            >
              <ThemedText style={{ color: palette.icon }}>
                Q: How do I export my financial records?
              </ThemedText>
              <MaterialCommunityIcons
                name={expanded === 4 ? "chevron-up" : "chevron-down"}
                size={24}
                color={palette.icon}
              />
            </TouchableOpacity>
            {expanded === 4 && (
              <ThemedText>
                A: Export functionality is **not supported at the moment**. We
                understand the importance of backing up or analyzing your data
                outside the app. We are actively working on implementing secure
                export options, such as CSV and PDF, which will be available in
                the next version release.
              </ThemedText>
            )}
          </View>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <ThemedText type="subtitle">Contact Us</ThemedText>
          <TouchableOpacity
            onPress={() => Linking.openURL("mailto:support@example.com")}
          >
            <ThemedText style={{ color: palette.tint }}>
              Email: support@example.com
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("tel:+1234567890")}>
            <ThemedText style={{ color: palette.tint }}>
              Phone: +1 (234) 567-890
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  header: {
    gap: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legacyImage: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    backgroundColor: "#fff",
  },
});
