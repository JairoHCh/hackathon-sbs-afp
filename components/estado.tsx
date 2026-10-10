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
export type Tab = "inicio" | "chat" | "misiones" | "proyeccion" | "futuro";
export type Chip = {
  etiqueta: string;
  enviar?: string;
  aporte?: { prev: number; emer: number; motivo: string };
  rechazo?: boolean;
  ir?: Tab;
};
export type Msg = { id: number; de: "bot" | "juan"; texto: string; chips?: Chip[] };
export type EstadoMision = "pendiente" | "lista" | "reclamada";

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
  kapicoins: number;
  misiones: Record<string, EstadoMision>;
  canjes: string[];
  aviso: { id: number; texto: string } | null;
  celebracion: string | null;
  leccion: IdPersonaje | null;
  leccionesVistas: IdPersonaje[];
};

export type IdPersonaje = "porky" | "sabiondo" | "kapifin" | "monedina";

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
        "¡Hola! 👋 Soy Porky Cash, tu aliado en el ahorro.\n\nCuéntame cuando recibas o gastes dinero, como se lo contarías a un amigo. Yo te sugiero cuánto apartar, sin montos fijos.",
      chips: SUGERENCIAS,
    },
  ],
  escribiendo: false,
  aporteMensual: datos.estadoInicial.aporteMensual,
  tasa: datos.estadoInicial.tasa,
  kapicoins: datos.estadoInicial.kapicoins,
  misiones: Object.fromEntries(datos.misiones.map((m) => [m.id, m.inicial as EstadoMision])),
  canjes: [],
  aviso: null,
  celebracion: null,
  leccion: null,
  leccionesVistas: [],
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
  { nivel: 1, nombre: "Monedina Novata", desde: 0 },
  { nivel: 2, nombre: "Monedina Constante", desde: 3 },
  { nivel: 3, nombre: "Monedina Maestra", desde: 6 },
];

export function nivelMascota(racha: number) {
  return [...NIVELES].reverse().find((n) => racha >= n.desde) ?? NIVELES[0];
}

// Marca como "lista" (por reclamar) toda misión pendiente que se cumple con esta acción.
// Devuelve el mismo objeto si nada cambia, para no provocar renders de más.
function cumplir(misiones: Record<string, EstadoMision>, ...acciones: string[]) {
  const ids = datos.misiones
    .filter((m) => acciones.includes(m.accion) && misiones[m.id] === "pendiente")
    .map((m) => m.id);
  if (ids.length === 0) return misiones;
  return { ...misiones, ...Object.fromEntries(ids.map((id) => [id, "lista" as const])) };
}

export const misionesPorReclamar = (misiones: Record<string, EstadoMision>) =>
  Object.values(misiones).filter((e) => e === "lista").length;

function useCrearNido() {
  const [estado, setEstado] = useState<Estado>(inicial);

  const avisar = (texto: string) => {
    const id = nuevoId();
    setEstado((e) => ({ ...e, aviso: { id, texto } }));
    setTimeout(() => setEstado((e) => (e.aviso?.id === id ? { ...e, aviso: null } : e)), 1800);
  };

  return {
    ...estado,
    // Al registrarse, Kapifin (líder del equipo) da la bienvenida a pantalla completa.
    registrar: (nombre: string) =>
      setEstado((e) => ({ ...e, registrado: true, nombre: nombre.trim() || e.nombre, leccion: "kapifin" })),
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
        misiones: cumplir(e.misiones, "registrar"),
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
        misiones: cumplir(e.misiones, "apartar", "semana"),
      }));
      return {
        subioRacha: despues > antes,
        racha: despues,
        evoluciono: nivelMascota(despues).nivel > nivelMascota(antes).nivel,
      };
    },
    cumplirMision: (accion: string) =>
      setEstado((e) => {
        const misiones = cumplir(e.misiones, accion);
        return misiones === e.misiones ? e : { ...e, misiones };
      }),
    abrirLeccion: (id: IdPersonaje) => setEstado((e) => ({ ...e, leccion: id })),
    cerrarLeccion: () => setEstado((e) => ({ ...e, leccion: null })),
    terminarLeccion: (id: IdPersonaje) =>
      setEstado((e) => ({
        ...e,
        leccionesVistas: e.leccionesVistas.includes(id) ? e.leccionesVistas : [...e.leccionesVistas, id],
        misiones: cumplir(e.misiones, "leccion"),
      })),
    reclamar: (id: string) => {
      const m = datos.misiones.find((x) => x.id === id);
      if (!m || estado.misiones[id] !== "lista") return;
      setEstado((e) => ({
        ...e,
        kapicoins: e.kapicoins + m.recompensa,
        misiones: { ...e.misiones, [id]: "reclamada" },
      }));
      avisar(`+${m.recompensa} Kapicoins`);
    },
    canjear: (id: string) => {
      const item = datos.tienda.find((x) => x.id === id);
      if (!item || estado.kapicoins < item.precio || estado.canjes.includes(id)) return;
      setEstado((e) => ({ ...e, kapicoins: e.kapicoins - item.precio, canjes: [...e.canjes, id] }));
      avisar(`Canjeaste: ${item.titulo}`);
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
