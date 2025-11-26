import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const msg = '定位權限被拒絕，請在設定中開啟';
        setErrorMsg(msg);
        Alert.alert('權限錯誤', msg);
        setIsLoadingLocation(false);
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc.coords);
      } catch (e) {
        const msg = '無法取得您的位置';
        setErrorMsg(msg);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  return { location, errorMsg, isLoadingLocation };
};