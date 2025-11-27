import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Button, Dimensions, ScrollView, Text, View, Pressable } from 'react-native';
import { Region } from 'react-native-maps'; // 只需要 Region 類型
import { FilterSection } from '../components/filterSection';
import { ShopSection } from '../components/shopSection';
import MapSection from '../components/mapSection';
import { useShopFinder } from '../hooks/useShopFinder';
import { useUserLocation } from '../hooks/useUserLocation';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLLAPSED_HEIGHT, EXPANDED_HEIGHT_PERCENT } from '../constants/constants'; 


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default function IndexScreen() {
  // 獲取安全區域內邊距
  const insets = useSafeAreaInsets();
  const { location, errorMsg: locationError, isLoadingLocation } = useUserLocation();
  const { place, isSearching, filters, actions } = useShopFinder(location);

  // --- 狀態管理篩選器展開/收起 ---
  const [isExpanded, setIsExpanded] = useState(true);

  // --- 店家資訊卡片狀態 ---
  const [isCardVisible, setIsCardVisible] = useState(true); // 控制卡片是否顯示
  
  // 當成功搜尋到店家後，自動收起篩選器並顯示卡片
  useEffect(() => {
    if (place) {
      setIsExpanded(false);
      setIsCardVisible(true); // 搜尋到新結果時重置為可見
    }
  }, [place]);

  const toggleExpanded = () => setIsExpanded(prev => !prev);
  // ------------------------------------

  // 計算地圖 Region
  const getMapRegion = (): Region => {
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
    // 預設位置 (台北 101)
    return {
      latitude: 25.033,
      longitude: 121.5654,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
  };

  // 底部控制面板的固定類名
  const controlClassesBase = "bg-white px-5 rounded-t-3xl z-20 w-full absolute transition-all duration-300";

  // 動態計算高度和位置樣式
  const controlStyle = {
    height: isExpanded ? height * EXPANDED_HEIGHT_PERCENT + insets.bottom : COLLAPSED_HEIGHT + insets.bottom,
    // 根據高度來計算 top 位置 (讓底部對齊螢幕底部)
    top: isExpanded ? height * (1 - EXPANDED_HEIGHT_PERCENT) - insets.bottom : height - (COLLAPSED_HEIGHT + insets.bottom),
    // 內容從 header 以下開始
  };

  // 動態計算 ShopInfoCard 的 bottom 位置 (關鍵：跟著底部面板的高度移動)
  // 使用控制面板的實際底部位置來計算卡片底部
  const bottomSheetHeight = isExpanded
    ? height * EXPANDED_HEIGHT_PERCENT + insets.bottom
    : COLLAPSED_HEIGHT + insets.bottom;

  const cardBottom = bottomSheetHeight + 16; // 底部面板高度 + 16px (Margin)

  // 地圖內容的條件渲染
  const MapViewContent = (
    // 使用 absolute inset-0 讓地圖佈滿整個螢幕
    <View className="absolute inset-0">
      <MapSection
            location={location}
            place={place}
            getMapRegion={getMapRegion}
      />
    </View>
  );


  return (
    <SafeAreaProvider>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
        <View className="flex-1 bg-neutral-50">
          <StatusBar style="auto" /> 
          
          {/* 1. 地圖背景 */}
          {MapViewContent}
          
          {/* 3. 店家資訊區塊 (絕對定位，只有在 place 存在、isCardVisible 為 true 且篩選器收起時才顯示) */}
          {/* 這裡將 Animated.View 替換為標準 View，並補齊定位樣式 */}
          {place && isCardVisible && !isExpanded && (
              <View // 使用標準 View
                // 定位設置 
                className="left-5 right-0 z-30 absolute items-left" 
                style={{ bottom: cardBottom }}
              >
                  {/* 卡片容器 */}
                  <View className="bg-white rounded-xl w-[80%] overflow-hidden relative">
                      <ShopSection
                          place={place}
                          location={location}
                          isLoading={isSearching}
                          onNavigate={actions.navigateToStore}
                      />
                  </View>
              </View>
          )}

          {/* 2. 底部控制區 (篩選器 + 按鈕 + 狀態/把手) - 絕對定位在最下層 */}
          {/* controlStyle 現在使用 top 屬性來定位 */}
          <View className={controlClassesBase} style={controlStyle}>
            
            {/* 2.1 狀態/把手區域 (始終顯示，位於底部控制區的*頂部*) */}
            <View 
                // 這是一個靜態的 Header，用於顯示狀態和關閉按鈕
                className="flex-row justify-between items-center py-1 bg-white/0 h-10 border-b border-gray-100" 
            >
                {/* 展開時顯示標題，收起時顯示簡潔狀態 */}
                {isExpanded ? (
                    <Text className="text-lg font-bold text-gray-800 ml-2">
                        🤔 要吃什麼？
                    </Text>
                ) : (
                    <View className="flex-1 flex-row items-center justify-start ml-2">
                        {place ? (
                            <Text className="text-sm font-semibold text-green-600">
                                ✨ 已選：{place.name}
                            </Text>
                        ) : (
                            <Text className="text-sm font-semibold text-gray-500">
                                🔍 篩選器已收起
                            </Text>
                        )}
                    </View>
                )}

                {/* 錯誤/定位狀態提示 (在展開時才顯示) */}
                {isExpanded && locationError && (
                    <Text className="text-red-500 text-xs text-center mr-2">
                        <Ionicons name="warning" size={12} /> {locationError}
                    </Text>
                )}

                {/* 關閉按鈕 (只在展開時顯示) */}
                {isExpanded && (
                    <Pressable 
                        onPress={toggleExpanded}
                        className="p-1.5 mr-2 rounded-full bg-gray-100"
                    >
                        <Ionicons 
                            name={"chevron-down"} 
                            size={20} 
                            color="#A0A0A0" 
                        />
                    </Pressable>
                )}
            </View>

            {/* 2.2 篩選器內容 ScrollView (只在展開時顯示內容) */}
            {isExpanded && (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    className="flex-1 pt-2" 
                    contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
                >
                    <FilterSection
                      radius={filters.radius}
                      setRadius={filters.setRadius}
                      selectedType={filters.selectedType}
                      setSelectedType={filters.setSelectedType} 
                      priceLevel={filters.priceLevel}
                      setPriceLevel={filters.setPriceLevel}
                      openNow={filters.openNow}
                      setOpenNow={filters.setOpenNow}
                      minRating={filters.minRating}
                      setMinRating={filters.setMinRating}
                    />

                    <View className="mt-2 mb-2">
                        <Button
                            title={isSearching ? '搜尋中...' : '🎲 隨機抽一間'}
                            onPress={actions.findStore}
                            disabled={isSearching || isLoadingLocation || !location}
                            color="#FF6347"
                        />
                    </View>
                </ScrollView>
            )}

          </View>

          {/* 4. 浮動篩選器按鈕 (只在收起時顯示，位於右下角) */}
          {!isExpanded && (
              <Pressable
                  onPress={toggleExpanded}
                  disabled={isLoadingLocation}
                  className="absolute right-5 z-40 bg-orange-500 p-4 rounded-full"
                  // 確保它不會被底部面板遮擋，並有足夠的 margin
                  style={{ bottom: COLLAPSED_HEIGHT + insets.bottom + 20 }}
              >
                  {/* 使用 funnels 圖示代表篩選器 */}
                  <Ionicons name="funnel" size={24} color="white" />
              </Pressable>
          )}

          {/* 5. 定位載入覆蓋層 (只有在 isLoadingLocation 時顯示) */}
          {isLoadingLocation && (
              <View className="absolute inset-0 bg-black/50 z-50 justify-center items-center">
                  <View className="bg-white p-6 rounded-xl items-center">
                      <ActivityIndicator size="large" color="#FF6347" />
                      <Text className="mt-4 text-lg font-bold text-gray-800">
                          定位中，請稍後...
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                          請確認已開啟定位服務
                      </Text>
                  </View>
              </View>
          )}
        </View>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
}