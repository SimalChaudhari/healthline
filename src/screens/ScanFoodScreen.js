import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, ScanLine } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiary } from '../context/DiaryContext';
import { colors } from '../config/colors';
import { FONT } from '../config/fonts';
import AiBadge from '../components/AiBadge';
import { getFoodById } from '../data/foods';

export default function ScanFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'lunch';
  const { addFood } = useDiary();
  const [scanned, setScanned] = useState(false);

  const demo = getFoodById('f11');

  const useDemo = () => {
    if (demo) addFood(meal, demo);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} style={styles.close}>
            <X size={20} color="#FFFFFF" />
          </Pressable>
          <AiBadge label="AI later" />
        </View>

        <Text style={styles.headline}>Scan your food</Text>
        <Text style={styles.sub}>Point the camera at a meal or drink. Recognition will plug in here.</Text>

        <View style={styles.finder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.box}>
            <ScanLine size={28} color="#F5C542" />
            <Text style={styles.boxLbl}>{scanned ? 'Iced Latte detected' : 'Scan a meal'}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          {!scanned ? (
            <Pressable style={styles.cta} onPress={() => setScanned(true)}>
              <Text style={styles.ctaText}>Simulate scan</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.cta} onPress={useDemo}>
              <Text style={styles.ctaText}>Log Iced Latte · 120 kcal</Text>
            </Pressable>
          )}
          <Text style={styles.hint}>Demo only — camera + AI model not connected.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0B' },
  safe: { flex: 1, paddingHorizontal: 20 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '400',
    marginTop: 20,
    fontFamily: FONT.nova,
  },
  sub: { color: '#9CA3AF', fontSize: 14, marginTop: 8, lineHeight: 20 },
  finder: {
    flex: 1,
    marginVertical: 28,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderWidth: 2,
    borderColor: '#F5C542',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  boxLbl: { color: '#F5C542', fontWeight: '700' },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FFFFFF',
  },
  tl: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  bottom: { paddingBottom: 12 },
  cta: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  hint: { color: '#6B7280', textAlign: 'center', marginTop: 10, fontSize: 12 },
});
