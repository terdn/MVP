import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🌟 GEÇİCİ PREMIUM KONTROL (sonradan Stripe bağlanacak)
  const userIsPremium = true;  
  // free mod istiyorsan: const userIsPremium = false;

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Camera permission is required.");
      }
    })();
  }, []);

  // 📸 Fotoğraf çek
  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 📤 ANALYZE (foto yükleme + premium bilgisi)
  const analyzePhoto = async () => {
    if (!image) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("photo", {
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      // 🔥 PREMIUM / FREE bilgisi backend’e gönderiliyor
      formData.append("premium", userIsPremium ? "true" : "false");

      // 🔥 BURAYI RAILWAY’DE DEĞİŞTİRECEĞİZ:
      const SERVER_URL = "http://10.0.2.2:3000/analyze"; 
      // Android için 10.0.2.2 / iOS için localhost
      // Railway’e geçince:
      // const SERVER_URL = "https://erdn-global-ai.up.railway.app/analyze";

      const response = await fetch(SERVER_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      setUploading(false);

      navigation.navigate("Analysis", { result: data });

    } catch (error) {
      console.log("ERROR:", error);
      alert("Error analyzing image.");
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ERDN AI Skin Analyzer</Text>

      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}

      {!image && (
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      )}

      {image && !uploading && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={analyzePhoto}>
          <Text style={styles.analyzeText}>
            Analyze ({userIsPremium ? "Premium Mode" : "Free Mode"})
          </Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Processing Photo…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
  },
  preview: {
    width: 260,
    height: 340,
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  analyzeBtn: {
    backgroundColor: "#FF007F",
    padding: 16,
    borderRadius: 10,
  },
  analyzeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingBox: {
    marginTop: 20,
    alignItems: "center",
  },
});
