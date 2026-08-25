import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { CycleCalendar } from '@/components/cycle-calendar';
import { CycleForm } from '@/components/cycle-form';
import { CycleListItem } from '@/components/cycle-list-item';
import { CyclePredictionCard } from '@/components/cycle-prediction-card';
import { SectionHeader } from '@/components/section-header';
import { StateView } from '@/components/state-view';
import { AppColors } from '@/constants/theme';
import { useCycles } from '@/hooks/use-cycle';
import { confirmAction } from '@/lib/confirm';
import type { CreateCycleRequest, CycleRecord } from '@/types/cycle';

export default function MeuCicloScreen() {
  const cycles = useCycles();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CycleRecord | null>(null);
  const [pending, setPending] = useState(false);

  function openCreateForm() {
    setEditingCycle(null);
    cycles.clearMutationError();
    setFormOpen(true);
  }

  function openEditForm(cycle: CycleRecord) {
    setEditingCycle(cycle);
    cycles.clearMutationError();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCycle(null);
    cycles.clearMutationError();
  }

  async function handleSubmit(payload: CreateCycleRequest) {
    setPending(true);
    try {
      const ok = editingCycle ? await cycles.update(editingCycle.id, payload) : await cycles.create(payload);
      if (ok) closeForm();
    } finally {
      setPending(false);
    }
  }

  function handleDelete(cycle: CycleRecord) {
    confirmAction('Deletar ciclo', 'Tem certeza que deseja remover este registro?', () => {
      void cycles.remove(cycle.id);
    });
  }

  return (
    <AppScreen>
      <SectionHeader
        title="Meu Ciclo"
        action={
          !formOpen ? (
            <Pressable
              accessibilityRole="button"
              onPress={openCreateForm}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: AppColors.primary,
                opacity: pressed ? 0.8 : 1,
              })}>
              <Text style={{ color: AppColors.primaryForeground, fontSize: 14, fontWeight: '700' }}>
                + Registrar
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {formOpen ? (
        <View
          style={{
            padding: 16,
            borderWidth: 1,
            borderColor: AppColors.border,
            borderRadius: 18,
            backgroundColor: AppColors.surface,
            gap: 12,
          }}>
          <Text style={{ color: AppColors.text, fontSize: 16, fontWeight: '700' }}>
            {editingCycle ? 'Editar registro' : 'Novo registro de ciclo'}
          </Text>
          <CycleForm
            key={editingCycle?.id ?? 'new'}
            initialValue={editingCycle ?? undefined}
            submitLabel={editingCycle ? 'Salvar alteracoes' : 'Registrar ciclo'}
            pending={pending}
            errorMessage={cycles.mutationError}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </View>
      ) : null}

      {cycles.status === 'loading' ? (
        <StateView loading title="Carregando seus ciclos..." />
      ) : cycles.status === 'error' ? (
        <StateView
          title="Nao foi possivel carregar seus ciclos"
          message={cycles.message}
          actionLabel="Tentar novamente"
          onAction={() => void cycles.retry()}
        />
      ) : (
        <>
          {cycles.prediction ? <CyclePredictionCard prediction={cycles.prediction} /> : null}

          <CycleCalendar cycles={cycles.data} prediction={cycles.prediction} />

          <SectionHeader title="Historico" />
          {cycles.data.length === 0 ? (
            <StateView
              title="Nenhum ciclo registrado"
              message="Registre o inicio e o fim da sua ultima menstruacao para comecar a ver previsoes."
            />
          ) : (
            <View style={{ gap: 10 }}>
              {cycles.data.map((cycle) => (
                <CycleListItem
                  key={cycle.id}
                  cycle={cycle}
                  onEdit={() => openEditForm(cycle)}
                  onDelete={() => handleDelete(cycle)}
                />
              ))}
            </View>
          )}
        </>
      )}
    </AppScreen>
  );
}
