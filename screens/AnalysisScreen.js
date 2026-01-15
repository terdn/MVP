import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  // ⭐ EKLEME: route.params veya içindeki veriler eksikse uygulama çökmesin diye varsayılan değer atadık.
  const { analysis, premium } = route.params || { analysis: "Analysis not found. Please try again.", premium: false };

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
    lineHeight: 26,
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