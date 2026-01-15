import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  // Gelen veri artık %100 Metin (String). Hata şansı yok.
  const { analysis, premium } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Şık, Minimalist Başlık */}
        <Text style={styles.headerTitle}>ERDN ANALYSIS</Text>
        
        {/* Premium Badge (Sadece Premium ise görünür) */}
        {premium && (
            <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM REPORT</Text>
            </View>
        )}

        {/* ANALİZ METNİ */}
        {/* Metni olduğu gibi, temiz bir tipografi ile basıyoruz */}
        <View style={styles.textContainer}>
            <Text style={styles.analysisText}>{analysis}</Text>
        </View>

        {/* Finish Butonu */}
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
    // Android çentik sorunu için boşluk
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 0 
  },
  scrollContent: { padding: 25, paddingBottom: 50 },
  
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    textAlign: 'center', 
    marginBottom: 10, 
    letterSpacing: 3,
    color: '#000',
    textTransform: 'uppercase'
  },

  premiumBadge: {
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 30,
    borderRadius: 0
  },
  premiumText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  textContainer: {
    marginBottom: 30,
  },
  
  // Minimalist, Okunaklı Yazı Stili (Senin istediğin Excel olmayan görünüm)
  analysisText: {
    fontSize: 15,
    color: '#111',       // Tam siyah değil, yumuşak siyah
    lineHeight: 26,      // Satır arası boşluk (Okunabilirlik için çok önemli)
    textAlign: 'left',
    fontWeight: '500',   // Biraz dolgun
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