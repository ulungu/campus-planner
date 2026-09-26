import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTasks } from '../../src/context/TasksContext';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../src/types/task';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, toggleTask } = useTasks();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const task = id ? getTaskById(id) : undefined;

  if (!task) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.value}>Задача не найдена</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Text style={styles.primaryButtonText}>К списку задач</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Название</Text>
        <Text style={styles.title}>{task.title}</Text>

        <Text style={styles.label}>Предмет</Text>
        <Text style={styles.value}>{task.subject}</Text>

        <Text style={styles.label}>Приоритет</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: PRIORITY_COLORS[task.priority] },
          ]}
        >
          <Text style={styles.priorityText}>{PRIORITY_LABELS[task.priority]}</Text>
        </View>

        <Text style={styles.label}>Статус</Text>
        <Text style={styles.value}>
          {task.isCompleted ? 'Выполнено' : 'В процессе'}
        </Text>
      </View>

      <Pressable style={styles.secondaryButton} onPress={() => toggleTask(task.id)}>
        <Text style={styles.secondaryButtonText}>
          {task.isCompleted ? 'Вернуть в работу' : 'Отметить выполненной'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.push({ pathname: '/task/edit/[id]', params: { id: task.id } })
        }
      >
        <Text style={styles.primaryButtonText}>Редактировать</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      padding: 16,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    label: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    value: {
      fontSize: 16,
      color: colors.text,
    },
    priorityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    priorityText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
