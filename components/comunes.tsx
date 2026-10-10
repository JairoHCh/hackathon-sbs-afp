"use client";

import Image from "next/image";
import {
  Crown,
  Flame,
  Gift,
  Lightbulb,
  MessageCircle,
  PiggyBank,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import datos from "@/data/datos.json";
import { proyectar, soles, type Punto } from "@/lib/finanzas";
import { useNido, type IdPersonaje } from "@/components/estado";

export type { IdPersonaje };

// Clases completas (no interpoladas) para que Tailwind las detecte.
export const TONOS = {
  marca: { texto: "text-marca-700", fondo: "bg-marca-50", borde: "border-marca", solido: "bg-marca text-white" },
  sabiondo: { texto: "text-sabiondo-700", fondo: "bg-sabiondo-50", borde: "border-sabiondo", solido: "bg-sabiondo text-white" },
  kapifin: { texto: "text-kapifin-900", fondo: "bg-kapifin-50", borde: "border-kapifin", solido: "bg-kapifin text-kapifin-900" },
  monedina: { texto: "text-monedina-700", fondo: "bg-monedina-50", borde: "border-monedina", solido: "bg-monedina text-white" },
} as const;

// Tamaño real de las ilustraciones de cuerpo completo en /public/personajes.
export const CUERPOS: Record<IdPersonaje, { ancho: number; alto: number }> = {
  porky: { ancho: 335, alto: 480 },
  sabiondo: { ancho: 315, alto: 480 },
  kapifin: { ancho: 335, alto: 480 },
  monedina: { ancho: 341, alto: 480 },
};

export const personaje = (id: IdPersonaje) => datos.personajes.find((p) => p.id === id) ?? datos.personajes[0];
export const tono = (id: IdPersonaje) => TONOS[personaje(id).tono as keyof typeof TONOS];

export const ICONOS: Record<string, LucideIcon> = {
  sol: Sun,
  chat: MessageCircle,
  alcancia: PiggyBank,
  foco: Lightbulb,
  racha: Flame,
  grafico: TrendingUp,
  meta: Target,
  escudo: ShieldCheck,
  corona: Crown,
  regalo: Gift,
};

export function Avatar({ id, tam = 44, className = "" }: { id: IdPersonaje; tam?: number; className?: string }) {
  return (
    <Image
      src={`/personajes/${id}-cara.webp`}
      alt={personaje(id).nombre}
      width={tam}
      height={tam}
      className={`shrink-0 rounded-full bg-white object-cover ring-2 ring-white ${className}`}
      style={{ width: tam, height: tam }}
    />
  );
}

export function Kapicoin({ tam = 20 }: { tam?: number }) {
  return <Image src="/kapicoin.png" alt="Kapicoins" width={tam} height={tam} style={{ width: tam, height: tam }} />;
}

export function Personaje({ id, texto }: { id: IdPersonaje; texto?: string }) {
  const { abrirLeccion } = useNido();
  const p = personaje(id);
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => abrirLeccion(id)}
        aria-label={`Que ${p.nombre} te explique`}
        className="relative shrink-0 rounded-full transition active:scale-95"
      >
        <Avatar id={id} tam={48} className="shadow-suave" />
        <span className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full text-[11px] font-bold ring-2 ring-white ${tono(id).solido}`}>
          ?
        </span>
      </button>
      <div className="rounded-2xl rounded-tl-md border border-borde bg-white px-3.5 py-2.5 shadow-suave">
        <p className={`font-display text-[13px] font-semibold ${tono(id).texto}`}>{p.nombre}</p>
        <p className="mt-0.5 text-[14px] leading-snug">{texto ?? p.frase}</p>
      </div>
    </div>
  );
}

export function Grafico({ aporte, tasa }: { aporte: number; tasa: number }) {
  const a = proyectar(aporte, 20, tasa);
  const b = proyectar(aporte, 30, tasa);
  const W = 320;
  const H = 150;
  const pad = { l: 10, r: 10, t: 12, b: 22 };
  const max = a.total || 1;
  const x = (edad: number) => pad.l + ((edad - 20) / 45) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const linea = (serie: Punto[]) =>
    serie.map((p, i) => `${i ? "L" : "M"} ${x(p.edad).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(" ");
  const area = `${linea(a.serie)} L ${x(65)} ${y(0)} L ${x(20)} ${y(0)} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Proyección del ahorro según la edad de inicio">
        <defs>
          <linearGradient id="relleno" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2f6fe4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2f6fe4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#e2eae6" strokeWidth="1" />
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="#c9d3cf" strokeWidth="1" />
        <path d={area} fill="url(#relleno)" />
        <path d={linea(a.serie)} fill="none" stroke="#2f6fe4" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={linea(b.serie)} fill="none" stroke="#f2a900" strokeWidth="2.5" strokeDasharray="5 4" strokeLinejoin="round" />
        {[20, 30, 40, 50, 65].map((e) => (
          <text
            key={e}
            x={x(e)}
            y={H - 6}
            fontSize="10"
            fill="#6b7a75"
            textAnchor={e === 20 ? "start" : e === 65 ? "end" : "middle"}
          >
            {e === 65 ? "65 años" : e}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-suave">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-sabiondo" /> Empezando a los 20:{" "}
          <b className="tabular-nums text-tinta">{soles(a.total)}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-kapifin" /> A los 30:{" "}
          <b className="tabular-nums text-tinta">{soles(b.total)}</b>
        </span>
      </div>
    </div>
  );
}

export function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
