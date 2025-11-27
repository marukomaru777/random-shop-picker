import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true; // 追蹤組件是否掛載

    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            const msg = '定位權限被拒絕，請在設定中開啟';
            if (isMounted) {
                setErrorMsg(msg);
                Alert.alert('權限錯誤', msg);
                setIsLoadingLocation(false);
            }
            return;
        }

        try {
            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            if (isMounted) {
                setLocation(loc.coords);
            }
        } catch (e) {
            const msg = '無法取得您的位置';
            if (isMounted) {
                setErrorMsg(msg);
            }
        } finally {
            if (isMounted) {
                setIsLoadingLocation(false);
            }
        }
    };
    
    // 開始執行定位
    getLocation();

    // 組件卸載時設置 isMounted 為 false，避免記憶洩漏
    return () => {
        isMounted = false;
    };
  }, []);

  return { location, errorMsg, isLoadingLocation };
};