import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { AppColors } from '@/constants/theme';
import '@/lib/calendar-locale';
import { cycleDateRange, parseDateOnly } from '@/lib/cycle-calculations';
import type { CyclePrediction, CycleRecord } from '@/types/cycle';

function formatDisplayDate(value: string): string {
  const date = parseDateOnly(value);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface MarkedDay {
  startingDay: boolean;
  endingDay: boolean;
  color: string;
  textColor: string;
  selected?: boolean;
  selectedColor?: string;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
      <Text style={{ color: AppColors.mutedText, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function CycleCalendar({
  cycles,
  prediction,
}: {
  cycles: CycleRecord[];
  prediction: CyclePrediction | null;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, { color: string; textColor: string }> = {};

    for (const cycle of cycles) {
      for (const day of cycleDateRange(cycle)) {
        marks[day] = { color: AppColors.coral, textColor: AppColors.primaryForeground };
      }
    }

    if (prediction) {
      for (const day of prediction.fertileWindow) {
        if (!marks[day]) {
          marks[day] = { color: AppColors.softLavender, textColor: AppColors.text };
        }
      }
      if (!marks[prediction.nextPeriodStart]) {
        marks[prediction.nextPeriodStart] = { color: AppColors.softCoral, textColor: AppColors.text };
      }
    }

    const result: Record<string, MarkedDay> = {};
    for (const [date, mark] of Object.entries(marks)) {
      result[date] = {
        startingDay: true,
        endingDay: true,
        color: mark.color,
        textColor: mark.textColor,
      };
    }

    if (selectedDate) {
      const existing = result[selectedDate];
      result[selectedDate] = {
        startingDay: true,
        endingDay: true,
        color: existing?.color ?? 'transparent',
        textColor: existing?.textColor ?? AppColors.text,
        selected: true,
        selectedColor: existing ? undefined : AppColors.softLavender,
      };
    }

    return result;
  }, [cycles, prediction, selectedDate]);

  const selectedDetail = useMemo(() => {
    if (!selectedDate) return null;

    const cycle = cycles.find((c) => cycleDateRange(c).includes(selectedDate));
    if (cycle) {
      return {
        label: 'Dia de menstruacao',
        detail: `Ciclo registrado de ${formatDisplayDate(cycle.startDate)} a ${formatDisplayDate(cycle.endDate)}.`,
        color: AppColors.coral,
      };
    }

    if (prediction?.nextPeriodStart === selectedDate) {
      return {
        label: 'Proximo periodo (estimado)',
        detail: 'Data estimada de inicio do proximo ciclo menstrual.',
        color: AppColors.softCoral,
      };
    }

    if (prediction?.fertileWindow.includes(selectedDate)) {
      return {
        label: 'Dia fertil (estimado)',
        detail: 'Maior probabilidade de ovulacao neste periodo, com base no seu historico.',
        color: AppColors.softLavender,
      };
    }

    return {
      label: 'Sem registros',
      detail: 'Nenhum ciclo ou previsao cobre este dia.',
      color: AppColors.border,
    };
  }, [selectedDate, cycles, prediction]);

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: AppColors.surface,
        }}>
        <Calendar
          markingType="period"
          markedDates={markedDates}
          firstDay={0}
          onDayPress={(day: DateData) => setSelectedDate((current) => (current === day.dateString ? null : day.dateString))}
          theme={{
            backgroundColor: AppColors.surface,
            calendarBackground: AppColors.surface,
            textSectionTitleColor: AppColors.mutedText,
            selectedDayBackgroundColor: AppColors.primary,
            todayTextColor: AppColors.primary,
            dayTextColor: AppColors.text,
            monthTextColor: AppColors.text,
            arrowColor: AppColors.primary,
            textDisabledColor: AppColors.border,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 4 }}>
        <LegendItem color={AppColors.coral} label="Menstruacao" />
        <LegendItem color={AppColors.softLavender} label="Dias ferteis" />
        <LegendItem color={AppColors.softCoral} label="Proximo periodo (estimado)" />
      </View>

      {selectedDate && selectedDetail ? (
        <View
          accessibilityRole="summary"
          style={{
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: AppColors.border,
            backgroundColor: AppColors.surface,
            gap: 4,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: selectedDetail.color }} />
            <Text style={{ color: AppColors.text, fontSize: 14, fontWeight: '700' }}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
          <Text style={{ color: AppColors.text, fontSize: 13, fontWeight: '700' }}>{selectedDetail.label}</Text>
          <Text style={{ color: AppColors.mutedText, fontSize: 13, lineHeight: 18 }}>{selectedDetail.detail}</Text>
        </View>
      ) : null}
    </View>
  );
}
