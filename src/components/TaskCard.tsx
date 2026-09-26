import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task, PRIORITY_LABELS, PRIORITY_COLORS } from '../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  return (
    <View style={[styles.card, task.isCompleted && styles.cardCompleted]}>
      <Pressable
        style={styles.mainArea}
        onPress={() => onToggleComplete(task.id)}
      >
        <View style={styles.checkbox}>
          {task.isCompleted && <Text style={styles.checkboxMark}>✓</Text>}
        </View>

        <View style={styles.info}>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  subject: {
    fontSize: 13,
    color: '#666',
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
    color: '#555',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
});