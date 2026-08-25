import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { AppColors } from '@/constants/theme';
import { cycleDateRange } from '@/lib/cycle-calculations';
import type { CyclePrediction, CycleRecord } from '@/types/cycle';

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

    return Object.fromEntries(
      Object.entries(marks).map(([date, mark]) => [
        date,
        {
          startingDay: true,
          endingDay: true,
          color: mark.color,
          textColor: mark.textColor,
        },
      ])
    );
  }, [cycles, prediction]);

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
          onDayPress={(_day: DateData) => {}}
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
    </View>
  );
}
