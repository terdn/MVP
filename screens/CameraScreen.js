import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation, route }) {
  const { premium } = route.params || { premium: false };
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
      console.log("📸 Fotoğraf çekiliyor...");
      
      // 1. Çekim Kalitesini Düşür
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });

      console.log("📉 ÖLÜMCÜL HAMLE: Resim Küçültülüyor...");
      
      // ⭐ İŞTE SENİ KURTARACAK KISIM BURASI ⭐
      // Genişliği 500px yapıyoruz. Dosya boyutu %95 azalıyor.
      // Sunucu bunu havada kapacak.
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 500 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      const filename = manipulated.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("photo", {
        uri: manipulated.uri,
        name: filename || "upload.jpg",
        type: type,
      });
      formData.append("premium", String(premium));

      console.log(`🚀 Hafifletilmiş veri gönderiliyor...`);

      // 30 Saniye Zaman Aşımı
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      
      // Sonuç ne olursa olsun göster
      const finalOutput = result.analysis 
                          ? result.analysis 
                          : `⚠️ SUNUCU CEVABI:\n${JSON.stringify(result, null, 2)}`;

      navigation.navigate("Analysis", {
        analysis: finalOutput,
        premium: premium,
      });

    } catch (err) {
      console.error("HATA:", err);
      Alert.alert("Hata", "Bağlantı sorunu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View style={{flex:1, backgroundColor:'#000'}} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Kamera izni ver.</Text>
        <TouchableOpacity onPress={requestPermission}><Text style={{ color: '#fff', marginTop: 20 }}>İZİN VER</Text></TouchableOpacity>
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