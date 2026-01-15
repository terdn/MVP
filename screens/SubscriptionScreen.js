import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function SubscriptionScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* STANDARD MEMBERSHIP */}
      <View style={styles.box}>
        <Text style={styles.plan}>STANDARD MEMBERSHIP</Text>
        <Text style={styles.price}>$9.99</Text>

        <Text style={styles.feature}>• Basic AI Skin Analysis</Text>
        <Text style={styles.feature}>• Skin Type Detection</Text>
        <Text style={styles.feature}>• Routine Suggestions</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Welcome", { premium: false })}
        >
          <Text style={styles.buttonText}>Choose Standard</Text>
        </TouchableOpacity>
      </View>

      {/* PREMIUM MEMBERSHIP */}
      <View style={styles.box}>
        <Text style={styles.plan}>PREMIUM MEMBERSHIP</Text>
        <Text style={styles.price}>$19.99</Text>

        <Text style={styles.feature}>• Everything in Standard</Text>
        <Text style={styles.feature}>• Undertone Analysis</Text>
        <Text style={styles.feature}>• Shade Match (Foundation / Concealer)</Text>
        <Text style={styles.feature}>• Color Recommendations</Text>
        <Text style={styles.feature}>• Detailed Premium Report</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Welcome", { premium: true })}
        >
          <Text style={styles.buttonText}>Choose Premium</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  box: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
  },
  plan: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000",
  },
  price: {
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
  },
  feature: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
