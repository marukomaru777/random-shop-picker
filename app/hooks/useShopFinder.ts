import axios from 'axios';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';
import { GooglePlace } from '../constants/constants';

// 請確保環境變數設定正確，或在此暫時替換
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const useShopFinder = (location: Location.LocationObjectCoords | null) => {
  const [place, setPlace] = useState<GooglePlace | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 篩選狀態管理
  const [radius, setRadius] = useState<number>(1000);
  const [priceLevel, setPriceLevel] = useState<number>(0);
  const [openNow, setOpenNow] = useState<boolean>(true);

  const findStore = async () => {
    if (!location) {
      Alert.alert('錯誤', '無法取得位置，請稍後再試或檢查權限');
      return;
    }

    if (!GOOGLE_API_KEY) {
      Alert.alert('設定錯誤', '找不到 GOOGLE_API_KEY');
      return;
    }

    setIsSearching(true);
    setPlace(null);

    try {
      const { latitude, longitude } = location;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

      const params: Record<string, any> = {
        location: `${latitude},${longitude}`,
        radius: radius,
        keyword: 'restaurant|food',
        type: 'food',
        rankby: 'prominence',
        key: GOOGLE_API_KEY,
      };

      if (priceLevel > 0) params.maxprice = priceLevel;
      if (openNow) params.opennow = true;

      const res = await axios.get<{ results: GooglePlace[] }>(url, { params });
      const results = res.data.results;

      if (results.length === 0) {
        Alert.alert('通知', '很抱歉，在您設定的條件下沒有找到店家，請嘗試放寬篩選條件。');
      } else {
        const randomIndex = Math.floor(Math.random() * results.length);
        setPlace(results[randomIndex]);
      }
    } catch (error: any) {
      Alert.alert('錯誤', '搜尋失敗，請稍後再試');
      console.error('API Error:', error.response?.data || error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToStore = () => {
    if (!place) return;
    const { lat, lng } = place.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert('錯誤', '無法開啟 Google 地圖應用程式');
    });
  };

  return {
    place,
    isSearching,
    filters: {
      radius,
      setRadius,
      priceLevel,
      setPriceLevel,
      openNow,
      setOpenNow,
    },
    actions: {
      findStore,
      navigateToStore,
    },
  };
};