"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import datos from "@/data/datos.json";
import { round2 } from "@/lib/finanzas";

export type TipoMov = "ingreso" | "gasto" | "aporte";
export type Mov = {
  id: number;
  tipo: TipoMov;
  texto: string;
  monto: number;
  fecha: string;
  nuevo?: boolean;
};
export type Tab = "inicio" | "chat" | "proyeccion" | "futuro";
export type Chip = {
  etiqueta: string;
  enviar?: string;
  aporte?: { prev: number; emer: number; motivo: string };
  rechazo?: boolean;
  ir?: Tab;
};
export type Msg = { id: number; de: "bot" | "juan"; texto: string; chips?: Chip[] };

type Estado = {
  registrado: boolean;
  nombre: string;
  saldoPrev: number;
  saldoEmer: number;
  semanas: boolean[];
  movimientos: Mov[];
  chat: Msg[];
  escribiendo: boolean;
  aporteMensual: number;
  tasa: number;
  celebracion: string | null;
};

export const SUGERENCIAS: Chip[] = [
  { etiqueta: "Hoy recibí 350 soles", enviar: "Hoy recibí 350 soles" },
  { etiqueta: "Gasté 6 en desayuno", enviar: "Gasté 6 en desayuno" },
  { etiqueta: "¿Qué es una AFP?", enviar: "¿Qué es una AFP?" },
];

const inicial: Estado = {
  registrado: false,
  nombre: datos.usuario.nombre,
  saldoPrev: datos.estadoInicial.saldoPrevisional,
  saldoEmer: datos.estadoInicial.saldoEmergencia,
  semanas: datos.estadoInicial.semanas,
  movimientos: datos.movimientos.map((m) => ({ ...m, tipo: m.tipo as TipoMov })),
  chat: [
    {
      id: 1,
      de: "bot",
      texto:
        "¡Hola! 👋 Soy el asistente de Nido.\n\nCuéntame cuando recibas o gastes dinero, como se lo contarías a un amigo. Yo te sugiero cuánto apartar, sin montos fijos.",
      chips: SUGERENCIAS,
    },
  ],
  escribiendo: false,
  aporteMensual: datos.estadoInicial.aporteMensual,
  tasa: datos.estadoInicial.tasa,
  celebracion: null,
};

let ultimoId = 1000;
const nuevoId = () => ++ultimoId;

// La semana en curso aún pendiente no rompe la racha: se cuenta desde la última cerrada.
export function calcularRacha(semanas: boolean[]) {
  let i = semanas.length - 1;
  if (!semanas[i]) i--;
  let n = 0;
  while (i >= 0 && semanas[i]) {
    n++;
    i--;
  }
  return n;
}

export const NIVELES = [
  { nivel: 1, nombre: "Bellota", emoji: "🌰", desde: 0 },
  { nivel: 2, nombre: "Ardilla Constante", emoji: "🐿️", desde: 3 },
  { nivel: 3, nombre: "Ardilla Maestra", emoji: "🐿️", desde: 6 },
];

export function nivelMascota(racha: number) {
  return [...NIVELES].reverse().find((n) => racha >= n.desde) ?? NIVELES[0];
}

function useCrearNido() {
  const [estado, setEstado] = useState<Estado>(inicial);

  return {
    ...estado,
    registrar: (nombre: string) =>
      setEstado((e) => ({ ...e, registrado: true, nombre: nombre.trim() || e.nombre })),
    agregarMsg: (de: Msg["de"], texto: string, chips?: Chip[]) => {
      const id = nuevoId();
      setEstado((e) => ({ ...e, chat: [...e.chat, { id, de, texto, chips }] }));
    },
    setEscribiendo: (v: boolean) => setEstado((e) => ({ ...e, escribiendo: v })),
    registrarMov: (tipo: TipoMov, texto: string, monto: number) => {
      const id = nuevoId();
      setEstado((e) => ({
        ...e,
        movimientos: [{ id, tipo, texto, monto, fecha: "Hoy", nuevo: true }, ...e.movimientos],
      }));
    },
    aportar: (prev: number, emer: number, motivo: string) => {
      const antes = calcularRacha(estado.semanas);
      const despues = calcularRacha([...estado.semanas.slice(0, -1), true]);
      const id = nuevoId();
      setEstado((e) => ({
        ...e,
        saldoPrev: round2(e.saldoPrev + prev),
        saldoEmer: round2(e.saldoEmer + emer),
        semanas: [...e.semanas.slice(0, -1), true],
        movimientos: [
          { id, tipo: "aporte", texto: motivo, monto: round2(prev + emer), fecha: "Hoy", nuevo: true },
          ...e.movimientos,
        ],
      }));
      return {
        subioRacha: despues > antes,
        racha: despues,
        evoluciono: nivelMascota(despues).nivel > nivelMascota(antes).nivel,
      };
    },
    celebrar: (nombre: string) => setEstado((e) => ({ ...e, celebracion: nombre })),
    cerrarCelebracion: () => setEstado((e) => ({ ...e, celebracion: null })),
    setAporteMensual: (v: number) => setEstado((e) => ({ ...e, aporteMensual: v })),
    setTasa: (v: number) => setEstado((e) => ({ ...e, tasa: v })),
  };
}

type Nido = ReturnType<typeof useCrearNido>;
const Contexto = createContext<Nido | null>(null);

export function ProveedorNido({ children }: { children: ReactNode }) {
  const nido = useCrearNido();
  return <Contexto.Provider value={nido}>{children}</Contexto.Provider>;
}

export function useNido() {
  const nido = useContext(Contexto);
  if (!nido) throw new Error("useNido debe usarse dentro de <ProveedorNido>");
  return nido;
}
