import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, SpacingToken } from '../../theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  // Прокручиваемый экран (формы, карточка задачи)
  scroll?: boolean;
  // Внутренний отступ из токенов; false — без отступа
  padding?: SpacingToken | false;
  // Центрировать содержимое (экраны-заглушки)
  centered?: boolean;
  // Верхний край по умолчанию закрывает заголовок Stack
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export default function Screen({
  children,
  scroll = false,
  padding = false,
  centered = false,
  edges = ['bottom', 'left', 'right'],
  style,
}: ScreenProps) {
  const { colors } = useTheme();
  const contentStyle: StyleProp<ViewStyle> = [
    padding !== false && { padding: spacing[padding] },
    centered && styles.centered,
    style,
  ];

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={contentStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
