import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  // Veriyi alıyoruz
  const { analysis, premium } = route.params || { analysis: null, premium: false };
  const [displayText, setDisplayText] = useState("Generating medical report...");

  useEffect(() => {
    // BURASI KRİTİK: Gelen JSON verisini senin sevdiğin düz metne çeviriyoruz.
    if (analysis && typeof analysis === 'object') {
      let text = "";

      // 1. CİLT PROFİLİ
      text += "SKIN PROFILE\n";
      text += `Type: ${analysis.skinProfile?.type || 'N/A'}\n`;
      text += `Undertone: ${analysis.skinProfile?.undertone || 'N/A'}\n`;
      text += `Concern: ${analysis.skinProfile?.concern || 'N/A'}\n\n`;

      // 2. ÖNERİLEN ÜRÜNLER
      text += "RECOMMENDED PRODUCTS (Generic)\n";
      if (analysis.products && Array.isArray(analysis.products)) {
        analysis.products.forEach((prod, index) => {
          text += `${index + 1}. ${prod}\n`;
        });
      }
      text += "\n";

      // 3. RUTİN
      text += "ROUTINE\n";
      
      text += "Day:\n"; // Gündüz
      if (analysis.routine?.day && Array.isArray(analysis.routine.day)) {
        analysis.routine.day.forEach((step, index) => {
          text += `${index + 1}. ${step}\n`;
        });
      }

      text += "Night:\n"; // Gece
      if (analysis.routine?.night && Array.isArray(analysis.routine.night)) {
        analysis.routine.night.forEach((step, index) => {
          text += `${index + 1}. ${step}\n`;
        });
      }

      setDisplayText(text); // Hazırlanan metni ekrana bas
    } else if (typeof analysis === 'string') {
      // Eğer eski usul bir hata mesajı vs gelirse direkt göster
      setDisplayText(analysis);
    } else {
      setDisplayText("Analysis data could not be parsed.");
    }
  }, [analysis]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Şık, Minimalist Başlık (DEĞİŞMEDİ) */}
        <Text style={styles.headerTitle}>ERDN ANALYSIS</Text>
        
        {/* Premium Badge (Sadece Premium ise görünür) */}
        {premium && (
            <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM REPORT</Text>
            </View>
        )}

        {/* ANALİZ METNİ (GÖRÜNÜM AYNI) */}
        <View style={styles.textContainer}>
            <Text style={styles.analysisText}>{displayText}</Text>
        </View>

        {/* Finish Butonu - ARTIK DASHBOARD'A GİDİYOR */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.replace('Dashboard', { analysisData: analysis, premium: premium })}
        >
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
  
  analysisText: {
    fontSize: 15,
    color: '#111',
    lineHeight: 26, // Satır arası boşluğu (Rahat okuma için)
    textAlign: 'left',
    fontWeight: '500',
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