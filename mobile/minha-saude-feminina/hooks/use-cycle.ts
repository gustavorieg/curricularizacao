import { useCallback, useEffect, useMemo, useState } from 'react';

import { predictNextCycle, validateCycleInput, validationErrorMessage } from '@/lib/cycle-calculations';
import { cycleStorageService } from '@/services/cycle-storage-service';
import type { AsyncResource } from '@/types/api';
import type { CreateCycleRequest, CycleRecord } from '@/types/cycle';

type CyclesState = AsyncResource<CycleRecord[]>;

export function useCycles() {
  const [state, setState] = useState<CyclesState>({ status: 'idle', data: [] });
  const [mutationError, setMutationError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState((current) => ({ status: 'loading', data: current.data }));
    try {
      const cycles = await cycleStorageService.list();
      setState({ status: cycles.length > 0 ? 'success' : 'empty', data: cycles });
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        message: error instanceof Error ? error.message : 'Nao foi possivel carregar os ciclos.',
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (payload: CreateCycleRequest) => {
      setMutationError(null);
      const error = validateCycleInput(payload, state.data);
      if (error) {
        setMutationError(validationErrorMessage(error));
        return false;
      }
      await cycleStorageService.create(payload);
      await load();
      return true;
    },
    [load, state.data]
  );

  const update = useCallback(
    async (id: string, payload: CreateCycleRequest) => {
      setMutationError(null);
      const error = validateCycleInput(payload, state.data, id);
      if (error) {
        setMutationError(validationErrorMessage(error));
        return false;
      }
      await cycleStorageService.update(id, payload);
      await load();
      return true;
    },
    [load, state.data]
  );

  const remove = useCallback(
    async (id: string) => {
      setMutationError(null);
      await cycleStorageService.remove(id);
      await load();
    },
    [load]
  );

  const prediction = useMemo(() => predictNextCycle(state.data), [state.data]);

  return {
    ...state,
    retry: load,
    prediction,
    mutationError,
    clearMutationError: () => setMutationError(null),
    create,
    update,
    remove,
  };
}
