/** Aplica mascara DD/MM/AAAA progressivamente enquanto o usuario digita. */
export function applyDateMask(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte "DD/MM/AAAA" (mascara completa) para "AAAA-MM-DD" (ISO). Retorna null se incompleto/invalido. */
export function maskToIso(masked: string): string | null {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

/** Converte "AAAA-MM-DD" (ISO) para "DD/MM/AAAA" (mascara), para exibir valores existentes. */
export function isoToMask(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
