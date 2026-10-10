"use client";

import datos from "@/data/datos.json";
import { proyectar, soles } from "@/lib/finanzas";
import { Grafico } from "@/components/comunes";
import { calcularRacha, nivelMascota, useNido, type TipoMov } from "@/components/estado";

const ICONO: Record<TipoMov, string> = { ingreso: "💸", gasto: "🧾", aporte: "🛡️" };
const NAV = ["Resumen", "Movimientos", "Proyección", "Mi equipo"];

export function VistaWeb({ volver }: { volver: () => void }) {
  const n = useNido();
  const racha = calcularRacha(n.semanas);
  const nivel = nivelMascota(racha);
  const a = proyectar(n.aporteMensual, 20, n.tasa);

  const kpis = [
    { titulo: "Para tu yo de 65", valor: soles(n.saldoPrev), nota: "Ahorro previsional", icono: "🛡️" },
    { titulo: "Fondo de emergencia", valor: soles(n.saldoEmer), nota: "Disponible", icono: "☂️" },
    { titulo: "Racha semanal", valor: `🔥 ${racha} semanas`, nota: `${nivel.emoji} ${nivel.nombre}`, icono: "🏅" },
    { titulo: "Proyección a los 65", valor: soles(a.total), nota: `con ${soles(n.aporteMensual)} al mes`, icono: "📈" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="overflow-hidden rounded-2xl border border-[#D5DDD9] bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-[#E3E9E6] bg-[#F6F8F7] px-4 py-2.5">
          <span className="size-3 rounded-full bg-[#FF5F57]" />
          <span className="size-3 rounded-full bg-[#FEBC2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-[#6B7A75]">
            nido.app/panel
          </span>
        </div>

        <div className="flex">
          <aside className="hidden w-56 shrink-0 border-r border-[#E3E9E6] p-5 md:block">
            <p className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🐿️</span> {datos.app.nombre}
            </p>
            <nav className="mt-6 space-y-1 text-sm">
              {NAV.map((item, i) => (
                <p
                  key={item}
                  className={`rounded-lg px-3 py-2 ${i === 0 ? "bg-[#E6F4EF] font-semibold text-[#0B5E4E]" : "text-[#56665F]"}`}
                >
                  {item}
                </p>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#56665F]">Hola, {n.nombre}</p>
                <h1 className="text-2xl font-bold tracking-tight">Tu panel de ahorro</h1>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-[#E6F4EF] px-3 py-1.5 text-xs font-medium text-[#0B5E4E]">
                <span className="size-2 animate-pulse rounded-full bg-[#16A34A]" />
                Sincronizado con tu celular
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.titulo} className="rounded-2xl border border-[#E3E9E6] p-4">
                  <p className="text-sm text-[#56665F]">
                    {k.icono} {k.titulo}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{k.valor}</p>
                  <p className="text-xs text-[#8A9893]">{k.nota}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
              <section className="rounded-2xl border border-[#E3E9E6] p-4 lg:col-span-3">
                <p className="font-semibold">Proyección a los 65</p>
                <p className="mb-3 text-xs text-[#8A9893]">
                  Ilustrativa, con {n.tasa * 100}% de rentabilidad real anual supuesta
                </p>
                <Grafico aporte={n.aporteMensual} tasa={n.tasa} />
              </section>

              <section className="rounded-2xl border border-[#E3E9E6] p-4 lg:col-span-2">
                <p className="font-semibold">Movimientos</p>
                <p className="mb-2 text-xs text-[#8A9893]">Los registrados por WhatsApp aparecen aquí al instante</p>
                <ul className="divide-y divide-[#EEF2F0]">
                  {n.movimientos.slice(0, 7).map((m) => (
                    <li key={m.id} className="flex items-center gap-3 py-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F6F8F7]">{ICONO[m.tipo]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.texto}</p>
                        <p className="text-xs text-[#8A9893]">
                          {m.fecha}
                          {m.nuevo && (
                            <span className="ml-2 rounded bg-[#FFF1D6] px-1.5 py-0.5 text-[10px] font-semibold text-[#A8670A]">
                              Nuevo · WhatsApp
                            </span>
                          )}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          m.tipo === "gasto" ? "text-[#B42318]" : m.tipo === "aporte" ? "text-[#0B5E4E]" : ""
                        }`}
                      >
                        {m.tipo === "gasto" ? "−" : "+"}
                        {soles(m.monto)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="flex items-center gap-4 rounded-2xl bg-[#FFF8EA] p-4">
              <span className="text-4xl">👴</span>
              <p className="text-sm text-[#5C3A04]">
                <b>Don Futuro:</b> «¿Qué decisiones estás tomando hoy para que yo pueda vivir con tranquilidad mañana?»
              </p>
            </section>
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={volver}
        className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-full bg-[#13201C] px-5 text-sm font-semibold text-white"
      >
        📱 Volver al celular
      </button>
    </div>
  );
}
