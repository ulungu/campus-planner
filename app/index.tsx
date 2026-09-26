import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import TaskCard from '../src/components/TaskCard';
import { useTasks } from '../src/context/TasksContext';
import { useTheme } from '../src/context/ThemeContext';
import { ThemeColors } from '../src/theme/colors';

type FilterType = 'all' | 'active' | 'completed';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Выполненные' },
];

export default function TaskListScreen() {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<FilterType>('all');

  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.isCompleted).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const openTask = (id: string) => {
    router.push({
      pathname: '/task/[id]',
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
              <Text style={styles.headerLink}>Настройки</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerStats}>
          Всего: {totalCount} · Выполнено: {completedCount}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f.key && styles.filterButtonTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/task/new')}
      >
        <Text style={styles.addButtonText}>+ Добавить задачу</Text>
      </Pressable>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={openTask}
            onToggleComplete={toggleTask}
            onDelete={deleteTask}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Список пока пуст</Text>
          </View>
        }
        contentContainerStyle={
          filteredTasks.length === 0 ? styles.emptyListContent : undefined
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerLink: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerStats: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    filterButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.chip,
      marginRight: 8,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 13,
      color: colors.chipText,
    },
    filterButtonTextActive: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    emptyStateText: {
      fontSize: 15,
      color: colors.placeholder,
    },
    emptyListContent: {
      flexGrow: 1,
    },
  });
