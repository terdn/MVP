import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  const { analysis, premium } = route.params;

  // Gelen veri zaten temizlenmiş metin (String). Direkt gösteriyoruz.
  // JSON hatası alma ihtimali %0.

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Şık, Minimalist Başlık */}
        <Text style={styles.headerTitle}>ERDN ANALYSIS</Text>
        
        {/* Premium Badge */}
        {premium && (
            <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
            </View>
        )}

        {/* ANALİZ METNİ */}
        {/* Metni olduğu gibi, temiz bir tipografi ile basıyoruz */}
        <View style={styles.textContainer}>
            <Text style={styles.analysisText}>{analysis}</Text>
        </View>

        {/* Buton */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.buttonText}>FINISH</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 0 
  },
  scrollContent: { padding: 25, paddingBottom: 50 },
  
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginBottom: 10, 
    letterSpacing: 3,
    color: '#000'
  },

  premiumBadge: {
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 25,
  },
  premiumText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2
  },

  textContainer: {
    marginBottom: 30,
  },
  
  // Minimalist, Okunaklı Yazı Stili
  analysisText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24, // Satır arası boşluk (Okunabilirlik için)
    textAlign: 'left',
    fontWeight: '400',
    letterSpacing: 0.5
  },

  button: { 
    backgroundColor: '#000', 
    padding: 18, 
    alignItems: 'center', 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000'
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14, 
    letterSpacing: 2 
  }
});