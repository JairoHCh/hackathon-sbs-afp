"use client";

import {
  ArrowDownLeft,
  Flame,
  House,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import datos from "@/data/datos.json";
import { proyectar, soles } from "@/lib/finanzas";
import { Avatar, Grafico, Kapicoin } from "@/components/comunes";
import { calcularRacha, misionesPorReclamar, nivelMascota, useNido, type TipoMov } from "@/components/estado";

const ICONO: Record<TipoMov, LucideIcon> = { ingreso: ArrowDownLeft, gasto: Receipt, aporte: PiggyBank };
const NAV: { texto: string; icono: LucideIcon }[] = [
  { texto: "Resumen", icono: House },
  { texto: "Movimientos", icono: Receipt },
  { texto: "Misiones", icono: Target },
  { texto: "Proyección", icono: TrendingUp },
];

export function VistaWeb({ volver }: { volver: () => void }) {
  const n = useNido();
  const racha = calcularRacha(n.semanas);
  const nivel = nivelMascota(racha);
  const a = proyectar(n.aporteMensual, 20, n.tasa);
  const porReclamar = misionesPorReclamar(n.misiones);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="overflow-hidden rounded-3xl border border-borde bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-borde bg-fondo px-4 py-2.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-lg bg-white px-3 py-1 text-xs text-tenue">nido.app/panel</span>
        </div>

        <div className="flex">
          <aside className="hidden w-60 shrink-0 flex-col border-r border-borde p-5 md:flex">
            <p className="font-display text-2xl font-semibold text-marca-700">{datos.app.nombre}</p>
            <nav className="mt-6 space-y-1 text-sm">
              {NAV.map(({ texto, icono: Icono }, i) => (
                <p
                  key={texto}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${
                    i === 0 ? "bg-marca-50 font-semibold text-marca-700" : "text-suave"
                  }`}
                >
                  <Icono className="size-4" aria-hidden="true" />
                  {texto}
                </p>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl bg-kapifin-50 p-3">
              <div className="flex items-center gap-2">
                <Avatar id="kapifin" tam={32} />
                <p className="font-display text-sm font-semibold text-kapifin-900">Kapifin</p>
              </div>
              <p className="mt-2 text-xs text-kapifin-900/80">
                {porReclamar > 0 ? `Tienes ${porReclamar} misiones por reclamar.` : "¡Vas al día con tus misiones!"}
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-5 bg-fondo/60 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-suave">Hola, {n.nombre}</p>
                <h1 className="font-display text-3xl font-semibold">Tu panel de ahorro</h1>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-marca-700 shadow-suave">
                <span className="size-2 animate-pulse rounded-full bg-marca" />
                Sincronizado con tu celular
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi icono={ShieldCheck} titulo="Para tu yo de 65" valor={soles(n.saldoPrev)} nota="Ahorro previsional" acento="text-marca" />
              <Kpi icono={Umbrella} titulo="Fondo de emergencia" valor={soles(n.saldoEmer)} nota="Disponible" acento="text-suave" />
              <Kpi icono={Flame} titulo="Racha semanal" valor={`${racha} semanas`} nota={nivel.nombre} acento="text-kapifin" />
              <div className="rounded-3xl bg-white p-4 shadow-suave">
                <p className="flex items-center gap-2 text-sm text-suave">
                  <Kapicoin tam={18} /> Kapicoins
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{n.kapicoins}</p>
                <p className="text-xs text-tenue">Canjéalas en la tienda</p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
              <section className="rounded-3xl bg-white p-5 shadow-suave lg:col-span-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">Proyección a los 65</p>
                    <p className="text-xs text-tenue">
                      Ilustrativa · {soles(n.aporteMensual)} al mes · {n.tasa * 100}% real anual supuesto
                    </p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-sabiondo-700">{soles(a.total)}</p>
                </div>
                <div className="mt-3">
                  <Grafico aporte={n.aporteMensual} tasa={n.tasa} />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-suave lg:col-span-2">
                <p className="font-display text-lg font-semibold">Movimientos</p>
                <p className="mb-2 text-xs text-tenue">Lo que registras por WhatsApp aparece aquí al instante</p>
                <ul className="divide-y divide-borde">
                  {n.movimientos.slice(0, 7).map((m) => {
                    const Icono = ICONO[m.tipo];
                    return (
                      <li key={m.id} className={`flex items-center gap-3 py-2.5 ${m.nuevo ? "animar-subida" : ""}`}>
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full ${
                            m.tipo === "aporte" ? "bg-marca-50 text-marca" : "bg-fondo text-suave"
                          }`}
                        >
                          <Icono className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{m.texto}</p>
                          <p className="text-xs text-tenue">
                            {m.fecha}
                            {m.nuevo && (
                              <span className="ml-2 rounded-md bg-kapifin-50 px-1.5 py-0.5 text-[10px] font-bold text-kapifin-900">
                                Nuevo · WhatsApp
                              </span>
                            )}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            m.tipo === "gasto" ? "text-peligro" : m.tipo === "aporte" ? "text-marca-700" : ""
                          }`}
                        >
                          {m.tipo === "gasto" ? "−" : "+"}
                          {soles(m.monto)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <section className="flex items-center gap-4 rounded-3xl bg-marca-50 p-4">
              <Avatar id="porky" tam={52} />
              <p className="text-sm text-marca-700">
                <b className="font-display text-base">Porky Cash:</b> «Mi superpoder es pensar en el largo plazo: ¡cada sol
                cuenta!»
              </p>
            </section>
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={volver}
        className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
      >
        <Smartphone className="size-4" aria-hidden="true" />
        Volver al celular
      </button>
    </div>
  );
}

function Kpi({
  icono: Icono,
  titulo,
  valor,
  nota,
  acento,
}: {
  icono: LucideIcon;
  titulo: string;
  valor: string;
  nota: string;
  acento: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-suave">
      <p className="flex items-center gap-2 text-sm text-suave">
        <Icono className={`size-4 ${acento}`} aria-hidden="true" />
        {titulo}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{valor}</p>
      <p className="text-xs text-tenue">{nota}</p>
    </div>
  );
}
