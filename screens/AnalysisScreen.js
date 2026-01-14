import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function AnalysisScreen({ route }) {
  const { result } = route.params;
  const analysis = result?.analysis || "No analysis available.";
  const isPremium = result?.premium === true || result?.premium === "true";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isPremium ? "Premium Skin Analysis" : "Your Analysis"}
      </Text>

      {/* PREMIUM BADGE */}
      {isPremium && (
        <Text style={styles.premiumBadge}>PREMIUM MODE ✓</Text>
      )}

      <Text style={styles.text}>{analysis}</Text>

      {/* GLOBAL NOTICES */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          ⚠️ This is NOT medical advice.
        </Text>
        <Text style={styles.noticeText}>
          🗑️ Photos are deleted automatically after analysis.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  premiumBadge: {
    backgroundColor: "#FF007F",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 12,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  noticeBox: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f3f3f3",
  },
  noticeText: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
  },
});
