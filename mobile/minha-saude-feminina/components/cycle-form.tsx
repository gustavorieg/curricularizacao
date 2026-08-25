import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { isValidDateString } from '@/lib/cycle-calculations';
import type { CreateCycleRequest } from '@/types/cycle';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={{ color: AppColors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.mutedText}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 14,
          padding: 12,
          color: AppColors.text,
          backgroundColor: AppColors.surface,
          fontSize: 16,
        }}
      />
    </View>
  );
}

export function CycleForm({
  initialValue,
  submitLabel,
  pending = false,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  initialValue?: Partial<CreateCycleRequest>;
  submitLabel: string;
  pending?: boolean;
  errorMessage?: string | null;
  onSubmit(payload: CreateCycleRequest): void | Promise<void>;
  onCancel?(): void;
}) {
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValue?.endDate ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(initialValue?.startDate ?? '');
    setEndDate(initialValue?.endDate ?? '');
    setLocalError(null);
  }, [initialValue?.startDate, initialValue?.endDate]);

  function handleSubmit() {
    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      setLocalError('Use o formato AAAA-MM-DD para as datas.');
      return;
    }
    setLocalError(null);
    void onSubmit({ startDate, endDate });
  }

  const message = localError ?? errorMessage;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Field label="Inicio da menstruacao" value={startDate} onChangeText={setStartDate} placeholder="2026-08-01" />
        <Field label="Fim da menstruacao" value={endDate} onChangeText={setEndDate} placeholder="2026-08-05" />
      </View>

      {message ? (
        <Text selectable style={{ color: AppColors.danger, fontSize: 13, lineHeight: 18 }}>
          {message}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => ({
              minHeight: 48,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: AppColors.border,
              backgroundColor: AppColors.surface,
              opacity: pressed ? 0.72 : 1,
            })}>
            <Text style={{ color: AppColors.text, fontSize: 16, fontWeight: '700' }}>Cancelar</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={handleSubmit}
          style={({ pressed }) => ({
            minHeight: 48,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: AppColors.primary,
            opacity: pending || pressed ? 0.72 : 1,
          })}>
          <Text style={{ color: AppColors.primaryForeground, fontSize: 16, fontWeight: '800' }}>
            {pending ? 'Salvando...' : submitLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
