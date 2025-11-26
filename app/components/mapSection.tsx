import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// 定義 Region 結構
interface RegionType {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

// 定義 Location 結構 (來自 useUserLocation)
interface LocationData {
    latitude: number;
    longitude: number;
}

// 定義 Place 結構 (來自 useShopFinder，假設其使用 Google Places API 的 lat/lng 格式)
interface Place {
    name: string;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    }
}

interface mapSectionProps {
  location: LocationData | null;
  place: Place | null;
  getMapRegion: () => RegionType; // 接收計算 region 的函式
}

const IS_WEB = Platform.OS === 'web';

export default function MapSection({ location, place, getMapRegion }: mapSectionProps) {
  return (
    // 使用 absolute inset-0 讓地圖佈滿整個螢幕
    <View className="absolute inset-0">
      {!IS_WEB ? (
        <MapView
          style={StyleSheet.absoluteFill}
          region={getMapRegion()}
          showsUserLocation={true}
          scrollEnabled={true} // 允許地圖拖動
          zoomEnabled={true}   // 允許地圖縮放
          provider={PROVIDER_GOOGLE}
        >
          {/* 餐廳結果標記 (已修正為使用 .lat/.lng) */}
          {place && (
            <Marker
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
              pinColor="#FF6347"
            />
          )}
          {/* 如果需要顯示多個城市/地點的標記，可以在此處加入額外的 Marker 陣列 */}
        </MapView>
      ) : (
        // Web 佔位符 - 已轉換為使用 NativeWind
        <View className="absolute inset-0 bg-gray-300 justify-center items-center p-5">
            <Text className="text-base font-bold text-gray-700">地圖 (僅支援 iOS / Android)</Text>
            {location && (
                <Text className="mt-2 text-xs text-gray-600 text-center">目前位置：{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
            )}
        </View>
      )}
      
      {/* 地圖標籤 (放在 MapView 內部，使用絕對定位) */}
      <View className="absolute top-5 left-4 bg-white/90 px-3 py-1 rounded-lg z-10">
        <Text className="text-xs font-bold text-gray-700">
          {place ? '📍 餐廳位置' : '🗺️ 您的位置'}
        </Text>
      </View>
    </View>
  );
}