import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // ⭐ SDK 54 STANDARDI
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation, route }) {
  // Parametre yoksa varsayılan false
  const { premium } = route.params || { premium: false };

  // ⭐ YENİ İZİN SİSTEMİ
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Senin Railway Sunucun
  const SERVER_URL = "https://mvp-production-3039.up.railway.app";

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    try {
      // ⭐ YENİ FOTOĞRAF ÇEKME METODU
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true, // Hızlandırır
      });

      // Fotoğrafı sıkıştır (Hızlı upload için)
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 900 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append("photo", {
        uri: manipulated.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      // Premium bilgisini sunucuya iletiyoruz
      formData.append("premium", String(premium));

      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result = await response.json();

      navigation.navigate("Analysis", {
        analysis: result.analysis,
        premium: premium,
      });

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // İzinler yüklenirken siyah ekran
  if (!permission) return <View style={{flex:1, backgroundColor:'#000'}} />;

  // İzin verilmediyse uyarı
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', marginBottom: 20 }}>Camera access is required for analysis.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
          <Text style={{ color: '#000', fontWeight: 'bold' }}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ⭐ ESKİSİ GİTTİ, YENİSİ BU: CameraView */}
      <CameraView
        style={{ flex: 1, width: '100%' }}
        ref={cameraRef}
        facing="front" // Selfie kamerası
      />

      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleTakePicture}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          // Minimalist Deklanşör
          <View style={styles.innerCircle} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: 'center', alignItems: 'center' },
  captureButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  grantButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  }
});