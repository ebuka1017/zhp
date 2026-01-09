import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mt-12 mb-8">
        <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl font-bold text-primary-600">
            {user?.firstName?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-gray-600 mt-1">{user?.email}</Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-lg font-semibold text-gray-900">My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-lg font-semibold text-gray-900">Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-lg font-semibold text-gray-900">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 p-4 rounded-xl flex-row items-center justify-between"
        >
          <Text className="text-lg font-semibold text-red-600">Logout</Text>
          <LogOut color="#dc2626" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
