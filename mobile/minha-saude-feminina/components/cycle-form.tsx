import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, type KeyboardTypeOptions, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { addDays } from '@/lib/cycle-calculations';
import { applyDateMask, isoToMask, maskToIso } from '@/lib/date-mask';
import type { CreateCycleRequest } from '@/types/cycle';

type EndMode = 'date' | 'duration';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}) {
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text style={{ color: AppColors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.mutedText}
        keyboardType={keyboardType}
        maxLength={maxLength}
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
  const [startDate, setStartDate] = useState(() => (initialValue?.startDate ? isoToMask(initialValue.startDate) : ''));
  const [endDate, setEndDate] = useState(() => (initialValue?.endDate ? isoToMask(initialValue.endDate) : ''));
  const [duration, setDuration] = useState('5');
  const [endMode, setEndMode] = useState<EndMode>('date');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(initialValue?.startDate ? isoToMask(initialValue.startDate) : '');
    setEndDate(initialValue?.endDate ? isoToMask(initialValue.endDate) : '');
    setLocalError(null);
  }, [initialValue?.startDate, initialValue?.endDate]);

  function handleSubmit() {
    const isoStartDate = maskToIso(startDate);
    if (!isoStartDate) {
      setLocalError('Informe a data de inicio completa, no formato DD/MM/AAAA.');
      return;
    }

    let resolvedEndDate: string;
    if (endMode === 'duration') {
      const days = Number(duration);
      if (!Number.isInteger(days) || days < 1) {
        setLocalError('Informe uma duracao valida, em dias (minimo 1).');
        return;
      }
      resolvedEndDate = addDays(isoStartDate, days - 1);
    } else {
      const isoEndDate = maskToIso(endDate);
      if (!isoEndDate) {
        setLocalError('Informe a data de fim completa, no formato DD/MM/AAAA.');
        return;
      }
      resolvedEndDate = isoEndDate;
    }

    setLocalError(null);
    void onSubmit({ startDate: isoStartDate, endDate: resolvedEndDate });
  }

  const message = localError ?? errorMessage;

  return (
    <View style={{ gap: 14 }}>
      <Field
        label="Inicio da menstruacao"
        value={startDate}
        onChangeText={(text) => setStartDate(applyDateMask(text))}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        maxLength={10}
      />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setEndMode('date')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: endMode === 'date' ? AppColors.primary : AppColors.surface,
            borderWidth: 1,
            borderColor: endMode === 'date' ? AppColors.primary : AppColors.border,
          }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: endMode === 'date' ? AppColors.primaryForeground : AppColors.mutedText,
            }}>
            Data de fim
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setEndMode('duration')}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: endMode === 'duration' ? AppColors.primary : AppColors.surface,
            borderWidth: 1,
            borderColor: endMode === 'duration' ? AppColors.primary : AppColors.border,
          }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: endMode === 'duration' ? AppColors.primaryForeground : AppColors.mutedText,
            }}>
            Duracao (dias)
          </Text>
        </Pressable>
      </View>

      {endMode === 'date' ? (
        <Field
          label="Fim da menstruacao"
          value={endDate}
          onChangeText={(text) => setEndDate(applyDateMask(text))}
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
        />
      ) : (
        <Field
          label="Duracao em dias"
          value={duration}
          onChangeText={setDuration}
          placeholder="5"
          keyboardType="number-pad"
        />
      )}

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
