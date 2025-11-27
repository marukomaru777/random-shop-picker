import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { GooglePlace } from '../constants/constants';

interface ShopSectionProps {
  place: GooglePlace | null;
  location: Location.LocationObjectCoords | null;
  isLoading: boolean;
  onNavigate: () => void;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  place,
  location,
  isLoading,
  onNavigate,
}) => {
  if (!place) {
    return (
      <View className="mx-5 my-5 items-center justify-center py-8 bg-neutral-100 rounded-xl border-2 border-dashed border-gray-200">
        <Ionicons name="map" size={50} color="#ccc" />
        <Text className="text-gray-500 mt-3 text-center px-4">
          {isLoading
            ? '正在搜尋...'
            : location
            ? '點擊按鈕，開始尋找您的幸運餐廳！'
            : '等待定位中...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-5 my-5 p-2 bg-white rounded-xl elevation-5">
      <Text className="text-xl font-extrabold text-gray-800 mb-3 flex-row items-center">
        <Ionicons name="restaurant" size={20} color="#333" /> {place.name}
      </Text>
      
      <View className="flex-row items-start mb-2">
        <Ionicons name="map-outline" size={16} color="#666" style={{ marginTop: 2 }} />
        <Text className="ml-2 text-gray-600 text-sm flex-1">{place.vicinity}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text className="ml-2 text-gray-600 text-sm">
          評分: <Text className="font-bold text-gray-800">{place.rating || 'N/A'}</Text>
          <Text className="text-xs text-gray-400"> (共 {place.user_ratings_total || 0} 則)</Text>
        </Text>
      </View>

      <View>
        <Button title="立即導航" onPress={onNavigate} color="#4682B4" />
      </View>
    </View>
  );
};