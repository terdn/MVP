import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = "https://mvp-production-3039.up.railway.app";

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      const manipulatedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 900 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append("photo", {
        uri: manipulatedPhoto.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result = await response.json();

      navigation.navigate("Analysis", {
        analysis: result.analysis,
        premium: result.premium,
      });

    } catch (err) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  };

  if (hasPermission === null) return <View />;
  if (!hasPermission) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        ref={cameraRef}
        type={Camera.Constants.Type.front}
        ratio="16:9"
      />

      <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
        {loading ? <ActivityIndicator color="#fff" size="large" /> : <View style={styles.innerButton} />}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
});
