"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import datos from "@/data/datos.json";
import { soles } from "@/lib/finanzas";
import { cuerpo, ICONOS, Kapicoin } from "@/components/comunes";
import { misionesPorReclamar, useNido, valorMetrica } from "@/components/estado";

type Mision = (typeof datos.misiones)[number];

export function Misiones() {
  const n = useNido();
  const [vista, setVista] = useState<"misiones" | "tienda">("misiones");

  return (
    <div className="space-y-4 px-5 pb-6 pt-3">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Misiones</h1>
        <span className="flex h-11 items-center gap-2 rounded-full bg-white pl-1.5 pr-4 shadow-suave">
          <Kapicoin tam={30} />
          <span className="text-lg font-bold tabular-nums">{n.kapicoins}</span>
        </span>
      </header>

      <PortadaKapifin />

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-suave" role="tablist">
        {(["misiones", "tienda"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => setVista(v)}
            className={`h-10 rounded-xl text-sm font-semibold transition ${
              vista === v ? "bg-kapifin text-kapifin-900" : "text-suave"
            }`}
          >
            {v === "misiones" ? "Mis misiones" : "Tienda"}
          </button>
        ))}
      </div>

      {vista === "misiones" ? (
        <>
          <Grupo titulo="Diarias" nota="Se renuevan a medianoche" lista={datos.misiones.filter((m) => m.tipo === "diaria")} />
          <Grupo titulo="Semanales" nota="Se renuevan el lunes" lista={datos.misiones.filter((m) => m.tipo === "semanal")} />
        </>
      ) : (
        <Tienda />
      )}
    </div>
  );
}

// Kapifin cambia de pose según tu avance: sorprendido si hay premios, feliz si vas al día.
function PortadaKapifin() {
  const n = useNido();
  const porReclamar = misionesPorReclamar(n.misiones);
  const pendientes = Object.values(n.misiones).filter((e) => e === "pendiente").length;
  const { pose, titulo, texto } =
    porReclamar > 0
      ? { pose: "sorprendido", titulo: "¡Tienes premios!", texto: `${porReclamar} ${porReclamar === 1 ? "misión lista" : "misiones listas"} para reclamar.` }
      : pendientes === 0
        ? { pose: "feliz", titulo: "¡Vas al día!", texto: "Completaste todas tus misiones. ¡Las metas también se celebran!" }
        : { pose: "seguro", titulo: "Organiza hoy, logra mañana", texto: "Cumple misiones, gana Kapicoins y canjéalas en la tienda." };
  const img = cuerpo("kapifin", pose);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-kapifin-50 shadow-suave">
      <div className="flex items-end">
        <div className="min-w-0 flex-1 p-4 pr-0">
          <p className="font-display text-lg font-semibold leading-tight text-kapifin-900">{titulo}</p>
          <p className="mt-1 text-[13px] leading-snug text-kapifin-900/80">{texto}</p>
          <button
            type="button"
            onClick={() => n.abrirLeccion("kapifin")}
            className="mt-3 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-kapifin-900 shadow-suave"
          >
            ¿Cómo me organizo?
          </button>
        </div>
        <Image
          key={pose}
          src={img.src}
          alt={`Kapifin ${pose}`}
          width={img.ancho}
          height={img.alto}
          className="animar-mascota desvanecer-bordes h-[150px] w-auto shrink-0 object-contain mix-blend-multiply"
        />
      </div>
    </section>
  );
}

function Grupo({ titulo, nota, lista }: { titulo: string; nota: string; lista: Mision[] }) {
  const n = useNido();
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <p className="font-display text-lg font-semibold">{titulo}</p>
        <p className="text-xs text-tenue">{nota}</p>
      </div>
      <ul className="space-y-2">
        {lista.map((m) => {
          const estado = n.misiones[m.id];
          const Icono = ICONOS[m.icono] ?? ICONOS.meta;
          return (
            <li
              key={m.id}
              className={`flex items-center gap-3 rounded-3xl bg-white p-3 shadow-suave transition ${
                estado === "reclamada" ? "opacity-60" : ""
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                  estado === "reclamada" ? "bg-marca-50 text-marca" : "bg-kapifin-50 text-kapifin-900"
                }`}
              >
                {estado === "reclamada" ? <Check className="size-5" aria-hidden="true" /> : <Icono className="size-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight">{m.titulo}</p>
                <p className="mt-0.5 text-xs text-suave">{m.detalle}</p>
                {estado === "pendiente" && <Progreso mision={m} />}
              </div>
              {estado === "lista" ? (
                <button
                  type="button"
                  onClick={() => n.reclamar(m.id)}
                  aria-label={`Reclamar ${m.recompensa} Kapicoins`}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-kapifin px-3 text-sm font-bold text-kapifin-900 shadow-suave transition active:scale-95"
                >
                  <Kapicoin tam={18} />+{m.recompensa}
                </button>
              ) : (
                <span
                  className={`flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums ${
                    estado === "reclamada" ? "text-marca" : "text-tenue"
                  }`}
                >
                  {estado === "reclamada" ? "Hecho" : <>+{m.recompensa}</>}
                  {estado !== "reclamada" && <Kapicoin tam={16} />}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Barra de avance para misiones con progreso fijo (reto) o medidas por métrica (redondeos).
function Progreso({ mision: m }: { mision: Mision }) {
  const { redondeo } = useNido();
  let actual: number;
  let meta: number;
  let etiqueta: string;
  if (m.metrica && m.objetivo !== null) {
    actual = valorMetrica(redondeo, m.metrica);
    meta = m.objetivo;
    etiqueta = m.metrica.startsWith("ahorro")
      ? `${soles(Math.min(actual, meta))} de ${soles(meta)}`
      : `${Math.min(actual, meta)}/${meta}`;
  } else if (m.progreso) {
    [actual, meta] = m.progreso;
    etiqueta = `${actual}/${meta}`;
  } else {
    return null;
  }
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-fondo">
        <div className="h-1.5 rounded-full bg-kapifin transition-all duration-500" style={{ width: `${Math.min(1, actual / meta) * 100}%` }} />
      </div>
      <span className="shrink-0 text-[11px] font-semibold tabular-nums text-suave">{etiqueta}</span>
    </div>
  );
}

function Tienda() {
  const n = useNido();
  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        {datos.tienda.map((item) => {
          const Icono = ICONOS[item.icono] ?? ICONOS.regalo;
          const canjeado = n.canjes.includes(item.id);
          const falta = item.precio - n.kapicoins;
          return (
            <article key={item.id} className="flex flex-col rounded-3xl bg-white p-4 shadow-suave">
              <span className="grid size-11 place-items-center rounded-2xl bg-kapifin-50 text-kapifin-900">
                <Icono className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-[14px] font-semibold leading-tight">{item.titulo}</p>
              <p className="mt-1 flex-1 text-xs leading-snug text-suave">{item.detalle}</p>
              <p className="mt-3 flex items-center gap-1.5 font-bold tabular-nums">
                <Kapicoin tam={18} />
                {item.precio}
              </p>
              <button
                type="button"
                disabled={canjeado || falta > 0}
                onClick={() => n.canjear(item.id)}
                className={`mt-2 flex h-10 items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold transition active:scale-95 ${
                  canjeado ? "bg-marca-50 text-marca-700" : falta > 0 ? "bg-fondo text-tenue" : "bg-marca text-white"
                }`}
              >
                {canjeado ? (
                  <>
                    <Check className="size-4" aria-hidden="true" /> Canjeado
                  </>
                ) : falta > 0 ? (
                  <>
                    <Lock className="size-3.5" aria-hidden="true" /> Te faltan {falta}
                  </>
                ) : (
                  "Canjear"
                )}
              </button>
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-tenue">
        Recompensas de ejemplo: el catálogo final está en definición.
      </p>
    </section>
  );
}
