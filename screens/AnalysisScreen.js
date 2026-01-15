import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  const { analysis, premium } = route.params; 
  
  let data = {};
  
  try {
    // Gelen veriyi kontrol et (Debug için)
    // Eğer string ise JSON'a çevir, zaten obje ise direkt kullan
    data = typeof analysis === 'object' ? analysis : JSON.parse(analysis);
  } catch (e) {
    console.error("JSON Hatası:", e);
    // Hata olursa boş şablon göster (Çökmemesi için)
    data = { 
        skin_profile: { 
            type: "Analiz Yükleniyor...", 
            undertone: "-", 
            concern: "Lütfen bekleyin veya tekrar deneyin." 
        } 
    };
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Text style={styles.headerTitle}>ERDN ANALYSIS</Text>

        {/* 1. KUTU: SKIN PROFILE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKIN PROFILE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{data.skin_profile?.type || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Undertone:</Text>
            <Text style={styles.value}>{data.skin_profile?.undertone || "-"}</Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.concern}>{data.skin_profile?.concern || "-"}</Text>
        </View>

        {/* 2. KUTU: ÖNERİLER */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKIN CARE RECOMMENDATIONS</Text>
          {data.recommendations?.map((item, index) => (
            <Text key={index} style={styles.listItem}>• {item}</Text>
          ))}
          {!data.recommendations && <Text style={styles.value}>-</Text>}
        </View>

        {/* 3. KUTU: RUTİN (GÜNDÜZ SOLDA - GECE SAĞDA - EMOJİSİZ) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THE ROUTINE</Text>
          <View style={styles.routineContainer}>
            {/* SOL: DAY */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>DAY</Text> 
              {data.routine?.day?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
            
            {/* ORTA ÇİZGİ */}
            <View style={styles.verticalLine} />

            {/* SAĞ: NIGHT */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>NIGHT</Text>
              {data.routine?.night?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 4. KUTU: MAKYAJ (SADECE PREMIUM) */}
        {/* Server düzgün JSON verirse burası otomatik görünür */}
        {premium && data.makeup && (
          <View style={[styles.card, { borderColor: '#000', borderWidth: 2.5 }]}> 
            <Text style={styles.cardTitle}>MAKE UP STUDIO</Text>
            
            <Text style={styles.label}>Foundation:</Text>
            <Text style={styles.value}>{data.makeup.foundation}</Text>
            
            <Text style={[styles.label, {marginTop:10}]}>Lip & Gloss:</Text>
            <Text style={styles.value}>{data.makeup.lips} / {data.makeup.gloss}</Text>

            <View style={styles.avoidBox}>
              <Text style={styles.avoidLabel}>Suggested to Avoid:</Text>
              <Text style={styles.avoidValue}>{data.makeup.avoid}</Text>
            </View>
          </View>
        )}

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
    // ⭐ ANDROID İÇİN KRİTİK DÜZELTME:
    // Bu satır yazının kameranın altına girmesini engeller.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0 
  },
  scrollContent: { padding: 20, paddingBottom: 50 },
  headerTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
  
  // KUTU TASARIMI (KALIN ÇİZGİLİ)
  card: {
    borderWidth: 2, 
    borderColor: '#222', 
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FAFAFA'
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: '700', fontSize: 13 },
  value: { fontSize: 13, flex: 1, textAlign: 'right', color: '#444' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  concern: { fontStyle: 'italic', fontSize: 13, color: '#666', lineHeight: 18 },
  listItem: { fontSize: 13, marginBottom: 4, lineHeight: 20 },
  
  // RUTİN BÖLÜMÜ
  routineContainer: { flexDirection: 'row' },
  routineCol: { flex: 1, paddingHorizontal: 5 },
  verticalLine: { width: 1, backgroundColor: '#888', marginHorizontal: 8 },
  subTitle: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  routineText: { fontSize: 11, marginBottom: 4, color: '#333', lineHeight: 16 },

  // MAKYAJ ÖZEL
  avoidBox: { marginTop: 15, backgroundColor: '#eee', padding: 8 },
  avoidLabel: { fontWeight: '700', fontSize: 12, color: '#333' },
  avoidValue: { fontSize: 12, color: '#555' },

  button: { backgroundColor: '#000', padding: 16, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});