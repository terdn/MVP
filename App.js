import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- EKRANLAR ---
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen"; // LoginScreen dosyasını oluşturmalısın!
import DashboardScreen from "./screens/DashboardScreen";
import AnalysisScreen from "./screens/AnalysisScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen"; 

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const trialStartDate = await AsyncStorage.getItem('trialStartDate');

      // 1. Durum: Hiç Kayıt Yok -> REGISTER
      if (!userEmail) {
        setInitialRoute('Register');
        return;
      }

      // 2. Durum: Kayıt Var, Süreyi Kontrol Et
      if (trialStartDate) {
          const start = parseInt(trialStartDate); // Kayıt zamanı
          const now = Date.now(); // Şu an
          const hoursPassed = (now - start) / (1000 * 60 * 60); // Geçen saat

          // ⛔ KRİTİK EŞİK: 72 Saat
          if (hoursPassed > 72) {
              // SÜRE BİTTİ -> Asla Dashboard veya Analiz gösterilmez.
              // Direkt Ödeme Ekranına kilitlenir.
              setInitialRoute('Subscription');
          } else {
              // SÜRE VAR -> Devam edebilir
              setInitialRoute('Dashboard');
          }
      } else {
          // Eğer tarih bir şekilde yoksa güvenli olarak Dashboard aç
          setInitialRoute('Dashboard');
      }

    } catch (error) {
      setInitialRoute('Register');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false, gestureEnabled: false }} // Geri kaydırmayı engelle
      >
        
        {/* Giriş Yolları */}
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Ana Uygulama (Sadece süre varsa erişilebilir) */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        
        {/* ⛔ KİLİT EKRANI (Süre bitince buraya hapsolur) */}
        <Stack.Screen 
            name="Subscription" 
            component={SubscriptionScreen} 
            options={{ gestureEnabled: false }} // Geri tuşunu iptal et
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}