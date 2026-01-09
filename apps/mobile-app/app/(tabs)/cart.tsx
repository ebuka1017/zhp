import { View, Text } from 'react-native';

export default function CartScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Shopping Cart</Text>
      <Text className="text-gray-600 mt-2">Your cart is empty</Text>
    </View>
  );
}
