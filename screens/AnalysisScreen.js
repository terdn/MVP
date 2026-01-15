import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function AnalysisScreen({ route }) {
  const { analysis, premium } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>Your Analysis</Text>

        {!analysis || analysis.length === 0 ? (
          <Text style={styles.noAnalysis}>No analysis available.</Text>
        ) : (
          <Text style={styles.analysisText}>{analysis}</Text>
        )}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ This is NOT medical advice.</Text>
          <Text style={styles.warningText}>
            🧼 Photos are deleted automatically after analysis.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
  },
  noAnalysis: {
    fontSize: 18,
    color: "#888",
    marginVertical: 10,
  },
  analysisText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 26,
  },
  warningBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
});
