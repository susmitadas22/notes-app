import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CATEGORY_COLORS: Record<string, string> = {
  Work: '#E3F2FD', // Light Blue
  Personal: '#F3E5F5', // Light Purple
  Ideas: '#FFF3E0', // Light Orange
  Todo: '#E8F5E9', // Light Green
};

export const CATEGORY_TEXT_COLORS: Record<string, string> = {
  Work: '#1565C0',
  Personal: '#7B1FA2',
  Ideas: '#EF6C00',
  Todo: '#2E7D32',
};

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const backgroundColor = CATEGORY_COLORS[category] || '#F5F5F5';
  const color = CATEGORY_TEXT_COLORS[category] || '#616161';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
