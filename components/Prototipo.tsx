"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Flag,
  House,
  Laptop,
  MessageCircle,
  PiggyBank,
  Smartphone,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Kapicoin, Logo } from "@/components/comunes";
import { calcularRacha, misionesPorReclamar, ProveedorNido, useNido, type Tab } from "@/components/estado";
import { Leccion } from "@/components/leccion";
import { Misiones } from "@/components/misiones";
import { Chat, Futuro, Inicio, Proyeccion, Registro } from "@/components/pantallas";
import { PantallaRedondeo } from "@/components/redondeo";
import { VistaWeb } from "@/components/web";

const PESTANAS: { id: Tab; icono: LucideIcon; texto: string }[] = [
  { id: "inicio", icono: House, texto: "Inicio" },
  { id: "chat", icono: MessageCircle, texto: "WhatsApp" },
  { id: "misiones", icono: Target, texto: "Misiones" },
  { id: "proyeccion", icono: TrendingUp, texto: "Proyección" },
  { id: "futuro", icono: Flag, texto: "Jubilación" },
];

export default function Prototipo() {
  return (
    <ProveedorNido>
      <Contenido />
    </ProveedorNido>
  );
}

function Contenido() {
  const [vista, setVista] = useState<"movil" | "web">("movil");

  return (
    <div className="min-h-dvh bg-lienzo">
      <div className="hidden items-center justify-center gap-4 pt-5 sm:flex">
        <p className="flex items-center gap-2 text-sm text-suave">
          <Logo tam={28} />
          <span>
            <b className="font-display text-base text-marca-700">Nido</b> · prototipo para la Hackatón de Educación
            Financiera 2026
          </span>
        </p>
        <div className="flex rounded-full bg-white p-1 shadow-suave">
          {(["movil", "web"] as const).map((v) => {
            const Icono = v === "movil" ? Smartphone : Laptop;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={vista === v}
                onClick={() => setVista(v)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  vista === v ? "bg-marca text-white" : "text-suave"
                }`}
              >
                <Icono className="size-4" aria-hidden="true" />
                {v === "movil" ? "App móvil" : "Versión web"}
              </button>
            );
          })}
        </div>
      </div>

      {vista === "movil" ? (
        <div className="flex justify-center sm:py-5">
          <Telefono irWeb={() => setVista("web")} />
        </div>
      ) : (
        <VistaWeb volver={() => setVista("movil")} />
      )}
    </div>
  );
}

function Telefono({ irWeb }: { irWeb: () => void }) {
  const n = useNido();
  const [tab, setTab] = useState<Tab>("inicio");
  const porReclamar = misionesPorReclamar(n.misiones);

  const irA = (t: Tab) => {
    setTab(t);
    if (t === "proyeccion") n.cumplirMision("proyeccion");
  };

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-fondo text-tinta sm:h-[820px] sm:w-[400px] sm:rounded-[44px] sm:border-[10px] sm:border-tinta sm:shadow-2xl">
      <div className="hidden h-8 shrink-0 items-center justify-between px-7 text-xs font-semibold sm:flex">
        <span>9:41</span>
        <span className="tabular-nums">100%</span>
      </div>

      <div className="min-h-0 flex-1">
        {!n.registrado ? (
          <div className="h-full overflow-y-auto">
            <Registro />
          </div>
        ) : tab === "chat" ? (
          <Chat irA={irA} />
        ) : (
          <div key={tab} className="animar-subida h-full overflow-y-auto">
            {tab === "inicio" && <Inicio irA={irA} />}
            {tab === "misiones" && <Misiones />}
            {tab === "proyeccion" && <Proyeccion />}
            {tab === "futuro" && <Futuro irWeb={irWeb} />}
            {tab === "redondeo" && <PantallaRedondeo irA={irA} />}
          </div>
        )}
      </div>

      {n.registrado && (
        <nav className="grid shrink-0 grid-cols-5 border-t border-borde bg-white px-1 pb-[env(safe-area-inset-bottom)]">
          {PESTANAS.map((p) => {
            const activa = tab === p.id || (tab === "redondeo" && p.id === "inicio");
            return (
              <button
                key={p.id}
                type="button"
                aria-current={activa ? "page" : undefined}
                onClick={() => irA(p.id)}
                className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] ${
                  activa ? "font-bold text-marca-700" : "font-medium text-tenue"
                }`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${activa ? "bg-marca-50" : ""}`}>
                  <p.icono className="size-[19px]" strokeWidth={activa ? 2.4 : 2} aria-hidden="true" />
                </span>
                {p.texto}
                {p.id === "misiones" && porReclamar > 0 && (
                  <span className="absolute right-2.5 top-1.5 grid size-4 place-items-center rounded-full bg-peligro text-[9px] font-bold text-white">
                    {porReclamar}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {n.leccion && (
        <Leccion
          key={n.leccion}
          id={n.leccion}
          irA={(t) => {
            n.cerrarLeccion();
            irA(t);
          }}
        />
      )}

      {n.aviso && (
        <div
          key={n.aviso.id}
          role="status"
          className="animar-subida pointer-events-none absolute inset-x-0 top-12 z-50 mx-auto flex w-fit items-center gap-2 rounded-full bg-tinta px-4 py-2.5 text-sm font-semibold text-white shadow-2xl"
        >
          {n.aviso.tipo === "ahorro" ? (
            <PiggyBank className="size-5 text-kapifin" aria-hidden="true" />
          ) : (
            <Kapicoin tam={20} />
          )}
          {n.aviso.texto}
        </div>
      )}

      {n.celebracion && (
        <div role="dialog" aria-modal="true" className="absolute inset-0 z-20 grid place-items-center bg-tinta/50 p-6">
          <div className="animar-subida w-full overflow-hidden rounded-3xl bg-white text-center shadow-2xl">
            <div className="bg-gradient-to-b from-monedina-50 to-white pt-5">
              <Image
                src="/personajes/monedina.webp"
                alt="Monedina"
                width={140}
                height={197}
                className="mx-auto h-[200px] w-[140px] object-cover object-top mix-blend-multiply"
              />
            </div>
            <div className="px-6 pb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-kapifin-900">¡Monedina subió de nivel!</p>
              <p className="mt-1 font-display text-2xl font-semibold">{n.celebracion}</p>
              <p className="mt-2 text-sm text-suave">
                {calcularRacha(n.semanas)} semanas seguidas apartando algo. La constancia vale más que el monto.
              </p>
              <button
                type="button"
                onClick={() => {
                  n.cerrarCelebracion();
                  setTab("misiones");
                }}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kapifin font-bold text-kapifin-900 transition active:scale-[0.99]"
              >
                <Kapicoin tam={22} />
                Reclamar mis Kapicoins
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
