import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { THEME_LABELS, ThemeName } from '../src/theme/colors';

const THEME_OPTIONS: ThemeName[] = ['light', 'dark'];

export default function SettingsScreen() {
  const { theme, colors, setTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Тема оформления
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {THEME_OPTIONS.map((option, index) => {
          const isSelected = theme === option;
          return (
            <Pressable
              key={option}
              style={[
                styles.row,
                index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              ]}
              onPress={() => setTheme(option)}
            >
              <Text style={[styles.rowText, { color: colors.text }]}>
                {THEME_LABELS[option]}
              </Text>
              <View
                style={[
                  styles.radio,
                  { borderColor: isSelected ? colors.primary : colors.border },
                ]}
              >
                {isSelected && (
                  <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hint: {
    fontSize: 13,
    marginTop: 12,
    marginLeft: 4,
  },
});
