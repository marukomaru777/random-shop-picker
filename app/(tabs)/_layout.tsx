import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerShadowVisible: false,
        tabBarStyle: {
          // display: 'none', // 整個 Tab 欄將會被隱藏
          backgroundColor: '#f5f5f5',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: 'coral',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Index'
        }}
      />
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name='home' size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
