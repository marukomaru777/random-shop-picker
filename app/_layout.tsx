import { Stack } from 'expo-router';
import './globals.css';

export default function RootLayout() {
  return (
    <Stack>
      {/* (tabs) -> folder name */}
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  );
}
