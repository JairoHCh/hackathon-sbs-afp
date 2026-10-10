"use client";

import { useState } from "react";
import { calcularRacha, ProveedorNido, useNido, type Tab } from "@/components/estado";
import { Chat, Futuro, Inicio, Proyeccion, Registro } from "@/components/pantallas";
import { VistaWeb } from "@/components/web";

const PESTANAS: { id: Tab; icono: string; texto: string }[] = [
  { id: "inicio", icono: "🏠", texto: "Inicio" },
  { id: "chat", icono: "💬", texto: "WhatsApp" },
  { id: "proyeccion", icono: "📈", texto: "Proyección" },
  { id: "futuro", icono: "👴", texto: "Mi futuro" },
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
    <div className="min-h-dvh bg-[#E4ECE8]">
      <div className="hidden items-center justify-center gap-4 pt-5 sm:flex">
        <p className="text-sm text-[#4F5F5A]">
          <b>Nido</b> · prototipo para la Hackatón de Educación Financiera 2026
        </p>
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          {(["movil", "web"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                vista === v ? "bg-[#0E7C66] text-white" : "text-[#4F5F5A]"
              }`}
            >
              {v === "movil" ? "📱 App móvil" : "💻 Versión web"}
            </button>
          ))}
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

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#F6F8F7] text-[#13201C] sm:h-[820px] sm:w-[400px] sm:rounded-[44px] sm:border-[10px] sm:border-[#13201C] sm:shadow-2xl">
      <div className="hidden h-8 shrink-0 items-center justify-between bg-inherit px-7 text-xs font-semibold sm:flex">
        <span>9:41</span>
        <span>📶 100%</span>
      </div>

      <div className="min-h-0 flex-1">
        {!n.registrado ? (
          <div className="h-full overflow-y-auto">
            <Registro />
          </div>
        ) : tab === "chat" ? (
          <Chat irA={setTab} />
        ) : (
          <div key={tab} className="h-full overflow-y-auto">
            {tab === "inicio" && <Inicio irA={setTab} />}
            {tab === "proyeccion" && <Proyeccion />}
            {tab === "futuro" && <Futuro irWeb={irWeb} />}
          </div>
        )}
      </div>

      {n.registrado && (
        <nav className="grid shrink-0 grid-cols-4 border-t border-[#E3E9E6] bg-white pb-[env(safe-area-inset-bottom)]">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-current={tab === p.id ? "page" : undefined}
              onClick={() => setTab(p.id)}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                tab === p.id ? "font-semibold text-[#0B5E4E]" : "text-[#6B7A75]"
              }`}
            >
              <span className={`text-xl ${tab === p.id ? "" : "opacity-60 grayscale"}`}>{p.icono}</span>
              {p.texto}
            </button>
          ))}
        </nav>
      )}

      {n.celebracion && (
        <div role="dialog" aria-modal="true" className="absolute inset-0 z-20 grid place-items-center bg-black/45 p-6">
          <div className="w-full rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-6xl">🐿️👑</div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#A8670A]">¡Tu ardilla evolucionó!</p>
            <p className="mt-1 text-2xl font-bold">{n.celebracion}</p>
            <p className="mt-2 text-sm text-[#56665F]">
              {calcularRacha(n.semanas)} semanas seguidas apartando algo. La constancia vale más que el monto.
            </p>
            <button
              type="button"
              onClick={() => {
                n.cerrarCelebracion();
                setTab("inicio");
              }}
              className="mt-5 h-12 w-full rounded-xl bg-[#0E7C66] font-semibold text-white"
            >
              ¡Verla en Inicio!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
