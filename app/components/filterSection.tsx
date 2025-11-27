import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { PRICE_OPTIONS, RADIUS_OPTIONS, TYPE_OPTIONS, RATING_OPTIONS } from '../constants/constants'; 

interface FilterSectionProps {
  radius: number;
  setRadius: (v: number) => void;
  priceLevel: number;
  setPriceLevel: (v: number) => void;
  openNow: boolean;
  setOpenNow: (v: boolean) => void;
  selectedType: string; 
  setSelectedType: (v: string) => void;
  minRating: number;
  setMinRating: (v: number) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
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
}) => {
  const getPriceDisplay = (level: number) => (level === 0 ? '不限' : '$'.repeat(level));
  
  const getSelectedTypeLabel = (value: string) => {
    return TYPE_OPTIONS.find(opt => opt.value === value)?.label || TYPE_OPTIONS[0].label;
  };
  
  const getMinRatingLabel = (value: number) => {
    return RATING_OPTIONS.find(opt => opt.value === value)?.label || RATING_OPTIONS[0].label;
  };

  return (
    <View className="mb-4">
      {/* 類型篩選 (單選邏輯 - 自動換行) */}
      <View className="mb-4 border-b border-gray-100 pb-3">
        <Text className="text-sm font-semibold text-gray-600 mb-2">
          餐廳類型: <Text className="text-orange-500 font-bold">{getSelectedTypeLabel(selectedType)}</Text>
        </Text>
        <View className="flex-row flex-wrap">
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelectedType(opt.value)}
                className={`m-1 px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/*  最低評分篩選 */}
      <View className="mb-4 border-b border-gray-100 pb-3">
        <Text className="text-sm font-semibold text-gray-600 mb-2">
          最低評分: <Text className="text-yellow-500 font-bold">{getMinRatingLabel(minRating)}</Text>
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = minRating === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setMinRating(opt.value)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-yellow-500 border-yellow-500' // 使用黃色表示評分
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* 距離篩選 */}
      <View className="mb-4 border-b border-gray-100 pb-3">
        <Text className="text-sm font-semibold text-gray-600 mb-2">
          距離上限: <Text className="text-orange-500 font-bold">{RADIUS_OPTIONS.find(r => r.value === radius)?.label}</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {RADIUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setRadius(opt.value)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                radius === opt.value
                  ? 'bg-orange-500 border-orange-500'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  radius === opt.value ? 'text-white' : 'text-gray-500'
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 價格篩選 */}
      <View className="mb-4 border-b border-gray-100 pb-3">
        <Text className="text-sm font-semibold text-gray-600 mb-2">
          預算: <Text className="text-orange-500 font-bold">{priceLevel === 0 ? '不限' : `${getPriceDisplay(priceLevel)} `}</Text>
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity
            onPress={() => setPriceLevel(0)}
            className={`px-4 py-2 rounded-full border items-center ${
              priceLevel === 0
                ? 'bg-orange-500 border-orange-500'
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                priceLevel === 0 ? 'text-white' : 'text-gray-500'
              }`}
            >
              不限
            </Text>
          </TouchableOpacity>
          {PRICE_OPTIONS.map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setPriceLevel(level)}
              className={`px-4 py-2 rounded-full border min-w-[50px] items-center ${
                priceLevel === level
                  ? 'bg-orange-500 border-orange-500'
                  : 'bg-gray-100 border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  priceLevel === level ? 'text-white' : 'text-gray-500'
                }`}
              >
                {getPriceDisplay(level)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 營業中開關 */}
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-row items-center">
          <Ionicons
            name={openNow ? 'time' : 'time-outline'}
            size={18}
            color={openNow ? '#4682B4' : '#666'}
          />
          <Text className="ml-2 text-sm font-semibold text-gray-600">
            只顯示營業中: <Text className="text-orange-500">{openNow ? '是' : '否'}</Text>
          </Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={openNow ? '#4682B4' : '#f4f3f4'}
          onValueChange={setOpenNow}
          value={openNow}
        />
      </View>
    </View>
  );
};