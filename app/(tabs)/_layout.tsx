import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerShadowVisible: false,
        tabBarStyle: {
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
          title: 'Index',
          tabBarStyle: { display: 'none' }, // 隱藏 Tab 欄
        }}
      />
    </Tabs>
  );
}
