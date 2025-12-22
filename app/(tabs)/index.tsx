import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Button, Dimensions, ScrollView, Text, View, Pressable } from 'react-native';
import { Region } from 'react-native-maps'; // 只需要 Region 類型
import { FilterSection } from '../components/filterSection';
import { ShopSection } from '../components/shopSection';
import MapSection from '../components/mapSection';
import { useShopFinder } from '../hooks/useShopFinder';
import { useUserLocation } from '../hooks/useUserLocation';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


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

    const [modalVisible, setModalVisible] = useState(false);

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

    const filterCardExpandedHeight = height * 0.70;
    const verticalCenterOffset = (height - filterCardExpandedHeight) / 2;
    const horizontalCenterOffset = width * 0.05; // 5%

    return (
        <View className="flex-1">
            <StatusBar style="dark" />
            {/* 1. 地圖背景 (絕對定位填滿整個螢幕，z-index 位於最下層) */}
            <View className="absolute inset-0">
                <MapSection
                    location={location}
                    place={place}
                    getMapRegion={getMapRegion}
                />
            </View>

            {/* 1.5. 背景點擊收起層 (只有在篩選器展開時顯示) */}
            {isExpanded && (
                <Pressable
                    onPress={toggleExpanded} // 點擊背景收起篩選器
                    className="absolute inset-0 z-20"
                >
                    {/* 輕微的半透明背景，給予視覺提示 */}
                    <View className="flex-1 bg-black/10" />
                </Pressable>
            )}

            {/* 3. 店家資訊區塊 (絕對定位，浮動在收起面板上方) */}
            {place && isCardVisible && !isExpanded && (
                <View
                    className="left-5 right-0 z-30 absolute items-left"
                    style={{ bottom: 8 }}
                >
                    {/* 卡片容器 */}
                    <View className="bg-white rounded-xl w-[70%] overflow-hidden relative">
                        <ShopSection
                            place={place}
                            location={location}
                            isLoading={isSearching}
                            onNavigate={actions.navigateToStore}
                        />
                    </View>
                </View>
            )}

            {/* 2. 篩選器浮動卡片 (取代舊的底部控制區) */}
            {isExpanded && ( // 只在篩選器展開時才渲染整個卡片 (完全隱藏收起狀態)
                <View
                    className={`absolute w-[90%] left-0 right-0 mx-auto rounded-3xl overflow-hidden transition-all duration-300 z-30`}
                    style={{
                        top: verticalCenterOffset,
                        left: horizontalCenterOffset,
                        height: filterCardExpandedHeight, // 使用調整後的 70% 高度
                    }}
                >
                    <View
                        // 內層容器：處理背景、圓角和陰影
                        className="flex-1 bg-white shadow-2xl rounded-3xl"
                    >

                        {/* 2.1 狀態/把手區域 (現在是卡片的 header) */}
                        <Pressable
                            // 現在點擊 Pressable 只執行收起 (toggleExpanded)
                            onPress={toggleExpanded}
                            className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100"
                        >
                            {/* 標題與簡潔狀態 */}
                            <Text className="text-xl font-bold text-gray-800 tracking-tight">
                                🤔 要吃什麼？
                            </Text>

                            {/* 錯誤/定位狀態提示 */}
                            {locationError && (
                                <Text className="text-red-500 text-xs text-center mr-2">
                                    <Ionicons name="warning" size={12} /> {locationError}
                                </Text>
                            )}

                            {/* 關閉按鈕 */}
                            <View className="p-1.5 rounded-full bg-gray-100 ml-2">
                                <Ionicons
                                    name={"close"} // 展開時只提供收起功能
                                    size={20}
                                    color="#A0A0A0"
                                />
                            </View>
                        </Pressable>

                        {/* 2.2 篩選器內容 ScrollView (始終顯示內容，因為只在 isExpanded 時渲染父級) */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="flex-1 px-4 pt-4"
                            // 確保內容底部有足夠空間
                            contentContainerStyle={{ paddingBottom: 20 }}
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
                            <View className="mt-2 mb-4">
                                <Button
                                    title={isSearching ? '搜尋中...' : '🎲 隨機抽一間'}
                                    onPress={actions.findStore}
                                    disabled={isSearching || isLoadingLocation || !location}
                                    color="#FF6347"
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}
            {/* 4. 浮動篩選器按鈕 (只在收起時顯示，位於右下角) */}
            {!isExpanded && (
                <Pressable
                    onPress={toggleExpanded}
                    disabled={isLoadingLocation}
                    className="absolute right-5 z-40 bg-orange-500 p-4 rounded-full shadow-2xl"
                    // 確保它不會被底部面板遮擋，並有足夠的 margin
                    style={{ bottom: insets.bottom }}
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
    );
}