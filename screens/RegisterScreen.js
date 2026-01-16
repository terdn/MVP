import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';
// ⭐ Hafıza kaydı için gerekli kütüphane
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: ''
  });

  const startTrial = async () => {
    // 1. Boş alan kontrolü
    if (!formData.fullName || !formData.email || !formData.country) {
      Alert.alert("Missing Info", "Please fill all fields to activate your free trial.");
      return;
    }

    try {
      // 2. Sunucuya kayıt isteği (URL'ini kendi Railway adresinle güncellemeyi unutma)
      const response = await axios.post('https://mvp-production-a77e.up.railway.app/api/start-trial', formData);
      
      if (response.data.success) {
        // 3. ⭐ KRİTİK: E-postayı telefon hafızasına kaydediyoruz (Kilit sistemi için)
        await AsyncStorage.setItem('userEmail', formData.email);
        
        Alert.alert("Trial Activated", "Your 72-hour full access has started!");
        
        // 4. Deneme süresinde olduğu için Premium haklarıyla Welcome ekranına yönlendiriyoruz
        navigation.navigate("Welcome", { premium: true, userEmail: formData.email });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not reach the server. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.brandTitle}>ERDN COSMETICS</Text>
        <Text style={styles.subtitle}>72-HOUR FREE TRIAL</Text>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            placeholderTextColor="#999"
            onChangeText={(txt) => setFormData({...formData, fullName: txt})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Gmail Address" 
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(txt) => setFormData({...formData, email: txt})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Country" 
            placeholderTextColor="#999"
            onChangeText={(txt) => setFormData({...formData, country: txt})}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={startTrial}>
          <Text style={styles.buttonText}>ACTIVATE MY ACCESS</Text>
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
  
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#000', 
    paddingVertical: 15, 
    marginBottom: 20, 
    fontSize: 16, 
    color: '#000' 
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