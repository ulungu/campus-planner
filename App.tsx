import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import TaskCard from './src/components/TaskCard';
import TaskForm from './src/components/TaskForm';
import { Task, TaskPriority } from './src/types/task';

type FilterType = 'all' | 'active' | 'completed';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Решить задачи по матанализу №3',
    subject: 'Математический анализ',
    priority: 'high',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Прочитать главу 4 учебника по истории',
    subject: 'История',
    priority: 'low',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Подготовить доклад по физике',
    subject: 'Физика',
    priority: 'medium',
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Сделать лабораторную по программированию',
    subject: 'Программирование',
    priority: 'high',
    isCompleted: false,
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.isCompleted).length;

  const handleAddTask = (data: {
    title: string;
    subject: string;
    priority: TaskPriority;
  }) => {
    const newTask: Task = {
      id: String(Date.now()),
      title: data.title,
      subject: data.subject,
      priority: data.priority,
      isCompleted: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setIsFormVisible(false);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'active', label: 'Активные' },
    { key: 'completed', label: 'Выполненные' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Planner</Text>
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

      {!isFormVisible && (
        <Pressable
          style={styles.addButton}
          onPress={() => setIsFormVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Добавить задачу</Text>
        </Pressable>
      )}

      {isFormVisible && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  headerStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#444',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
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
    color: '#999',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});