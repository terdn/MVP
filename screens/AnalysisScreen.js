import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  // Veriyi al (Artık JSON formatında geliyor)
  const { analysis, premium } = route.params; 
  
  // Eğer hata varsa veya veri düzgün değilse basit göster
  const data = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;

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
            <Text style={styles.value}>{data.skin_profile?.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Undertone:</Text>
            <Text style={styles.value}>{data.skin_profile?.undertone}</Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.concern}>{data.skin_profile?.concern}</Text>
        </View>

        {/* 2. KUTU: SKIN CARE RECOMMENDATIONS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SKIN CARE RECOMMENDATIONS</Text>
          {data.recommendations?.map((item, index) => (
            <Text key={index} style={styles.listItem}>• {item}</Text>
          ))}
        </View>

        {/* 3. KUTU: THE ROUTINE (YAN YANA) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THE ROUTINE</Text>
          <View style={styles.routineContainer}>
            {/* SOL: DAY */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>DAY ☀️</Text>
              {data.routine?.day?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
            
            {/* DİKEY ÇİZGİ */}
            <View style={styles.verticalLine} />

            {/* SAĞ: NIGHT */}
            <View style={styles.routineCol}>
              <Text style={styles.subTitle}>NIGHT 🌙</Text>
              {data.routine?.night?.map((step, i) => (
                <Text key={i} style={styles.routineText}>{i+1}. {step}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 4. KUTU: MAKE UP (SADECE PREMIUM) */}
        {premium && data.makeup && (
          <View style={[styles.card, { borderColor: '#000' }]}> 
            <Text style={styles.cardTitle}>MAKE UP</Text>
            
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
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  headerTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
  
  // KUTU TASARIMI (KALIN ÇİZGİLİ)
  card: {
    borderWidth: 2, // İstediğin kalın çerçeve
    borderColor: '#333',
    padding: 15,
    marginBottom: 20,
    borderRadius: 0, // Keskin köşeler (Daha şık)
    backgroundColor: '#FAFAFA'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: '700', fontSize: 14 },
  value: { fontSize: 14, flex: 1, textAlign: 'right', color: '#555' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  concern: { fontStyle: 'italic', fontSize: 13, color: '#666' },
  listItem: { fontSize: 14, marginBottom: 4, lineHeight: 20 },
  
  // RUTİN KUTUSU (YAN YANA)
  routineContainer: { flexDirection: 'row' },
  routineCol: { flex: 1, paddingHorizontal: 5 },
  verticalLine: { width: 1, backgroundColor: '#ccc', marginHorizontal: 5 },
  subTitle: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center', fontSize: 12 },
  routineText: { fontSize: 11, marginBottom: 3, color: '#444' },

  // MAKE UP ÖZEL
  avoidBox: { marginTop: 15, backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4 },
  avoidLabel: { fontWeight: '700', fontSize: 12, color: '#555' },
  avoidValue: { fontSize: 12, color: '#777' },

  button: { backgroundColor: '#000', padding: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});