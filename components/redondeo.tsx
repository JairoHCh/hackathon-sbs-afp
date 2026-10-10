"use client";

import { ArrowRight, ChevronLeft, Coins, Target } from "lucide-react";
import datos from "@/data/datos.json";
import { redondear, soles } from "@/lib/finanzas";
import { Personaje } from "@/components/comunes";
import { nivelMascota, useNido, type Tab } from "@/components/estado";

const TARJETA = "rounded-3xl bg-white p-4 shadow-suave";
const META_SEMANA = datos.misiones.find((m) => m.id === "s-redondeo-5")?.objetivo ?? 5;
const DESCRIPCION_BASE: Record<number, string> = {
  1: "al sol siguiente",
  2: "a los S/ 2 siguientes",
  5: "a los S/ 5 siguientes",
  10: "a los S/ 10 siguientes",
};

export function PantallaRedondeo({ irA }: { irA: (t: Tab) => void }) {
  const n = useNido();
  const r = n.redondeo;
  const ejemplo = redondear(4.5, r.base);
  const avance = Math.min(1, r.ahorroSemana / META_SEMANA);

  const simular = (texto: string, monto: number) => {
    n.registrarMov("gasto", texto, monto);
    const res = n.redondearGasto(monto, texto);
    if (res.ahorro > 0) n.avisar(`+${soles(res.ahorro)} para tu yo de 65`, "ahorro");
    else n.avisar("Monto exacto: esta vez no hubo redondeo", "ahorro");
    if (res.evoluciono) setTimeout(() => n.celebrar(nivelMascota(res.racha).nombre), 700);
  };

  return (
    <div className="space-y-4 px-5 pb-6 pt-3">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => irA("inicio")}
          aria-label="Volver al inicio"
          className="-ml-2 grid size-10 place-items-center rounded-full transition active:bg-white"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="font-display text-2xl font-semibold">Redondeo ahorrativo</h1>
      </header>

      <Personaje id="monedina" texto="Cada compra deja unos céntimos para tu futuro. ¡Ahorras sin darte cuenta!" />

      {/* Activar */}
      <section className={`${TARJETA} flex items-center gap-3`}>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-monedina-50 text-monedina-700">
          <Coins className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Redondear mis compras</p>
          <p className="text-[13px] text-suave">
            {r.activo ? `Activo · redondea ${DESCRIPCION_BASE[r.base]}` : "Desactivado"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={r.activo}
          aria-label="Redondeo ahorrativo"
          onClick={() => n.activarRedondeo(!r.activo)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${r.activo ? "bg-monedina" : "bg-borde"}`}
        >
          <span
            className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${r.activo ? "left-7" : "left-1"}`}
          />
        </button>
      </section>

      {/* Base del redondeo */}
      <section className={TARJETA}>
        <p className="font-display text-lg font-semibold">¿A cuánto redondeamos?</p>
        <p className="text-[13px] text-suave">Mientras más alto, más ahorras en cada compra.</p>
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-2xl bg-fondo p-1" role="radiogroup" aria-label="Redondear a">
          {datos.redondeo.bases.map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={r.base === b}
              onClick={() => n.setBaseRedondeo(b)}
              className={`h-11 rounded-xl text-[15px] font-bold tabular-nums transition ${
                r.base === b ? "bg-white text-monedina-700 shadow-suave" : "text-suave"
              }`}
            >
              {soles(b)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-monedina-50 px-3 py-3 text-center">
          <div>
            <p className="text-[11px] text-suave">Gastas</p>
            <p className="font-bold tabular-nums">{soles(4.5)}</p>
          </div>
          <ArrowRight className="size-4 text-monedina" aria-hidden="true" />
          <div>
            <p className="text-[11px] text-suave">Se cuenta</p>
            <p className="font-bold tabular-nums">{soles(ejemplo.contado)}</p>
          </div>
          <ArrowRight className="size-4 text-monedina" aria-hidden="true" />
          <div>
            <p className="text-[11px] text-suave">Ahorras</p>
            <p className="font-bold tabular-nums text-monedina-700">{soles(ejemplo.ahorro)}</p>
          </div>
        </div>
      </section>

      {/* Avance de la semana */}
      <section className={TARJETA}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] font-medium text-suave">Ahorrado con redondeos esta semana</p>
            <p className="text-[32px] font-bold leading-tight tracking-tight tabular-nums">{soles(r.ahorroSemana)}</p>
          </div>
          <p className="pb-1 text-xs text-tenue">{r.semana} redondeos</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-fondo">
          <div className="h-2 rounded-full bg-monedina transition-all duration-500" style={{ width: `${avance * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-suave">
          {avance >= 1
            ? `¡Meta semanal de ${soles(META_SEMANA)} cumplida! Reclama tus Kapicoins.`
            : `Te faltan ${soles(META_SEMANA - r.ahorroSemana)} para la misión semanal de ${soles(META_SEMANA)}.`}
        </p>
        <p className="mt-3 text-xs text-tenue">Total ahorrado con redondeos: {soles(r.total)}</p>
      </section>

      {/* Simulación de compras */}
      <section className={TARJETA}>
        <p className="font-display text-lg font-semibold">Simula una compra</p>
        <p className="text-[13px] text-suave">En la versión final se conecta con tu tarjeta o billetera digital.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {datos.redondeo.ejemplos.map((e) => {
            const prev = redondear(e.monto, r.base);
            return (
              <button
                key={e.texto}
                type="button"
                disabled={!r.activo}
                onClick={() => simular(e.texto, e.monto)}
                className="rounded-2xl border border-borde p-3 text-left transition active:scale-[0.97] disabled:opacity-45"
              >
                <p className="text-[13px] text-suave">{e.texto}</p>
                <p className="font-bold tabular-nums">{soles(e.monto)}</p>
                <p className="mt-1 text-xs font-semibold tabular-nums text-monedina-700">
                  {prev.ahorro > 0 ? `+${soles(prev.ahorro)} al ahorro` : "Monto exacto"}
                </p>
              </button>
            );
          })}
        </div>
        {!r.activo && <p className="mt-2 text-xs text-tenue">Activa el redondeo para probarlo.</p>}
      </section>

      {/* Historial */}
      <section className={TARJETA}>
        <p className="font-display text-lg font-semibold">Últimos redondeos</p>
        <ul className="mt-1 divide-y divide-borde">
          {r.historial.slice(0, 5).map((h) => (
            <li key={h.id} className="animar-subida flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{h.texto}</p>
                <p className="text-xs tabular-nums text-tenue">
                  {soles(h.gasto)} → {soles(h.contado)}
                </p>
              </div>
              <p className="text-sm font-bold tabular-nums text-monedina-700">+{soles(h.ahorro)}</p>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => irA("misiones")}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kapifin font-semibold text-kapifin-900 transition active:scale-[0.99]"
      >
        <Target className="size-5" aria-hidden="true" />
        Ver misiones de redondeo
      </button>
      <p className="text-[11px] leading-snug text-tenue">
        Lo redondeado va a tu ahorro previsional. Puedes pausarlo o cambiar el monto cuando quieras.
      </p>
    </div>
  );
}
