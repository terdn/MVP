import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function WelcomeScreen({ navigation }) {
  const route = useRoute();
  const premium = route.params?.premium || false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {premium ? "Welcome Premium User" : "Welcome"}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Camera", {
            premium: premium,
          })
        }
      >
        <Text style={styles.buttonText}>Start Analysis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 40 },
  button: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#000",
    width: "60%",
    alignItems: "center",
  },
  buttonText: { fontSize: 16 },
});
