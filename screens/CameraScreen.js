import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation, route }) {
  const { premium } = route.params || { premium: false };
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Railway Adresin
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
      // 1. Fotoğrafı Çek
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      // 2. Android İçin Boyutlandırma ve Formatlama
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }], // Biraz daha küçültelim, garanti olsun
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 3. Android Uyumlu Dosya Hazırlığı (FormData)
      const formData = new FormData();
      
      // ⭐ KRİTİK NOKTA: Dosya ismi ve tipi Android için çok net olmalı
      const filename = manipulated.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("photo", {
        uri: manipulated.uri,
        name: filename || "upload.jpg",
        type: type, // Burası 'image/jpeg' olmak zorunda
      });
      
      formData.append("premium", String(premium));

      // 4. Gönder
      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: "POST",
        headers: {
          // 'Content-Type': 'multipart/form-data', // ⭐ BUNU SİL! Fetch kendisi ayarlamalı (Android bug'ı)
          'Accept': 'application/json',
        },
        body: formData,
      });

      // 5. Cevabı Kontrol Et (Casus)
      const result = await response.json();
      
      // Eğer sunucu boş cevap döndüyse hemen uyar
      if (!result.analysis) {
        Alert.alert("Sunucu Hatası", "Sunucuya ulaşıldı ama analiz BOŞ döndü. Railway loglarına bakmalısın.");
      } else {
        navigation.navigate("Analysis", {
          analysis: result.analysis,
          premium: premium,
        });
      }

    } catch (err) {
      Alert.alert("Bağlantı Hatası", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View style={{flex:1, backgroundColor:'#000'}} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Camera access required</Text>
        <TouchableOpacity onPress={requestPermission}><Text style={{ color: '#fff', marginTop: 20 }}>GRANT</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={{ flex: 1, width: '100%' }} ref={cameraRef} facing="front" />
      <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture} disabled={loading}>
        {loading ? <ActivityIndicator size="large" color="#fff" /> : <View style={styles.innerCircle} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: 'center', alignItems: 'center' },
  captureButton: { position: "absolute", bottom: 50, alignSelf: "center", width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: "#fff", justifyContent: "center", alignItems: "center" },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" }
});