import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task, PRIORITY_LABELS, PRIORITY_COLORS } from '../types/task';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../theme/colors';

interface TaskCardProps {
  task: Task;
  onPress: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}: TaskCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, task.isCompleted && styles.cardCompleted]}>
      <Pressable
        style={styles.checkbox}
        onPress={() => onToggleComplete(task.id)}
      >
        {task.isCompleted && <Text style={styles.checkboxMark}>✓</Text>}
      </Pressable>

      <Pressable style={styles.info} onPress={() => onPress(task.id)}>
        <Text
          style={[styles.title, task.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <Text style={styles.subject}>{task.subject}</Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: PRIORITY_COLORS[task.priority] },
            ]}
          >
            <Text style={styles.priorityText}>
              {PRIORITY_LABELS[task.priority]}
            </Text>
          </View>
          <Text style={styles.status}>
            {task.isCompleted ? 'Выполнено' : 'В процессе'}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
        hitSlop={8}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 6,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardCompleted: {
      opacity: 0.55,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxMark: {
      fontSize: 14,
      color: colors.success,
      fontWeight: 'bold',
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    subject: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 8,
    },
    priorityText: {
      fontSize: 11,
      color: '#fff',
      fontWeight: '600',
    },
    status: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    deleteButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    deleteButtonText: {
      fontSize: 16,
      color: colors.danger,
      fontWeight: 'bold',
    },
  });
