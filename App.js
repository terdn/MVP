import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Ekranlar
import RegisterScreen from "./screens/RegisterScreen"; // YENİ: Kayıt Ekranı
import SubscriptionScreen from "./screens/SubscriptionScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import CameraScreen from "./screens/CameraScreen";
import AnalysisScreen from "./screens/AnalysisScreen";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAppLogic();
  }, []);

  const checkAppLogic = async () => {
    try {
      // Cihazda kayıtlı e-posta var mı?
      const savedEmail = await AsyncStorage.getItem('userEmail');

      if (!savedEmail) {
        // 1. Hiç kayıt yoksa: Önce 72 saatlik deneme için Kayıt Ekranı
        setInitialRoute("Register");
      } else {
        // 2. Kayıtlı kullanıcıysa: Sunucuya süreyi sor
        const response = await axios.post('https://SENIN-RAILWAY-URLIN.up.railway.app/api/check-status', { 
          email: savedEmail 
        });

        if (response.data.status === 'expired') {
          // 72 saat dolmuş: Ödeme Ekranına Kilitler
          setInitialRoute("Subscription");
        } else {
          // Süre devam ediyor: Hoş Geldin Ekranı
          setInitialRoute("Welcome");
        }
      }
    } catch (error) {
      // Bağlantı hatası veya ilk açılışta Register'a yönlendir
      setInitialRoute("Register");
    }
  };

  // Uygulama rotayı hesaplayana kadar boş bir ekran gösterir
  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}