import axios from 'axios';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';
import { GooglePlace, DEFAULT_TYPE_VALUE } from '../constants/constants';
import { loadApiKey } from '../constants/apiKeyStore';

// from 環境變數
// const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const useShopFinder = (location: Location.LocationObjectCoords | null) => {
  const [place, setPlace] = useState<GooglePlace | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 預設值、篩選條件狀態
  const [radius, setRadius] = useState<number>(500);
  const [priceLevel, setPriceLevel] = useState<number>(0);
  const [openNow, setOpenNow] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>(DEFAULT_TYPE_VALUE); 
  const [minRating, setMinRating] = useState<number>(0); 

  const findStore = async () => {
    
    if (!location) {
      Alert.alert('錯誤', '無法取得位置，請稍後再試或檢查權限');
      return;
    }

    // 原 findStore 裡開頭加入：
    const apiKey = await loadApiKey();
    if (!apiKey) {
    Alert.alert('請先設定 API 金鑰');
    return;
    }

    // if (!GOOGLE_API_KEY) {
    //   Alert.alert('設定錯誤', '找不到 GOOGLE_API_KEY');
    //   return;
    // }

    setIsSearching(true);
    setPlace(null);

    try {
      const { latitude, longitude } = location;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    
      // API parameters
      // ranlby=prominence 依照知名度優先/ distance 依照距離優先
      const params: Record<string, any> = {
        location: `${latitude},${longitude}`,
        radius: radius,
        rankby: 'prominence',
        key: apiKey,
      };

      // 根據 selectedTypes 動態設定 API 參數
      if (selectedType === DEFAULT_TYPE_VALUE) { // 'food' (不限)
          params.type = 'restaurant';
          params.keyword = 'restaurant|food';
      } else {
          params.type = selectedType; // 傳遞特定類型 (e.g., 'cafe')
      }

      if (priceLevel > 0) params.maxprice = priceLevel;
      if (openNow) params.opennow = true;

      const res = await axios.get<{ results: GooglePlace[] }>(url, { params });
      let results = res.data.results;
      
      // 使用者端過濾：最低評分 (只篩選評分高於或等於 minRating 的店家)
      if (minRating > 0) {
          // p.rating 可能不存在，所以使用 || 0 作為預設值
          results = results.filter(p => (p.rating || 0) >= minRating);
      }
      
      if (results.length === 0) {
        Alert.alert('通知', '很抱歉，在您設定的條件下沒有找到店家，請嘗試放寬篩選條件，或檢查 API Key 是否正確。');
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
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
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
      selectedType,
      setSelectedType, 
      minRating,
      setMinRating,
    },
    actions: {
      findStore,
      navigateToStore,
    },
  };
};