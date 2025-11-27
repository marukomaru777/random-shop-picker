import { Tabs } from 'expo-router';import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#f5f5f590',
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
          title: '',
          tabBarIcon: ({ color }) => <FontAwesome5 name="dice" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{ title: '',
          tabBarIcon: ({color}) => (
            <Ionicons name="settings-sharp" size={24} color={color}/>
          ),
         }}
      />
    </Tabs>
  );
}
