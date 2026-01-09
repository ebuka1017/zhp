import { View, Text } from 'react-native';

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Search</Text>
      <Text className="text-gray-600 mt-2">Search for products</Text>
    </View>
  );
}
