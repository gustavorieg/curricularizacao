export type CycleRecord = {
  id: string;
  /** ISO date string (YYYY-MM-DD), primeiro dia da menstruacao. */
  startDate: string;
  /** ISO date string (YYYY-MM-DD), ultimo dia da menstruacao. */
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCycleRequest = {
  startDate: string;
  endDate: string;
};

export type CyclePrediction = {
  /** Duracao media do ciclo (dias entre inicios), com fallback de 28. */
  averageCycleLength: number;
  /** Duracao media da menstruacao em dias. */
  averagePeriodLength: number;
  /** Proxima data estimada de inicio da menstruacao (YYYY-MM-DD). */
  nextPeriodStart: string;
  /** Dia estimado da ovulacao do proximo ciclo (YYYY-MM-DD). */
  estimatedOvulationDate: string;
  /** Dias do periodo fertil (5 dias antes da ovulacao ate o dia da ovulacao), YYYY-MM-DD. */
  fertileWindow: string[];
};
