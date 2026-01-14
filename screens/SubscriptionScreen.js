import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

export default function SubscriptionScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleContinue = () => {
    if (!selectedPlan) return;

    navigation.navigate("Welcome", {
      premium: selectedPlan === "premium",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Plan</Text>

        {/* STANDARD */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === "standard" && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan("standard")}
        >
          <Text
            style={[
              styles.planName,
              selectedPlan === "standard" && styles.planNameSelected,
            ]}
          >
            STANDARD
          </Text>
          <Text
            style={[
              styles.planPrice,
              selectedPlan === "standard" && styles.planPriceSelected,
            ]}
          >
            $9.99 / month
          </Text>
          <Text style={styles.feature}>• Makeup & skincare guidance</Text>
          <Text style={styles.feature}>• Brand-free recommendations</Text>
          <Text style={styles.feature}>• Progress tracking</Text>
          <Text style={styles.feature}>• Saved history</Text>
        </TouchableOpacity>

        {/* PREMIUM */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === "premium" && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan("premium")}
        >
          <Text
            style={[
              styles.planName,
              selectedPlan === "premium" && styles.planNameSelected,
            ]}
          >
            PREMIUM
          </Text>
          <Text
            style={[
              styles.planPrice,
              selectedPlan === "premium" && styles.planPriceSelected,
            ]}
          >
            $19.99 / month
          </Text>
          <Text style={styles.feature}>• Everything in Standard</Text>
          <Text style={styles.feature}>• Wrapped insights</Text>
          <Text style={styles.feature}>• Advanced analysis depth</Text>
          <Text style={styles.feature}>• Tone & color refinement</Text>
          <Text style={styles.feature}>• Priority AI processing</Text>
          <Text style={styles.feature}>• Early access features</Text>
        </TouchableOpacity>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueDisabled,
          ]}
          disabled={!selectedPlan}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Not medical advice. Photos are deleted after analysis.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 24, paddingTop: 60 },
  title: {
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 40,
  },
  planCard: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 24,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  planCardSelected: { backgroundColor: "#000" },
  planName: { fontSize: 18, letterSpacing: 2, marginBottom: 6, color: "#000" },
  planNameSelected: { color: "#fff" },
  planPrice: { fontSize: 20, marginBottom: 12 },
  planPriceSelected: { color: "#fff" },
  feature: { fontSize: 13, marginVertical: 3 },
  continueButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    marginTop: 30,
  },
  continueDisabled: { opacity: 0.3 },
  continueButtonText: { letterSpacing: 3 },
  disclaimer: { marginTop: 20, textAlign: "center", fontSize: 12 },
});
