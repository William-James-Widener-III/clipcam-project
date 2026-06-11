import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';
import { sendFramesToBackend } from './src/services/api';

export default function App() {
  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [result, setResult] = useState(null);

  // Request native hardware access keys immediately on boot
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const runIdentification = async () => {
    if (!cameraRef.current || isIdentifying) return;
    setIsIdentifying(true);
    setResult(null);

    try {
      const collectedFrames = [];
      
      // Capture 4 distinct frames spaced 350ms apart for optimal scene tracking
      for (let i = 0; i < 4; i++) {
  const snapshot = await cameraRef.current.takeSnapshot({ 
    quality: 80, 
    skipMetadata: true 
  });
  
  // FIX: Ensure the path always has the 'file://' prefix required by Expo FileSystem
  const cleanPath = snapshot.path.startsWith('file://') 
    ? snapshot.path 
    : `file://${snapshot.path}`;
  
  // Convert the local absolute file path into a text-friendly Base64 data package
  const base64Data = await FileSystem.readAsStringAsync(cleanPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  collectedFrames.push(base64Data);
  if (i < 3) await new Promise((resolve) => setTimeout(resolve, 350));
}

      // Relay payloads over Wi-Fi network to Node backend
      const analysisData = await sendFramesToBackend(collectedFrames);
      setResult(analysisData);

    } catch (err) {
      console.error(err);
      alert("Network timeout or connection error tracking frames.");
    } finally {
      setIsIdentifying(false);
    }
  };

  if (!hasPermission) {
    return <View style={styles.fallback}><Text style={{color: '#fff'}}>Camera hardware access required.</Text></View>;
  }
  if (!device) {
    return <View style={styles.fallback}><Text style={{color: '#fff'}}>No active camera hardware located.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraWrapper}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        {isIdentifying && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#00E5FF" />
            <Text style={styles.overlayText}>Fingerprinting Scene Visuals...</Text>
          </View>
        )}
      </View>

      <View style={styles.controlPanel}>
        <TouchableOpacity 
          style={[styles.shazamButton, isIdentifying && styles.disabledButton]} 
          onPress={runIdentification}
          disabled={isIdentifying}
        >
          <Text style={styles.buttonText}>{isIdentifying ? "SCANNING" : "CLIPCAM"}</Text>
        </TouchableOpacity>

        {result && (
          <ScrollView style={styles.resultsCard}>
            {result.found ? (
              <>
                <Text style={styles.title}>{result.title} ({result.year || 'N/A'})</Text>
                <Text style={styles.meta}>{result.type} • Confidence: {result.confidence}</Text>
                {result.season_episode && <Text style={styles.meta}>Episode: {result.season_episode}</Text>}
                <Text style={styles.body}><Text style={{fontWeight: 'bold', color: '#FFF'}}>Scene Description: </Text>{result.scene_description}</Text>
                <Text style={styles.body}><Text style={{fontWeight: 'bold', color: '#FFF'}}>Visual Clues: </Text>{result.visual_clues}</Text>
              </>
            ) : (
              <Text style={styles.body}>Match Failed: {result.not_found_reason || "Try keeping your camera focused straight on the action."}</Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' },
  cameraWrapper: { flex: 1.2, overflow: 'hidden', backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,15,25,0.75)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#00E5FF', marginTop: 10, fontSize: 16, fontWeight: '600' },
  controlPanel: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  shazamButton: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, marginTop: 15 },
  disabledButton: { backgroundColor: '#1F2937' },
  buttonText: { color: '#0B0F19', fontWeight: '800', letterSpacing: 1 },
  resultsCard: { width: '100%', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginTop: 15 },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  meta: { color: '#00E5FF', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  body: { color: '#94A3B8', fontSize: 14, lineHeight: 20, marginTop: 6 }
});