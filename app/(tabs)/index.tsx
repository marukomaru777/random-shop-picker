import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'gray' }}>
        <StatusBar style="auto" />
            <View className='flex-1 justify-center items-center'>
              <Text className='text-5xl text-blue-500 font-bold'>Welcome</Text>
            </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
