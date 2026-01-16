import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    password: '123' 
  });

  const [country, setCountry] = useState('Turkey');
  const [loading, setLoading] = useState(false);

  // SENİN RAILWAY ADRESİN
  const API_URL = 'https://mvp-production-a77e.up.railway.app';

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.age) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      // ⭐ 1. CİHAZ KİMLİĞİ OLUŞTUR (Basit bir Random ID)
      // Bu ID, bu telefonu sistemde "Tek Yetkili" yapar.
      const deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // 2. Sunucuya Kayıt İsteği (deviceId eklendi)
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email.toLowerCase(),
            password: formData.password,
            country: country,
            age: formData.age,
            deviceId: deviceId // ⭐ KRİTİK: Cihazı sunucuya tanıtıyoruz
        })
      });

      const data = await response.json();

      if (response.ok) {
        // --- BAŞARILI KAYIT ---
        
        // 3. Hafızaya Gerekli Bilgileri Kaydet
        await AsyncStorage.setItem('userEmail', formData.email.toLowerCase());
        await AsyncStorage.setItem('deviceId', deviceId); // Cihaz ID'sini sakla (Login'de lazım olur)
        
        // ⭐ 4. KRONOMETREYİ BAŞLAT (72 Saat Kilidi İçin Şart)
        await AsyncStorage.setItem('trialStartDate', Date.now().toString()); 
        
        // 5. İçeri Al (Dashboard'a yönlendiriyoruz, App.js kontrol edecek zaten)
        Alert.alert("Welcome CEO", "Your 72-hour access has started.", [
            { text: "ENTER DASHBOARD", onPress: () => navigation.replace('Dashboard') }
        ]);

      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brandTitle}>ERDN COSMETICS</Text>
        <Text style={styles.subtitle}>72-HOUR FREE TRIAL</Text>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} placeholder="FULL NAME" placeholderTextColor="#999"
            onChangeText={(txt) => setFormData({...formData, fullName: txt})}
          />
          <TextInput 
            style={styles.input} placeholder="GMAIL ADDRESS" placeholderTextColor="#999"
            keyboardType="email-address" autoCapitalize="none"
            onChangeText={(txt) => setFormData({...formData, email: txt})}
          />
          <TextInput 
            style={styles.input} placeholder="AGE" placeholderTextColor="#999"
            keyboardType="numeric"
            onChangeText={(txt) => setFormData({...formData, age: txt})}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={country}
              onValueChange={(itemValue) => setCountry(itemValue)}
              style={styles.picker} dropdownIconColor="#000"
            >
              <Picker.Item label="🇹🇷 Turkey" value="Turkey" />
              <Picker.Item label="🇺🇸 USA" value="USA" />
              <Picker.Item label="🇩🇪 Germany" value="Germany" />
              <Picker.Item label="🌍 Other" value="Other" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ACTIVATE ACCESS</Text>}
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>No credit card required for trial.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  brandTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 4, marginBottom: 5 },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#666', letterSpacing: 2, marginBottom: 40 },
  inputContainer: { marginBottom: 30 },
  input: { borderBottomWidth: 1, borderColor: '#000', paddingVertical: 15, marginBottom: 20, fontSize: 14, letterSpacing: 1 },
  pickerContainer: { borderBottomWidth: 1, borderColor: '#000', marginBottom: 20, justifyContent: 'center' },
  picker: { height: 55, width: '100%' },
  button: { backgroundColor: '#000', padding: 20, alignItems: 'center', borderRadius: 0 },
  buttonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 2, fontSize: 14 },
  footerNote: { textAlign: 'center', color: '#999', fontSize: 11, marginTop: 20 }
});