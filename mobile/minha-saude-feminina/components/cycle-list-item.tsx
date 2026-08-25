import { Pressable, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { diffInDays, parseDateOnly } from '@/lib/cycle-calculations';
import type { CycleRecord } from '@/types/cycle';

function formatDisplayDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function CycleListItem({
  cycle,
  onEdit,
  onDelete,
}: {
  cycle: CycleRecord;
  onEdit(): void;
  onDelete(): void;
}) {
  const durationDays = diffInDays(cycle.startDate, cycle.endDate) + 1;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: AppColors.border,
        borderRadius: 16,
        backgroundColor: AppColors.surface,
      }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.coral }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: AppColors.text, fontSize: 15, fontWeight: '700' }}>
          {formatDisplayDate(cycle.startDate)} - {formatDisplayDate(cycle.endDate)}
        </Text>
        <Text style={{ color: AppColors.mutedText, fontSize: 13 }}>
          {durationDays} {durationDays === 1 ? 'dia' : 'dias'} de duracao
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onEdit}
        style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ color: AppColors.primary, fontSize: 13, fontWeight: '700' }}>Editar</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onDelete}
        style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ color: AppColors.danger, fontSize: 13, fontWeight: '700' }}>Deletar</Text>
      </Pressable>
    </View>
  );
}
