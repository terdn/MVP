import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const [type, setType] = useState(Camera.Constants.Type.front);
  const cameraRef = useRef(null);

  const route = useRoute();
  const navigation = useNavigation();
  const premium = route.params?.premium || false;

  const takePhoto = async () => {
    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
    });

    navigation.navigate("Analysis", {
      photo,
      premium,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type} ref={cameraRef} />

      <TouchableOpacity
        onPress={takePhoto}
        style={{
          position: "absolute",
          bottom: 40,
          left: "40%",
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        <Text>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}
