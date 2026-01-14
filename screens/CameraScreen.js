import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⭐ SENİN RAILWAY DOMAINİN:
  const SERVER_URL = "https://mvp-production-3039.up.railway.app";

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePicture = async () => {
    if (!cameraRef) return;

    setLoading(true);

    const photo = await cameraRef.takePictureAsync({ quality: 0.7, base64: true });

    // Fotoğrafı sıkıştırıyoruz
    const manipulatedPhoto = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 900 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    let localUri = manipulatedPhoto.uri;
    let filename = localUri.split('/').pop();
    let type = 'image/jpeg';

    const formData = new FormData();
    formData.append('photo', {
      uri: localUri,
      name: filename,
      type: type,
    });

    try {
      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: 'POST',
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: formData,
      });

      const result = await response.json();

      navigation.navigate("Analysis", {
        analysis: result.analysis,
        premium: result.premium,
      });
    } catch (error) {
      alert("Error uploading photo: " + error.message);
    }

    setLoading(false);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={setCameraRef} ratio="16:9" />

      <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.captureText}>CAPTURE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 2,
  },
  captureText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
});
