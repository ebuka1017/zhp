import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for the store to hydrate
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (isAuthenticated) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-600">Loading...</Text>
    </View>
  );
}
