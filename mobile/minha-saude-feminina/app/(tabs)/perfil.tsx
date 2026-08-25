import { Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { AppColors, Fonts } from '@/constants/theme';
import { useCycles } from '@/hooks/use-cycle';
import { parseDateOnly } from '@/lib/cycle-calculations';

function formatDisplayDate(value: string): string {
  return parseDateOnly(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: AppColors.mutedText, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: AppColors.text, fontSize: 15, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const cycles = useCycles();

  const sorted = [...cycles.data].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const firstRecord = sorted[0];
  const lastRecord = sorted[sorted.length - 1];

  return (
    <AppScreen>
      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{ color: AppColors.text, fontFamily: Fonts.serif, fontSize: 32, lineHeight: 38 }}>
          Perfil
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 16, lineHeight: 24 }}>
          Este app nao exige cadastro ou login. Tudo aqui e local: os dados abaixo existem
          somente neste dispositivo.
        </Text>
      </View>

      <View
        style={{
          gap: 12,
          padding: 18,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 18,
          backgroundColor: AppColors.surface,
        }}>
        <Text selectable style={{ color: AppColors.text, fontSize: 17, fontWeight: '800' }}>
          Meus dados locais
        </Text>

        <StatRow label="Ciclos registrados" value={String(cycles.data.length)} />
        {firstRecord ? <StatRow label="Primeiro registro" value={formatDisplayDate(firstRecord.startDate)} /> : null}
        {lastRecord ? <StatRow label="Ultimo registro" value={formatDisplayDate(lastRecord.startDate)} /> : null}
        {cycles.prediction ? (
          <StatRow label="Duracao media do ciclo" value={`${cycles.prediction.averageCycleLength} dias`} />
        ) : null}

        {cycles.data.length === 0 ? (
          <Text selectable style={{ color: AppColors.mutedText, fontSize: 14, lineHeight: 20 }}>
            Nenhum ciclo registrado ainda. Use a aba &ldquo;Meu Ciclo&rdquo; para comecar.
          </Text>
        ) : null}
      </View>

      <View
        style={{
          gap: 10,
          padding: 18,
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 18,
          backgroundColor: AppColors.surface,
        }}>
        <Text selectable style={{ color: AppColors.text, fontSize: 17, fontWeight: '800' }}>
          Privacidade
        </Text>
        <Text selectable style={{ color: AppColors.mutedText, fontSize: 15, lineHeight: 22 }}>
          Os registros do seu ciclo ficam salvos apenas neste aparelho (armazenamento local),
          sem sincronizacao com servidores ou outros dispositivos.
        </Text>
      </View>
    </AppScreen>
  );
}
