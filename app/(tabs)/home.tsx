import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Button, Dimensions, ScrollView, StyleSheet, Text, View, Pressable, Platform, Animated, PanResponder } from 'react-native';
import { Region } from 'react-native-maps'; // 只需要 Region 類型
import { FilterSection } from '../components/filterSection';
import { ShopInfoCard } from '../components/shopInfoCard';
import MapSection from '../components/mapSection'; // 導入地圖組件
import { useShopFinder } from '../hooks/useShopFinder';
import { useUserLocation } from '../hooks/useUserLocation';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// 底部控制面板的高度定義
const COLLAPSED_HEIGHT = 60; // 收起狀態的固定高度
const EXPANDED_HEIGHT_PERCENT = 0.45; // 展開狀態的最大高度百分比

export default function HomeScreen() {
  // 獲取安全區域內邊距
  const insets = useSafeAreaInsets();
  const { location, errorMsg: locationError, isLoadingLocation } = useUserLocation();
  const { place, isSearching, filters, actions } = useShopFinder(location);

  // --- 狀態管理篩選器展開/收起 ---
  const [isExpanded, setIsExpanded] = useState(true);

  // --- 店家資訊卡片狀態 ---
  const [isCardVisible, setIsCardVisible] = useState(true); // 控制卡片是否顯示

  // 拖曳相關狀態 (使用 Animated.Value 和 PanResponder 實現拖曳)
  const pan = useRef(new Animated.Value(0)).current; // 垂直偏移量
  
  // 設置 PanResponder 來處理拖曳手勢
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // 允許開始拖曳
      onMoveShouldSetPanResponder: () => true, // 允許移動時拖曳
      onPanResponderMove: Animated.event(
        [
          null,
          { dy: pan }, // 將垂直移動量映射到 pan
        ],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (e, gestureState) => {
        // 釋放時，如果向下拖曳超過 50 像素，則關閉卡片
        if (gestureState.dy > 50) {
            setIsCardVisible(false);
        }
        // 否則，將卡片吸附回原位
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
          bounciness: 0, // 移除彈性效果
        }).start();
      },
    }),
  ).current;


  // 當成功搜尋到店家後，自動收起篩選器並顯示卡片
  useEffect(() => {
    if (place) {
      setIsExpanded(false);
      setIsCardVisible(true); // 搜尋到新結果時重置為可見
      pan.setValue(0); // 重置拖曳位置
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
  const controlClassesBase = "bg-white px-5 rounded-t-3xl shadow-lg z-20 w-full absolute bottom-0 transition-all duration-300";

  // 動態計算高度樣式
  const controlStyle = isExpanded
    ? { height: height * EXPANDED_HEIGHT_PERCENT + insets.bottom }
    : { height: COLLAPSED_HEIGHT + insets.bottom };

  // 動態計算 ShopInfoCard 的 bottom 位置 (關鍵：跟著底部面板的高度移動)
  const bottomSheetHeight = isExpanded
    ? height * EXPANDED_HEIGHT_PERCENT + insets.bottom
    : COLLAPSED_HEIGHT + insets.bottom;

  const cardBottom = bottomSheetHeight + 16; // 底部面板高度 + 16px (Margin)

  // 地圖內容的條件渲染 (已移入 MapSection 組件)
  const MapViewContent = (
    // 使用 absolute inset-0 讓地圖佈滿整個螢幕
    <View className="absolute inset-0">
      <MapSection
            location={location}
            place={place}
            getMapRegion={getMapRegion}
      />
      
      {/* 地圖標籤 (放在 MapView 內部，使用絕對定位) */}
      <View className="absolute top-5 left-4 bg-white/90 px-3 py-1 rounded-lg z-10">
        <Text className="text-xs font-bold text-gray-700">
          {place ? '📍 餐廳位置' : '🗺️ 您的位置'}
        </Text>
      </View>
    </View>
  );


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 bg-neutral-50">
          <StatusBar style={isLoadingLocation ? "light" : "dark"} /> 
          
          {/* 1. 地圖背景 */}
          {MapViewContent}
          
          {/* 3. 店家資訊區塊 (絕對定位，只有在 place 存在且 isCardVisible 為 true 時才顯示) */}
          {place && isCardVisible && (
              <Animated.View 
                // 定位和拖曳設置
                className="left-0 right-0 z-30 absolute items-center" 
                style={{ bottom: cardBottom, transform: [{ translateY: pan }] }} 
                {...panResponder.panHandlers} // 啟用拖曳
              >
                  {/* 卡片容器 (增加背景和陰影) */}
                  <View className="bg-white rounded-xl shadow-xl w-[90%] overflow-hidden relative">
                      
                      {/* 拖曳把手 (視覺指示) */}
                      <View className="w-full items-center py-1">
                          <View className="w-10 h-1 bg-gray-300 rounded-full" />
                      </View>
                      
                      {/* 關閉按鈕 (右上角) */}
                      <Pressable 
                          onPress={() => setIsCardVisible(false)} 
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/5 z-40"
                      >
                          <Ionicons name="close" size={18} color="#333" />
                      </Pressable>

                      <ShopInfoCard
                          place={place}
                          location={location}
                          isLoading={isSearching}
                          onNavigate={actions.navigateToStore}
                      />
                  </View>
              </Animated.View>
          )}

          {/* 2. 底部控制區 (篩選器 + 按鈕 + 狀態/把手) - 絕對定位在最下層 */}
          <View className={controlClassesBase} style={controlStyle}>
            
            {/* 2.1 狀態/把手區域 (始終顯示，位於底部控制區的*頂部*) */}
            <Pressable 
                onPress={toggleExpanded} 
                // 確保 Pressable 在頂部佔據空間
                className="flex-row justify-center items-center py-1 bg-white/0 h-10 border-b border-gray-100" 
                disabled={isLoadingLocation} // 定位中禁止展開/收起
            >
                {/* 展開/收起狀態提示 (收起時顯示) */}
                {!isExpanded && (
                    <View className="flex-1 flex-row items-center justify-start ml-2">
                        {place ? (
                            <Text className="text-sm font-semibold text-green-600">
                                ✨ 已選：{place.name}
                            </Text>
                        ) : (
                            <Text className="text-sm font-semibold text-gray-500">
                                🔍 點擊展開篩選器
                            </Text>
                        )}
                    </View>
                )}
                
                {/* 錯誤/定位狀態提示 (在展開/收起時都顯示) */}
                {locationError && (
                    <Text className="text-red-500 text-xs text-center mr-2">
                        <Ionicons name="warning" size={12} /> {locationError}
                    </Text>
                )}

                {/* 把手圖示 (展開時顯示向下箭頭，收起時顯示向上箭頭) */}
                <Ionicons 
                    name={isExpanded ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color="#A0A0A0" 
                    className="mx-4"
                />
                
            </Pressable>

            {/* 2.2 篩選器內容 ScrollView (只在展開時顯示內容) */}
            {isExpanded && (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    // flex-1 確保佔滿剩餘空間。pt-2 為把手留出空間
                    className="flex-1 pt-2" 
                    contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
                >
                    <FilterSection
                        radius={filters.radius}
                        setRadius={filters.setRadius}
                        priceLevel={filters.priceLevel}
                        setPriceLevel={filters.setPriceLevel}
                        openNow={filters.openNow}
                        setOpenNow={filters.setOpenNow}
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

          {/* 4. 定位載入覆蓋層 (只有在 isLoadingLocation 時顯示) */}
          {isLoadingLocation && (
              <View className="absolute inset-0 bg-black/50 z-50 justify-center items-center">
                  <View className="bg-white p-6 rounded-xl shadow-2xl items-center">
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

