import { Chip } from 'heroui-native';
import { View } from 'react-native';

const filters = ['B1-B2', '美式表达', '实时纠音'];

export function DifficultySelector() {
  return (
    <View className="mb-5 flex-row gap-2">
      {filters.map((item, index) => (
        <Chip key={item} color={index === 0 ? 'accent' : 'default'} size="md" variant={index === 0 ? 'primary' : 'secondary'}>
          {item}
        </Chip>
      ))}
    </View>
  );
}
