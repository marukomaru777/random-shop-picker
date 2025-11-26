import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { PRICE_OPTIONS, RADIUS_OPTIONS } from '../constants/constants';

interface FilterSectionProps {
  radius: number;
  setRadius: (v: number) => void;
  priceLevel: number;
  setPriceLevel: (v: number) => void;
  openNow: boolean;
  setOpenNow: (v: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  radius,
  setRadius,
  priceLevel,
  setPriceLevel,
  openNow,
  setOpenNow,
}) => {
  const getPriceDisplay = (level: number) => '$'.repeat(level);

  return (
    <View className="mb-4">
      <Text className="text-2xl font-bold text-gray-800 mb-5 px-1">
        🤔 午餐吃什麼？
      </Text>

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