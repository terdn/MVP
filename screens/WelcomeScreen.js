import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation, route }) {
  const { premium } = route.params || { premium: false };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Camera", { premium })}
      >
        <Text style={styles.buttonText}>Start Analysis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 40 },
  button: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 12,
    width: 250,
  },
  buttonText: { color: "#fff", fontSize: 18, textAlign: "center" },
});
