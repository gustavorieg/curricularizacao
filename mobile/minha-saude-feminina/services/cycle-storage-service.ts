import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CreateCycleRequest, CycleRecord } from '@/types/cycle';

const STORAGE_KEY = '@minha-saude-feminina/cycles';

function generateId(): string {
  return `cycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readAll(): Promise<CycleRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(cycles: CycleRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
}

export const cycleStorageService = {
  async list(): Promise<CycleRecord[]> {
    const cycles = await readAll();
    return [...cycles].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
  },

  async create(payload: CreateCycleRequest): Promise<CycleRecord> {
    const cycles = await readAll();
    const now = new Date().toISOString();
    const record: CycleRecord = {
      id: generateId(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      createdAt: now,
      updatedAt: now,
    };
    cycles.push(record);
    await writeAll(cycles);
    return record;
  },

  async update(id: string, payload: CreateCycleRequest): Promise<CycleRecord> {
    const cycles = await readAll();
    const index = cycles.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Registro de ciclo nao encontrado.');
    }
    const updated: CycleRecord = {
      ...cycles[index],
      startDate: payload.startDate,
      endDate: payload.endDate,
      updatedAt: new Date().toISOString(),
    };
    cycles[index] = updated;
    await writeAll(cycles);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const cycles = await readAll();
    await writeAll(cycles.filter((c) => c.id !== id));
  },
};
