import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  const { analysis, premium } = route.params; 
  
  // Veriyi kutulara yerleştirmek için hazırlıyoruz
  let data = {};
  try {
    data = typeof analysis === 'object' ? analysis : JSON.parse(analysis);
  } catch (e) {
    data = { skin_profile: { concern: "Analiz yüklenirken hata oluştu." } };
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Text style={styles.headerTitle}>ERDN ANALYSIS</Text>

        {/* 1. KUTU: CİLT PROFİLİ (Kalın Çizgili) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKIN PROFILE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{data.skin_profile?.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Undertone:</Text>
            <Text style={styles.value}>{data.skin_profile?.undertone}</Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.concern}>{data.skin_profile?.concern}</Text>
        </View>

        {/* 2. KUTU: ÖNERİLER */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKIN CARE</Text>
          {data.recommendations?.map((item, index) => (
            <Text key={index} style={styles.listItem}>• {item}</Text>
          ))}
        </View>

        {/* 3. KUTU: RUTİN (GÜNDÜZ SOLDA - GECE SAĞDA) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THE ROUTINE</Text>
          <View style={styles.routineContainer}>
            {/* SOL TARAF */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>DAY ☀️</Text>
              {data.routine?.day?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
            
            {/* ORTA ÇİZGİ */}
            <View style={styles.verticalLine} />

            {/* SAĞ TARAF */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>NIGHT 🌙</Text>
              {data.routine?.night?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 4. KUTU: MAKYAJ (SADECE PREMIUM - ÖZEL BÖLÜM) */}
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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  headerTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
  
  // KUTU TASARIMI (KALIN ÇİZGİLİ & ŞIK)
  card: {
    borderWidth: 2, // Kalın çizgi
    borderColor: '#222', 
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FAFAFA'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  
  // RUTİN BÖLMESİ
  routineContainer: { flexDirection: 'row' },
  routineCol: { flex: 1, paddingHorizontal: 5 },
  verticalLine: { width: 1, backgroundColor: '#888', marginHorizontal: 8 },
  subTitle: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  routineText: { fontSize: 11, marginBottom: 4, color: '#333', lineHeight: 16 },

  // MAKYAJ ÖZEL ALANI
  avoidBox: { marginTop: 15, backgroundColor: '#eee', padding: 8 },
  avoidLabel: { fontWeight: '700', fontSize: 12, color: '#333' },
  avoidValue: { fontSize: 12, color: '#555' },

  button: { backgroundColor: '#000', padding: 16, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});