import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Screen from '../../src/components/ui/Screen';
import AppInput from '../../src/components/ui/AppInput';
import AppButton from '../../src/components/ui/AppButton';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/context/ThemeContext';
import { getLoginErrorMessage } from '../../src/api/client';
import { ThemeColors } from '../../src/theme/colors';
import { fontSize, radius, spacing } from '../../src/theme/spacing';

interface LoginErrors {
  login?: string;
  password?: string;
}

function validate(login: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!login.trim()) errors.login = 'Введите логин';
  if (!password.trim()) errors.password = 'Введите пароль';
  return errors;
}

export default function LoginScreen() {
  const { signIn, restoreError, retryRestore } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref меняется синхронно: второе быстрое нажатие увидит true ещё до ре-рендера
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    const errors = validate(login, password);
    setFieldErrors(errors);
    setSubmitError(null);
    if (errors.login || errors.password) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await signIn({ login, password });
      // После успешного входа корневой layout сам откроет раздел (app)
    } catch (error) {
      // 401 → «Неверный логин или пароль.», нет сети → понятный текст без деталей сервера
      setSubmitError(getLoginErrorMessage(error));
      // Пароль после отправки не держим в состоянии экрана
      setPassword('');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scroll padding="lg" centered edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.form}>
        <Text style={styles.title}>Campus Planner</Text>
        <Text style={styles.subtitle}>Войдите учебной учётной записью</Text>

        {restoreError ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Не удалось проверить сохранённую сессию. {restoreError}
            </Text>
            <AppButton title="Повторить" variant="secondary" size="sm" onPress={retryRestore} />
          </View>
        ) : null}

        <AppInput
          label="Логин"
          value={login}
          onChangeText={(value) => {
            setLogin(value);
            if (fieldErrors.login) setFieldErrors((prev) => ({ ...prev, login: undefined }));
          }}
          error={fieldErrors.login}
          placeholder="student01"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          editable={!isSubmitting}
        />

        <AppInput
          label="Пароль"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={fieldErrors.password}
          placeholder="Пароль"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isSubmitting}
        />

        {submitError ? (
          <Text style={styles.submitError} accessibilityLiveRegion="polite">
            {submitError}
          </Text>
        ) : null}

        <AppButton
          title={isSubmitting ? 'Вход…' : 'Войти'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.button}
        />
        {isSubmitting ? (
          <ActivityIndicator style={styles.spinner} color={colors.primary} />
        ) : null}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    form: {
      width: '100%',
      maxWidth: 420,
    },
    title: {
      fontSize: fontSize.xl + 6,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    notice: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm + spacing.xs,
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    noticeText: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
    submitError: {
      fontSize: fontSize.sm + 1,
      color: colors.danger,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    button: {
      marginTop: spacing.md,
    },
    spinner: {
      marginTop: spacing.sm,
    },
  });
