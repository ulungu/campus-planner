import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function TaskNotFound() {
  const { colors } = useTheme();

  const goToList = () => {
    // Если экран открыт по прямой ссылке, истории может не быть
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Задача не найдена</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Возможно, она была удалена или ссылка неверна.
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={goToList}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
          К списку задач
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
