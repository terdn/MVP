import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
// İkonlar için
import { Ionicons } from '@expo/vector-icons';
// Kamera ve Galeri erişimi için
import * as ImagePicker from 'expo-image-picker';

export default function DashboardScreen({ route, navigation }) {
  // Analiz Ekranından gelen verileri alıyoruz
  const { analysisData, premium } = route.params || {};
  
  // Makyaj Detay Penceresi (Modal) Kontrolü
  const [modalVisible, setModalVisible] = useState(false);
  const [makeupLoading, setMakeupLoading] = useState(false);
  const [makeupResult, setMakeupResult] = useState(null);

  // Veri yoksa uygulama çökmesin diye varsayılan boş şablon
  const safeAnalysis = analysisData || {
    products: ["Loading..."],
    routine: { day: [], night: [] }
  };

  // --- KAMERA VE MAKYAJ ANALİZİ FONKSİYONU ---
  const handleMakeupAnalysis = async () => {
    // 1. İzin İste
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera access for makeup analysis.");
      return;
    }

    // 2. Kamerayı Aç
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.5, 
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // 3. Fotoğrafı Sunucuya Gönder
      uploadMakeupPhoto(result.assets[0]);
    }
  };

  const uploadMakeupPhoto = async (photoAsset) => {
    setMakeupLoading(true);
    setModalVisible(true); // Modalı aç (Yükleniyor dönecek)

    const formData = new FormData();
    formData.append('photo', {
      uri: photoAsset.uri,
      type: 'image/jpeg',
      name: 'makeup-selfie.jpg',
    });

    try {
      // SENİN RAILWAY ADRESİN
      const API_URL = 'https://mvp-production-a77e.up.railway.app'; 
      
      const response = await fetch(`${API_URL}/analyze-makeup`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        setMakeupResult(json.data);
      } else {
        Alert.alert("Error", "Makeup analysis failed.");
        setModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Connection failed.");
      setModalVisible(false);
    } finally {
      setMakeupLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* --- 1. HEADER (LOGO & STATÜ) --- */}
        <View style={styles.header}>
            <Text style={styles.logo}>ERDN</Text>
            {premium && <Text style={styles.premiumLabel}>PREMIUM MEMBER</Text>}
        </View>

        {/* --- 2. SELAMLAMA --- */}
        <View style={styles.greeting}>
            <Text style={styles.hiText}>Hi CEO!</Text>
            <Text style={styles.motto}>Your skin barrier looks stronger today.</Text>
        </View>

        {/* --- 3. ANA GÖVDE (SPLIT VIEW - İKİYE BÖLÜNMÜŞ) --- */}
        <View style={styles.splitView}>
            
            {/* SOL SÜTUN: ÜRÜNLER & MAKYAJ */}
            <View style={styles.leftColumn}>
                <Text style={styles.columnTitle}>ESSENTIALS</Text>
                {safeAnalysis.products?.map((item, index) => (
                    <Text key={index} style={styles.productItem}>• {item}</Text>
                ))}

                {/* ⭐ MAKYAJ BUTONU (SADECE PREMIUM) */}
                {premium ? (
                    <TouchableOpacity style={styles.makeupButton} onPress={handleMakeupAnalysis}>
                        <Ionicons name="camera" size={16} color="white" style={{marginBottom:5}} />
                        <Text style={styles.makeupButtonText}>GET INSTANT MAKEUP ADVICE</Text>
                    </TouchableOpacity>
                ) : (
                    // PREMIUM DEĞİLSE - KİLİTLİ GÖSTER VE ABONELİK EKRANINA YÖNLENDİR
                    <TouchableOpacity style={styles.lockedButton} onPress={() => navigation.navigate('Subscription')}> 
                        <Ionicons name="lock-closed" size={16} color="white" style={{marginBottom:5}} />
                        <Text style={styles.makeupButtonText}>UNLOCK MAKEUP AI</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ARA ÇİZGİ */}
            <View style={styles.divider} />

            {/* SAĞ SÜTUN: RUTİN */}
            <View style={styles.rightColumn}>
                <Text style={styles.columnTitle}>ROUTINE</Text>
                
                {/* GÜNDÜZ */}
                <View style={styles.routineBlock}>
                    <Text style={styles.routineHeader}><Ionicons name="sunny" size={14} color="black" /> DAY</Text>
                    {safeAnalysis.routine?.day?.map((step, index) => (
                        <Text key={index} style={styles.routineItem}>{index + 1}. {step}</Text>
                    ))}
                </View>

                {/* GECE */}
                <View style={styles.routineBlock}>
                    <Text style={styles.routineHeader}><Ionicons name="moon" size={14} color="black" /> NIGHT</Text>
                    {safeAnalysis.routine?.night?.map((step, index) => (
                        <Text key={index} style={styles.routineItem}>{index + 1}. {step}</Text>
                    ))}
                </View>
            </View>

        </View>

        {/* --- 4. ALT AKSİYONLAR --- */}
        <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.newScanButton} onPress={() => navigation.navigate('Analysis')}>
                <Text style={styles.newScanText}>NEW SCAN</Text>
            </TouchableOpacity>

            {/* PROGRESS BUTONU (SADECE PREMIUM) */}
            {premium && (
                <TouchableOpacity style={styles.progressButton}>
                    <Text style={styles.progressText}>SEE PROGRESS</Text>
                </TouchableOpacity>
            )}
        </View>

      </ScrollView>

      {/* --- ⭐ GELİŞMİŞ MAKYAJ MODALI (SONUÇ EKRANI) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>INSTANT LOOK</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {makeupLoading ? (
                    <View style={{alignItems:'center', marginTop: 50}}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={{marginTop: 15, fontStyle:'italic'}}>Analyzing your vibe...</Text>
                    </View>
                ) : makeupResult ? (
                    <ScrollView>
                        <Text style={styles.vibeText}>✨ VIBE: {makeupResult.vibe}</Text>

                        {/* RUJ */}
                        <Text style={styles.makeupSection}>💄 LIPS</Text>
                        <Text style={styles.suggestion}>✅ {makeupResult.lips?.suggest}</Text>
                        <Text style={styles.avoid}>❌ Avoid: {makeupResult.lips?.avoid}</Text>

                        {/* FONDÖTEN */}
                        <Text style={styles.makeupSection}>🧴 FOUNDATION</Text>
                        <Text style={styles.suggestion}>✅ {makeupResult.foundation?.suggest}</Text>
                        <Text style={styles.avoid}>❌ Avoid: {makeupResult.foundation?.avoid}</Text>
                        
                        {/* ALLIK */}
                        <Text style={styles.makeupSection}>☺️ BLUSH</Text>
                        <Text style={styles.suggestion}>✅ {makeupResult.blush?.suggest}</Text>
                        <Text style={styles.avoid}>❌ Avoid: {makeupResult.blush?.avoid}</Text>

                        {/* GÖZLER */}
                        <Text style={styles.makeupSection}>👁️ EYES</Text>
                        <Text style={styles.suggestion}>✅ {makeupResult.eyes?.suggest}</Text>
                        <Text style={styles.avoid}>❌ Avoid: {makeupResult.eyes?.avoid}</Text>
                        
                        <Text style={{fontSize:10, color:'#666', marginTop:20, textAlign:'center'}}>
                            *Based on your current lighting and look.
                        </Text>
                    </ScrollView>
                ) : null}
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 20, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  logo: { fontSize: 32, fontWeight: '900', letterSpacing: 5, fontFamily: 'serif' },
  premiumLabel: { fontSize: 10, letterSpacing: 3, marginTop: 5, fontWeight: 'bold' },
  greeting: { marginBottom: 30 },
  hiText: { fontSize: 24, fontWeight: 'bold' },
  motto: { fontSize: 14, color: '#666', marginTop: 5, fontStyle: 'italic' },
  splitView: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  leftColumn: { flex: 1, paddingRight: 10 },
  rightColumn: { flex: 1, paddingLeft: 10 },
  divider: { width: 1, backgroundColor: '#E0E0E0' },
  columnTitle: { fontSize: 12, fontWeight: '900', marginBottom: 15, letterSpacing: 1 },
  productItem: { fontSize: 12, marginBottom: 8, lineHeight: 18 },
  routineBlock: { marginBottom: 20 },
  routineHeader: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  routineItem: { fontSize: 11, marginBottom: 4, color: '#333' },
  
  makeupButton: { marginTop: 20, backgroundColor: '#000', padding: 15, alignItems: 'center' },
  lockedButton: { marginTop: 20, backgroundColor: '#444', padding: 15, alignItems: 'center' }, // Kilitli buton rengi
  makeupButtonText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },

  bottomActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  newScanButton: { borderWidth: 1, borderColor: '#000', paddingVertical: 12, paddingHorizontal: 20 },
  newScanText: { fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  progressButton: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 20 },
  progressText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', height: '65%', padding: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  vibeText: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', fontStyle:'italic' },
  makeupSection: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  suggestion: { fontSize: 13, color: '#000', marginBottom: 2 },
  avoid: { fontSize: 12, color: '#D32F2F', fontStyle: 'italic', marginTop: 2 } 
});