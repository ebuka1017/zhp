import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/authStore';

const featuredProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999.99,
    image: 'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=iPhone',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 899.99,
    image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Galaxy',
  },
  {
    id: '3',
    name: 'AirPods Pro',
    price: 249.99,
    image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=AirPods',
  },
];

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <LinearGradient
      colors={['#eff6ff', '#dbeafe', '#f3e8ff']}
      className="flex-1"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Text className="text-3xl font-bold text-gray-900">
            Welcome back,
          </Text>
          <Text className="text-xl text-gray-600">
            {user?.firstName || 'Guest'}!
          </Text>
        </View>

        {/* Banner */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          className="mx-6 mb-6"
        >
          <BlurView intensity={80} tint="light" className="rounded-3xl overflow-hidden">
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6"
            >
              <Text className="text-2xl font-bold text-white mb-2">
                Special Offer
              </Text>
              <Text className="text-white/90 mb-4">
                Get 20% off on all products this week!
              </Text>
              <TouchableOpacity className="bg-white rounded-xl py-3 px-6 self-start">
                <Text className="text-primary-600 font-bold">Shop Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Categories */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Electronics', 'Fashion', 'Home', 'Sports'].map((category, index) => (
              <Animated.View
                key={category}
                entering={FadeInDown.delay(200 + index * 100).duration(600)}
              >
                <TouchableOpacity className="mr-4">
                  <BlurView
                    intensity={80}
                    tint="light"
                    className="px-6 py-3 rounded-2xl overflow-hidden"
                  >
                    <Text className="text-gray-900 font-semibold">{category}</Text>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Featured Products
          </Text>
          <View className="space-y-4">
            {featuredProducts.map((product, index) => (
              <Animated.View
                key={product.id}
                entering={FadeInDown.delay(400 + index * 100).duration(600)}
              >
                <TouchableOpacity>
                  <BlurView
                    intensity={80}
                    tint="light"
                    className="rounded-3xl overflow-hidden"
                  >
                    <View className="flex-row items-center p-4">
                      <Image
                        source={{ uri: product.image }}
                        className="w-24 h-24 rounded-2xl"
                      />
                      <View className="flex-1 ml-4">
                        <Text className="text-lg font-bold text-gray-900">
                          {product.name}
                        </Text>
                        <Text className="text-2xl font-bold text-primary-600 mt-2">
                          ${product.price}
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
