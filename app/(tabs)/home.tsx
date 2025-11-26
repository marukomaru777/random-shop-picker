import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

// ⚠️ 提醒：在實際生產環境中，請勿將 API Key 直接寫在前端程式碼中！
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// 定義 Place 資料介面 (根據 Google Places API 回傳結構)
interface GooglePlace {
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
}

// 距離選項定義
const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '1.5km', value: 1500 },
  { label: '2km', value: 2000 },
];

// 價格選項定義 (0: 不限, 1: $, 2: $$, 3: $$$, 4: $$$$)
const PRICE_OPTIONS = [1, 2, 3, 4];

export default function RandomShopSelectorScreen() {
  // 定義 State 的型別
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [place, setPlace] = useState<GooglePlace | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // === 新增篩選狀態 ===
  const [radius, setRadius] = useState<number>(1000); // 預設 1 公里
  const [priceLevel, setPriceLevel] = useState<number>(0); // 預設 0 (不限)
  const [openNow, setOpenNow] = useState<boolean>(true); // 預設只看營業中
  // ======================

  // 取得使用者定位
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('定位權限被拒絕，請在設定中開啟');
        setIsLoading(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc.coords);
      } catch (e) {
        setErrorMsg('無法取得您的位置');
      }
      setIsLoading(false);
    })();
  }, []);

  // 呼叫 Google Places API 查詢附近店家
  const findStore = async () => {
    if (!location) {
      Alert.alert('錯誤', '無法取得位置，請稍後再試或檢查權限');
      return;
    }

    setIsLoading(true);
    setPlace(null);

    try {
      const { latitude, longitude } = location;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

      // 構建 API 參數
      // 使用 Record<string, any> 來容許動態添加參數
      const params: Record<string, any> = {
        location: `${latitude},${longitude}`,
        radius: radius, // 使用距離狀態
        keyword: 'restaurant|food',
        type: 'food',
        rankby: 'prominence', // 注意：若使用 rankby=distance，則不能有 radius，此處使用 prominence 配合 radius
        key: GOOGLE_API_KEY,
      };

      // 價格篩選：使用 maxprice 實現「最高價格等級」篩選
      if (priceLevel > 0) {
        params.maxprice = priceLevel;
      }

      // 營業中篩選：使用 opennow
      if (openNow) {
        params.opennow = true;
      }

      const res = await axios.get<{ results: GooglePlace[] }>(url, { params });
      const results = res.data.results;

      if (results.length === 0) {
        Alert.alert('通知', '很抱歉，在您設定的條件下沒有找到店家，請嘗試放寬篩選條件。');
        return;
      }

      // 隨機挑一間
      const randomIndex = Math.floor(Math.random() * results.length);
      setPlace(results[randomIndex]);
    } catch (error: any) {
      Alert.alert('錯誤', '搜尋失敗，請稍後再試');
      console.error('API 錯誤:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 導航函式
  const navigateToStore = () => {
    if (!place) return;
    const { lat, lng } = place.geometry.location;
    // 使用更標準的 Google Maps URL 格式
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Alert.alert('錯誤', '無法開啟 Google 地圖應用程式');
    });
  };

  // 根據位置決定地圖顯示的 Region
  const getMapRegion = (): Region => {
    const defaultRegion: Region = {
      latitude: 25.033, // 預設值
      longitude: 121.5654,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };

    if (place) {
      return {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
    }
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
    }
    return defaultRegion;
  };

  // Helper function for price level display
  const getPriceDisplay = (level: number) => {
    return '$'.repeat(level);
  };

  return (
    <View style={styles.container}>
      {/* 頂部控制區 - 包含篩選條件 */}
      <ScrollView style={styles.topControlArea}>
        <Text style={styles.headerText}>🤔 午餐吃什麼？</Text>

        {/* 1. 距離篩選 (Radius) */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            距離上限:{' '}
            <Text style={styles.currentValue}>
              {RADIUS_OPTIONS.find((opt) => opt.value === radius)?.label || ''}
            </Text>
          </Text>
          <View style={styles.buttonGroup}>
            {RADIUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.filterButton, radius === opt.value && styles.filterButtonActive]}
                onPress={() => setRadius(opt.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    radius === opt.value && styles.filterButtonTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. 價格篩選 (Price Level) */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            最高價格:{' '}
            <Text style={styles.currentValue}>
              {priceLevel === 0 ? '不限' : getPriceDisplay(priceLevel) + ' 以下'}
            </Text>
          </Text>
          <View style={styles.buttonGroup}>
            {PRICE_OPTIONS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterButton,
                  priceLevel === level && styles.filterButtonActive,
                  { minWidth: 50 },
                ]}
                onPress={() => setPriceLevel(level)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    priceLevel === level && styles.filterButtonTextActive,
                  ]}
                >
                  {getPriceDisplay(level)}
                </Text>
              </TouchableOpacity>
            ))}
            {/* 不限按鈕 */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                priceLevel === 0 && styles.filterButtonActive,
                { minWidth: 50 },
              ]}
              onPress={() => setPriceLevel(0)}
            >
              <Text
                style={[styles.filterButtonText, priceLevel === 0 && styles.filterButtonTextActive]}
              >
                不限
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. 營業中篩選 (Open Now) */}
        <View style={styles.filterGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.filterLabel}>
              <Ionicons
                name={openNow ? 'time' : 'time-outline'} // 更新為新版 Ionicons 名稱 (v6+)
                size={16}
                color={openNow ? '#4682B4' : '#666'}
              />{' '}
              只顯示營業中:{' '}
              <Text style={styles.currentValue}>{openNow ? '是' : '否 (包含已打烊)'}</Text>
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={openNow ? '#4682B4' : '#f4f3f4'}
              ios_backgroundColor='#3e3e3e'
              onValueChange={setOpenNow}
              value={openNow}
            />
          </View>
        </View>

        {/* 抽餐廳按鈕 */}
        <View style={{ marginTop: 20 }}>
          <Button
            title={isLoading ? '搜尋中...' : '隨機抽一間符合條件的餐廳'}
            onPress={findStore}
            disabled={isLoading || !!errorMsg || !location}
            color='#FF6347'
          />
        </View>

        {/* 狀態訊息 */}
        {(isLoading || errorMsg) && (
          <View style={{ paddingVertical: 10 }}>
            {isLoading && (
              <View style={styles.statusRow}>
                <ActivityIndicator size='small' color='#FF6347' />
                <Text style={styles.statusText}>
                  {location ? '正在搜尋店家...' : '正在取得您的位置...'}
                </Text>
              </View>
            )}
            {errorMsg && (
              <Text style={styles.errorText}>
                <Ionicons name='warning' size={16} color='#B22222' /> {errorMsg}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* 店家資訊卡片 */}
      <ScrollView style={styles.infoScrollArea}>
        {place ? (
          <View style={styles.placeCard}>
            <Text style={styles.placeName}>
              <Ionicons name='restaurant' size={24} color='#333' /> {place.name}
            </Text>
            <View style={styles.detailRow}>
              <Ionicons name='map-outline' size={16} color='#666' />
              <Text style={styles.placeDetail}>地址：{place.vicinity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name='star' size={16} color='#FFD700' />
              <Text style={styles.placeDetail}>
                評分：
                <Text style={{ fontWeight: 'bold' }}>{place.rating || '暫無評分'}</Text> (共{' '}
                {place.user_ratings_total || 0} 則)
              </Text>
            </View>
            <View style={{ marginTop: 15 }}>
              <Button title='立即導航 (Google 地圖)' onPress={navigateToStore} color='#4682B4' />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Ionicons name='map' size={50} color='#ccc' />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {location && !isLoading ? '點擊按鈕，開始尋找您的幸運餐廳！' : '正在等待定位...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 地圖顯示區 */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation={true}
          scrollEnabled={!!place}
          zoomEnabled={!!place}
        >
          {/* 顯示使用者位置的 Marker */}
          {!place && location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title='我的位置'
              pinColor='blue'
            />
          )}

          {/* 顯示抽到的店家 Marker */}
          {place && (
            <Marker
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
              pinColor='#FF6347'
            />
          )}
        </MapView>
        <Text style={styles.mapLabel}>{place ? '📍 餐廳位置' : '🗺️ 您的地圖位置'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topControlArea: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    maxHeight: height * 0.45,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#B22222',
  },
  // === 新增篩選樣式 ===
  filterGroup: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  currentValue: {
    fontWeight: 'bold',
    color: '#FF6347',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // RN 0.71+ 支持，否則用 margin
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6347', // 選擇後的顏色
    borderColor: '#FF6347',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // ======================
  infoScrollArea: {
    flexGrow: 0,
    maxHeight: height * 0.35,
  },
  placeCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  placeName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  placeDetail: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
  },
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 10,
  },
});
