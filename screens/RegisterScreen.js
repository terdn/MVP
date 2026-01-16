import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
// ⭐ Yeni Paket: Ülke Seçimi İçin
import { Picker } from '@react-native-picker/picker';
// ⭐ Hafıza kaydı
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',     // Yaş eklendi (Tıbbi güvenlik için)
    password: '123' // MVP için standart şifre
  });

  const [country, setCountry] = useState('Turkey'); // Varsayılan seçim
  const [loading, setLoading] = useState(false);

  // SENİN GÜNCEL RAILWAY ADRESİN
  const API_URL = 'https://mvp-production-a77e.up.railway.app';

  const handleRegister = async () => {
    // 1. Boş alan kontrolü
    if (!formData.fullName || !formData.email || !formData.age) {
      Alert.alert("Missing Info", "Please fill all fields to activate your free trial.");
      return;
    }

    setLoading(true);

    try {
      // 2. Sunucuya kayıt isteği (/register endpoint'i server.js ile uyumlu)
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email.toLowerCase(),
            password: formData.password,
            country: country, // Seçilen ülke
            age: formData.age
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Hafızaya Kayıt (Auto-Login temeli)
        await AsyncStorage.setItem('userEmail', formData.email.toLowerCase());
        
        // 4. Başarılı ise Analiz ekranına yönlendir (Akış: Kayıt -> Analiz -> Dashboard)
        Alert.alert("Welcome CEO", "Your 72-hour access is active.", [
            { text: "START ANALYSIS", onPress: () => navigation.replace('Analysis') }
        ]);
      } else {
        Alert.alert("Registration Error", data.message || "Could not create account.");
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
        
        {/* TASARIM AYNEN KORUNDU */}
        <Text style={styles.brandTitle}>ERDN COSMETICS</Text>
        <Text style={styles.subtitle}>72-HOUR FREE TRIAL</Text>
        
        <View style={styles.inputContainer}>
          
          {/* İSİM */}
          <TextInput 
            style={styles.input} 
            placeholder="FULL NAME" 
            placeholderTextColor="#999"
            onChangeText={(txt) => setFormData({...formData, fullName: txt})}
          />
          
          {/* EMAIL */}
          <TextInput 
            style={styles.input} 
            placeholder="GMAIL ADDRESS" 
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(txt) => setFormData({...formData, email: txt})}
          />

          {/* YAŞ (YENİ - GÖRÜNÜM AYNI) */}
          <TextInput 
            style={styles.input} 
            placeholder="AGE" 
            placeholderTextColor="#999"
            keyboardType="numeric"
            onChangeText={(txt) => setFormData({...formData, age: txt})}
          />

          {/* ÜLKE SEÇİMİ (YENİ LİSTE - ESKİ GÖRÜNÜM) */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={country}
              onValueChange={(itemValue) => setCountry(itemValue)}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              {/* GLOBAL PAZAR LİSTESİ */}
              <Picker.Item label="🇹🇷 Turkey" value="Turkey" />
              <Picker.Item label="🇺🇸 USA" value="USA" />
              <Picker.Item label="🇩🇪 Germany" value="Germany" />
              <Picker.Item label="🇬🇧 UK" value="UK" />
              <Picker.Item label="🇷🇺 Russia" value="Russia" />
              <Picker.Item label="🇧🇷 Brazil" value="Brazil" />
              <Picker.Item label="🇰🇷 South Korea" value="South Korea" />
              <Picker.Item label="🇦🇪 UAE" value="UAE" />
              <Picker.Item label="🇫🇷 France" value="France" />
              <Picker.Item label="🇮🇹 Italy" value="Italy" />
              <Picker.Item label="🇨🇦 Canada" value="Canada" />
              <Picker.Item label="🌍 Other" value="Other" />
            </Picker>
          </View>

        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>ACTIVATE MY ACCESS</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>No credit card required for trial.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  
  brandTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    textAlign: 'center', 
    letterSpacing: 4, 
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  
  subtitle: { 
    fontSize: 12, 
    textAlign: 'center', 
    color: '#666', 
    letterSpacing: 2, 
    marginBottom: 40 
  },
  
  inputContainer: { marginBottom: 30 },
  
  // Input Stilleri (Eskisiyle Birebir Aynı)
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#000', 
    paddingVertical: 15, 
    marginBottom: 20, 
    fontSize: 14, // Biraz daha şık durması için 16 yerine 14
    color: '#000',
    letterSpacing: 1
  },

  // Picker için özel stil (Input gibi görünmesi için)
  pickerContainer: {
    borderBottomWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    justifyContent: 'center'
  },
  picker: {
    height: 55, 
    width: '100%',
    color: '#000',
  },
  
  button: { 
    backgroundColor: '#000', 
    padding: 20, 
    alignItems: 'center', 
    borderRadius: 0 
  },
  
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    letterSpacing: 2, 
    fontSize: 14,
    textTransform: 'uppercase'
  },
  
  footerNote: { 
    textAlign: 'center', 
    color: '#999', 
    fontSize: 11, 
    marginTop: 20 
  }
});