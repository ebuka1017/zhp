import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import api from '../src/lib/api';
import { useAuthStore } from '../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;

      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#3b82f6', '#8b5cf6', '#ec4899']}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6">
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="mb-8"
        >
          <Text className="text-4xl font-bold text-white text-center mb-2">
            Welcome Back
          </Text>
          <Text className="text-lg text-white/80 text-center">
            Sign in to continue shopping
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(600).springify()}
        >
          <BlurView intensity={40} tint="light" className="rounded-3xl overflow-hidden p-6">
            <View className="space-y-4">
              <View>
                <Text className="text-white font-semibold mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="customer@test.com"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="bg-white/20 text-white px-4 py-3 rounded-xl"
                />
              </View>

              <View>
                <Text className="text-white font-semibold mb-2">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry
                  className="bg-white/20 text-white px-4 py-3 rounded-xl"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-white rounded-xl py-4 mt-4"
                activeOpacity={0.8}
              >
                <Text className="text-primary-600 font-bold text-center text-lg">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <Text className="text-white/70 text-center text-sm mt-4">
                Demo: customer@test.com / Customer@123
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
