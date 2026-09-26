import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import TaskForm from '../../src/components/TaskForm';
import { useTasks } from '../../src/context/TasksContext';
import { useTheme } from '../../src/context/ThemeContext';
import { TaskFormValues } from '../../src/types/task';
import { clearDraft, loadDraft, saveDraft } from '../../src/storage/draftStorage';

export default function NewTaskScreen() {
  const { addTask } = useTasks();
  const { colors } = useTheme();

  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [pendingDraft, setPendingDraft] = useState<TaskFormValues | null>(null);
  const [initialValues, setInitialValues] = useState<TaskFormValues | undefined>();
  // Смена key пересоздаёт форму с новыми начальными значениями
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    loadDraft().then((draft) => {
      if (!isMounted) return;
      setPendingDraft(draft);
      setIsDraftLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    setInitialValues(pendingDraft);
    setFormKey((key) => key + 1);
    setPendingDraft(null);
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  const handleChange = (values: TaskFormValues) => {
    // Пользователь начал вводить новые данные — старый черновик больше не предлагаем
    setPendingDraft(null);
    saveDraft(values);
  };

  const handleSubmit = async (values: TaskFormValues) => {
    addTask(values);
    await clearDraft();
    router.back();
  };

  if (isDraftLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {pendingDraft && (
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            Найден несохранённый черновик
          </Text>
          <Text style={[styles.bannerText, { color: colors.textSecondary }]} numberOfLines={2}>
            {pendingDraft.title || 'Без названия'}
            {pendingDraft.subject ? ` · ${pendingDraft.subject}` : ''}
          </Text>
          <View style={styles.bannerButtons}>
            <Pressable style={styles.bannerSecondary} onPress={discardDraft}>
              <Text style={{ color: colors.textSecondary }}>Начать заново</Text>
            </Pressable>
            <Pressable
              style={[styles.bannerPrimary, { backgroundColor: colors.primary }]}
              onPress={restoreDraft}
            >
              <Text style={[styles.bannerPrimaryText, { color: colors.onPrimary }]}>
                Восстановить
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <TaskForm
        key={formKey}
        initialValues={initialValues}
        submitLabel="Добавить"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        onChange={handleChange}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  bannerText: {
    fontSize: 13,
    marginTop: 4,
  },
  bannerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  bannerSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  bannerPrimary: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerPrimaryText: {
    fontWeight: '600',
  },
});
