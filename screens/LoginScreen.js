import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // SENİN RAILWAY ADRESİN
  const API_URL = 'https://mvp-production-a77e.up.railway.app'; 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // ⭐ 1. ADIM: CİHAZ KİMLİĞİNİ BUL VEYA OLUŞTUR
      // (Netflix Modeli için şart: Giriş yapan cihazı tanımalıyız)
      let deviceId = await AsyncStorage.getItem('deviceId');
      
      // Eğer telefonda kayıtlı bir kimlik yoksa (yeni yüklendiyse), rastgele oluştur.
      if (!deviceId) {
          deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }

      // 2. ADIM: Sunucuya Mail, Şifre VE DeviceID gönder
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email.toLowerCase(),
            password: password,
            deviceId: deviceId // ⭐ BURASI EKLENDİ (Tahtı bu cihaza ver diyoruz)
        })
      });

      const data = await response.json();

      if (response.ok) {
        // --- BAŞARILI GİRİŞ ---
        await AsyncStorage.setItem('userEmail', email.toLowerCase());
        await AsyncStorage.setItem('deviceId', deviceId); // ⭐ Kimliği hafızaya kaydet (Bir dahaki sefere hatırlasın)
        
        // Dashboard'a yönlendir
        navigation.replace('Dashboard', { 
            premium: data.user.isPremium,
            analysisData: null 
        });

      } else {
        Alert.alert("Access Denied", data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* HEADER */}
        <Text style={styles.brandTitle}>ERDN COSMETICS</Text>
        <Text style={styles.subtitle}>WELCOME BACK</Text>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="EMAIL ADDRESS" 
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput 
            style={styles.input} 
            placeholder="PASSWORD" 
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>LOG IN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
            <Text style={styles.linkText}>New here? <Text style={{fontWeight:'bold'}}>Create Account</Text></Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  brandTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 4, marginBottom: 5, textTransform: 'uppercase' },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#666', letterSpacing: 2, marginBottom: 40, fontWeight: '600' },
  inputContainer: { marginBottom: 30 },
  input: { borderBottomWidth: 1, borderColor: '#000', paddingVertical: 15, marginBottom: 20, fontSize: 14, color: '#000', letterSpacing: 1 },
  button: { backgroundColor: '#000', padding: 20, alignItems: 'center', borderRadius: 0 },
  buttonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 2, fontSize: 14, textTransform: 'uppercase' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#000', fontSize: 12 }
});