import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; 
import { saveApiKey, loadApiKey, deleteApiKey } from '../constants/apiKeyStore'; 
import { Ionicons } from '@expo/vector-icons';

// ===============================================
// Custom Button Component
// ===============================================
const CustomButton = ({ title, onPress, color = 'orange', disabled = false, variant = 'solid' }: 
  { title: string, onPress: () => void, color?: 'orange' | 'red' | 'gray', disabled?: boolean, variant?: 'solid' | 'outline' | 'ghost' }) => {

  const baseStyle = `py-4 rounded-2xl transition-transform active:scale-95 shadow-md`;
  let bgColor = '';
  let textColor = '';
  let border = '';

  if (variant === 'solid') {
    switch(color) {
      case 'red':
        bgColor = disabled ? 'bg-red-300' : 'bg-red-600';
        textColor = 'text-white';
        break;
      case 'gray':
        bgColor = disabled ? 'bg-gray-300' : 'bg-gray-600';
        textColor = 'text-white';
        break;
      default:
        bgColor = disabled ? 'bg-orange-300' : 'bg-orange-500';
        textColor = 'text-white';
    }
  } else if (variant === 'outline') {
    bgColor = 'bg-transparent';
    border = `border ${color === 'red' ? 'border-red-500' : 'border-gray-400'}`;
    textColor = color === 'red' ? 'text-red-600' : 'text-gray-700';
  } else if (variant === 'ghost') {
    bgColor = 'bg-transparent';
    textColor = color === 'red' ? 'text-red-600' : 'text-gray-600';
  }

  const opacity = disabled ? 'opacity-50' : 'opacity-100';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${bgColor} ${textColor} ${border} ${opacity}`}
    >
      <Text className="text-center font-semibold text-lg">{title}</Text>
    </Pressable>
  );
};

// ===============================================
// Setting Row Component (已移除 bg-white)
// ===============================================
const SettingRow = ({ label, children, isLast = false, icon }: { label: string, children: React.ReactNode, isLast?: boolean, icon?: keyof typeof Ionicons.glyphMap }) => (
  <View 
    // 移除 bg-white，讓它繼承父容器的背景 (現在是白色)
    className={`flex-row justify-between items-center py-5 px-5 ${isLast ? '' : 'border-b border-gray-200'}`}
  >
    <View className="flex-row items-center w-1/3">
      {icon && <Ionicons name={icon} size={22} color="#6B7280" className="mr-3" />}
      <Text className="text-gray-900 font-semibold text-base">{label}</Text> 
    </View>
    <View className="flex-1 ml-4 items-end justify-center">
      {children}
    </View>
  </View>
);

// ===============================================
// Page Component: SettingScreen
// ===============================================
export default function SettingScreen() {
  const [key, setKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      setSavedKey(await loadApiKey());
      setIsLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!key.trim()) {
      setStatusMessage({ type: 'error', text: '請輸入有效的 API Key' });
      setTimeout(() => setStatusMessage(null), 3000); 
      return;
    }
    setIsLoading(true);
    try {
      await saveApiKey(key.trim());
      setSavedKey(key.trim());
      setKey('');
      setStatusMessage({ type: 'success', text: '設定已更新' });
      setTimeout(() => setStatusMessage(null), 2000); 
    } catch {
      setStatusMessage({ type: 'error', text: '儲存失敗，請重試' });
      setTimeout(() => setStatusMessage(null), 3000); 
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    setIsConfirmingDelete(false); 
    setIsLoading(true);
    try {
      await deleteApiKey();
      setSavedKey(null);
      setStatusMessage({ type: 'success', text: '金鑰已移除' });
      setTimeout(() => setStatusMessage(null), 3000); 
    } catch {
      setStatusMessage({ type: 'error', text: '刪除失敗' });
      setTimeout(() => setStatusMessage(null), 3000); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 改變主背景色為白色 (bg-white)，與內容融合
    <View className="flex-1 bg-white"> 
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {/* 頂部標題 - 移除 bg-white (已由父 View 提供)，保留 border-b 分隔線 */}
          <View className="px-6 pt-3 pb-2 border-b border-gray-300 items-center"> 
            <Text className="text-xl font-extrabold text-gray-900 tracking-tight">設定</Text>
          </View>

          {/* 狀態訊息 Toast - 使用絕對定位使其浮動在內容上方，並居中顯示 */}
          {statusMessage && (
            // Outer container: full width (left-0 right-0), centers its content horizontally (items-center)
            <View className="absolute top-16 left-0 right-0 z-50 items-center">
              {/* Inner Toast: Content-width, uses p-2 and rounded-xl */}
              <View className={`p-2 rounded-xl flex-row items-center 
                ${statusMessage.type === 'success' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                <Ionicons 
                  name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                  size={20} 
                  color={statusMessage.type === 'success' ? '#047857' : '#B91C1C'} 
                  className="mr-3"
                />
                <Text className={`font-semibold text-base ${statusMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {statusMessage.text}
                </Text>
              </View>
            </View>
          )}

          {/* Google Maps 區塊 */}
          <View className="mb-8 px-6 mt-3"> 
            <Text className="uppercase font-semibold text-sm text-gray-500 tracking-wide">
              Google Cloud
            </Text>

            {/* 設置內容區塊 */}
            <View className="overflow-hidden ">
              {/* API Key 輸入 */}
              <SettingRow label="API 金鑰" icon="key-outline" isLast={!savedKey}>
                <TextInput
                  placeholder={savedKey ? "更新金鑰..." : "貼上您的金鑰"}
                  placeholderTextColor="#9CA3AF" 
                  value={key}
                  onChangeText={setKey}
                  className="text-base text-gray-900 text-right flex-1"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  secureTextEntry={true}
                />
              </SettingRow>

              {/* 目前狀態顯示 */}
              {savedKey && (
                <SettingRow label="目前狀態" icon="checkmark-done-circle-outline" isLast={true}>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <Text numberOfLines={1} className="text-gray-600 font-mono text-base">
                      {savedKey.substring(0, 4)}••••••••{savedKey.substring(savedKey.length - 4)}
                    </Text>
                  </View>
                </SettingRow>
              )}
            </View>

            <Text className="mt-3 text-sm text-gray-400 leading-relaxed">
              此金鑰用於啟用搜尋地點與地圖顯示功能。請確保您的金鑰已啟用 Places API 與 Maps SDK。
            </Text>
          </View>

          {/* 按鈕區 */}
          <View className="px-6">
            <CustomButton 
              title="儲存設定" 
              onPress={handleSave} 
              disabled={isLoading || !key.trim() || isConfirmingDelete}
              variant="solid"
              color="orange"
            />

            {savedKey && (
              <View className="mt-5">
                {isConfirmingDelete ? (
                  <View className="bg-white rounded-3xl border border-red-300 p-5 shadow-md">
                    <Text className="text-center text-lg font-semibold mb-5 text-gray-800">移除目前的 API 金鑰？</Text>
                    {/* 加大間距：space-x-6 改為 space-x-8 */}
                    <View className="flex-row justify-between">
                    <View className="flex-1 mr-4">
                        <CustomButton 
                        title="取消" 
                        color="gray" 
                        variant="outline"
                        onPress={() => setIsConfirmingDelete(false)} 
                        disabled={isLoading} 
                        />
                    </View>
                    <View className="flex-1 ml-4">
                        <CustomButton 
                        title="確認移除" 
                        color="red" 
                        variant="solid"
                        onPress={executeDelete} 
                        disabled={isLoading} 
                        />
                    </View>
                    </View>
                  </View>
                ) : (
                  <CustomButton 
                    title="移除金鑰" 
                    color="red"
                    variant="ghost"
                    onPress={() => setIsConfirmingDelete(true)} 
                    disabled={isLoading} 
                  />
                )}
              </View>
            )}
          </View>

          {/* 底部安全聲明 */}
          <View className="mt-14 px-10 py-6 items-center opacity-50">
            <Ionicons name="shield-checkmark" size={26} color="#9CA3AF" style={{ marginBottom: 6 }} />
            <Text className="text-center text-xs text-gray-400 leading-6 max-w-xs">
              您的隱私是安全的。API 金鑰僅儲存於本機加密儲存空間，應用程式不會將其發送至任何第三方伺服器。
            </Text>
          </View>

          {/* 載入指示器 */}
          {isLoading && (
            <View className="absolute inset-0 bg-white/70 justify-center items-center z-50 backdrop-blur-sm">
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}