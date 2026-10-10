export const round2 = (n: number) => Math.round(n * 100) / 100;

export function soles(n: number) {
  const conDecimales = Math.abs(n % 1) > 0.001 && Math.abs(n) < 1000;
  return (
    "S/ " +
    n.toLocaleString("es-PE", {
      minimumFractionDigits: conDecimales ? 2 : 0,
      maximumFractionDigits: conDecimales ? 2 : 0,
    })
  );
}

export type Punto = { edad: number; valor: number };

// Aportes mensuales constantes con capitalización mensual. La tasa es real
// (descontada la inflación), así el resultado se lee en soles de hoy.
export function proyectar(
  aporteMensual: number,
  edadInicio: number,
  tasaAnual: number,
  edadFin = 65,
) {
  const meses = Math.max(0, (edadFin - edadInicio) * 12);
  const r = tasaAnual / 12;
  const serie: Punto[] = [{ edad: edadInicio, valor: 0 }];
  let valor = 0;
  for (let m = 1; m <= meses; m++) {
    valor = valor * (1 + r) + aporteMensual;
    if (m % 12 === 0) serie.push({ edad: edadInicio + m / 12, valor });
  }
  return { total: valor, aportado: aporteMensual * meses, serie };
}

export const TASAS = [
  { nombre: "Prudente", valor: 0.02 },
  { nombre: "Moderado", valor: 0.04 },
  { nombre: "Optimista", valor: 0.06 },
];
