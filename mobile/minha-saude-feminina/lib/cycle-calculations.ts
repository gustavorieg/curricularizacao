import type { CycleRecord, CyclePrediction } from '@/types/cycle';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const LUTEAL_PHASE_LENGTH = 14;
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;

/** Parseia uma string YYYY-MM-DD como data local, evitando bugs de fuso horario. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value: string, days: number): string {
  const date = parseDateOnly(value);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
}

export function diffInDays(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / msPerDay);
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseDateOnly(value);
  return !Number.isNaN(date.getTime()) && formatDateOnly(date) === value;
}

export type CycleFormValidationError =
  | 'INVALID_START_DATE'
  | 'INVALID_END_DATE'
  | 'END_BEFORE_START'
  | 'OVERLAPS_EXISTING_CYCLE';

/**
 * Valida um novo/editado ciclo contra os demais ciclos ja registrados.
 * `ignoreId` permite excluir o proprio registro da checagem de sobreposicao ao editar.
 */
export function validateCycleInput(
  input: { startDate: string; endDate: string },
  existingCycles: CycleRecord[],
  ignoreId?: string
): CycleFormValidationError | null {
  if (!isValidDateString(input.startDate)) return 'INVALID_START_DATE';
  if (!isValidDateString(input.endDate)) return 'INVALID_END_DATE';
  if (diffInDays(input.startDate, input.endDate) < 0) return 'END_BEFORE_START';

  const overlaps = existingCycles.some((cycle) => {
    if (cycle.id === ignoreId) return false;
    return input.startDate <= cycle.endDate && cycle.startDate <= input.endDate;
  });
  if (overlaps) return 'OVERLAPS_EXISTING_CYCLE';

  return null;
}

export function validationErrorMessage(error: CycleFormValidationError): string {
  switch (error) {
    case 'INVALID_START_DATE':
      return 'Informe uma data de inicio valida.';
    case 'INVALID_END_DATE':
      return 'Informe uma data de fim valida.';
    case 'END_BEFORE_START':
      return 'A data de fim deve ser igual ou posterior a data de inicio.';
    case 'OVERLAPS_EXISTING_CYCLE':
      return 'Este periodo se sobrepoe a um ciclo ja registrado.';
    default:
      return 'Dados invalidos.';
  }
}

/**
 * Calcula a previsao do proximo ciclo com base no historico.
 * Usa a media de dias entre inicios consecutivos quando ha 2+ registros;
 * caso contrario usa 28 dias (ciclo padrao) a partir do ultimo registro.
 */
export function predictNextCycle(cycles: CycleRecord[]): CyclePrediction | null {
  if (cycles.length === 0) return null;

  const sorted = [...cycles].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
  const last = sorted[sorted.length - 1];

  let averageCycleLength = DEFAULT_CYCLE_LENGTH;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      gaps.push(diffInDays(sorted[i - 1].startDate, sorted[i].startDate));
    }
    const validGaps = gaps.filter((gap) => gap > 0);
    if (validGaps.length > 0) {
      averageCycleLength = Math.round(validGaps.reduce((sum, gap) => sum + gap, 0) / validGaps.length);
    }
  }

  const periodLengths = sorted.map((c) => diffInDays(c.startDate, c.endDate) + 1).filter((n) => n > 0);
  const averagePeriodLength =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, n) => sum + n, 0) / periodLengths.length)
      : DEFAULT_PERIOD_LENGTH;

  const nextPeriodStart = addDays(last.startDate, averageCycleLength);
  const estimatedOvulationDate = addDays(nextPeriodStart, -LUTEAL_PHASE_LENGTH);
  const fertileWindow: string[] = [];
  for (let i = FERTILE_WINDOW_DAYS_BEFORE_OVULATION; i >= 0; i -= 1) {
    fertileWindow.push(addDays(estimatedOvulationDate, -i));
  }

  return {
    averageCycleLength,
    averagePeriodLength,
    nextPeriodStart,
    estimatedOvulationDate,
    fertileWindow,
  };
}

/** Todas as datas (YYYY-MM-DD) cobertas por um ciclo, do inicio ao fim, inclusive. */
export function cycleDateRange(cycle: CycleRecord): string[] {
  const days: string[] = [];
  let cursor = cycle.startDate;
  while (cursor <= cycle.endDate) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}
