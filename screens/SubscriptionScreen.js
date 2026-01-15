import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
// ⭐ GÜVENLİ ALAN (ÇENTİK) DÜZELTMESİ
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubscriptionScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.headerTitle}>ERDN Cosmetics</Text>

        {/* STANDARD MEMBERSHIP - $4.99 */}
        <View style={styles.box}>
          <Text style={styles.plan}>STANDARD MEMBERSHIP</Text>
          <Text style={styles.price}>$4.99</Text>

          <Text style={styles.feature}>• Basic AI Skin Analysis</Text>
          <Text style={styles.feature}>• Skin Type & Undertone Detection</Text>
          <Text style={styles.feature}>• Routine Suggestions</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Welcome", { premium: false })}
          >
            <Text style={styles.buttonText}>Choose Standard</Text>
          </TouchableOpacity>
        </View>

        {/* PREMIUM MEMBERSHIP - $9.99 */}
        <View style={[styles.box, styles.premiumBox]}>
          <Text style={[styles.plan, {color: '#fff'}]}>PREMIUM MEMBERSHIP</Text>
          <Text style={[styles.price, {color: '#fff'}]}>$9.99</Text>

          <Text style={[styles.feature, {color: '#ddd'}]}>• Everything in Standard</Text>
          <Text style={[styles.feature, {color: '#ddd'}]}>• Shade Match (Foundation/Concealer)</Text>
          <Text style={[styles.feature, {color: '#ddd'}]}>• Color Recommendations</Text>
          <Text style={[styles.feature, {color: '#ddd'}]}>• Detailed Premium Report</Text>

          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#fff'}]}
            onPress={() => navigation.navigate("Welcome", { premium: true })}
          >
            <Text style={[styles.buttonText, {color: '#000'}]}>Choose Premium</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
    letterSpacing: 2,
    color: '#000',
  },
  box: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    backgroundColor: "#fff",
  },
  premiumBox: {
    backgroundColor: "#000", // Premium siyah tema
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
    letterSpacing: 1,
  },
});