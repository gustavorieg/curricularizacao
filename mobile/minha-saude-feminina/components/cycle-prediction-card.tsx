import { Text, View } from 'react-native';

import { AppColors, Fonts } from '@/constants/theme';
import { parseDateOnly } from '@/lib/cycle-calculations';
import type { CyclePrediction } from '@/types/cycle';

function formatDisplayDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

export function CyclePredictionCard({ prediction }: { prediction: CyclePrediction }) {
  return (
    <View
      style={{
        gap: 10,
        padding: 18,
        borderRadius: 18,
        backgroundColor: AppColors.softCoral,
      }}>
      <Text style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 19, lineHeight: 24 }}>
        Proximo periodo estimado
      </Text>
      <Text style={{ color: AppColors.primary, fontSize: 26, fontWeight: '800' }}>
        {formatDisplayDate(prediction.nextPeriodStart)}
      </Text>
      <Text style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
        Ovulacao estimada em {formatDisplayDate(prediction.estimatedOvulationDate)} · janela fertil de{' '}
        {formatDisplayDate(prediction.fertileWindow[0])} a{' '}
        {formatDisplayDate(prediction.fertileWindow[prediction.fertileWindow.length - 1])}
      </Text>
      <Text style={{ color: AppColors.mutedText, fontSize: 13, lineHeight: 18 }}>
        Baseado em um ciclo medio de {prediction.averageCycleLength} dias e menstruacao media de{' '}
        {prediction.averagePeriodLength} dias.
      </Text>
    </View>
  );
}
