import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SubscriptionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>

      {/* STANDARD */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Welcome", { premium: false })}
      >
        <Text style={styles.buttonText}>Standard</Text>
      </TouchableOpacity>

      {/* PREMIUM */}
      <TouchableOpacity
        style={[styles.button, styles.premiumButton]}
        onPress={() => navigation.navigate("Welcome", { premium: true })}
      >
        <Text style={styles.buttonText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, marginBottom: 40, fontWeight: "700" },
  button: {
    width: 250,
    padding: 20,
    backgroundColor: "#222",
    marginBottom: 20,
    borderRadius: 12,
  },
  premiumButton: { backgroundColor: "#8a2be2" },
  buttonText: { color: "#fff", fontSize: 20, textAlign: "center" },
});
