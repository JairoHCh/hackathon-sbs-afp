"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import lecciones from "@/data/lecciones.json";
import { Avatar, CUERPOS, Kapicoin, personaje, tono, type IdPersonaje } from "@/components/comunes";
import { useNido, type Tab } from "@/components/estado";

type Paso = {
  titulo: string;
  texto?: string;
  pregunta?: string;
  opciones?: string[];
  correcta?: number;
  bien?: string;
  mal?: string;
};
type Guion = { cta: { texto: string; ir: string }; pasos: Paso[] };

const GUIONES = lecciones as unknown as Record<IdPersonaje, Guion>;

// Pantalla completa en la que un personaje explica su tema paso a paso.
export function Leccion({ id, irA }: { id: IdPersonaje; irA: (t: Tab) => void }) {
  const n = useNido();
  const { cta, pasos } = GUIONES[id];
  const p = personaje(id);
  const t = tono(id);
  const cuerpo = CUERPOS[id];
  const [paso, setPaso] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [misionNueva, setMisionNueva] = useState(false);

  const fin = paso >= pasos.length;
  const actual = pasos[paso];
  const esPregunta = !fin && actual.pregunta !== undefined;
  const cerrar = n.cerrarLeccion;

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cerrar]);

  const avanzar = () => {
    if (paso === pasos.length - 1) {
      setMisionNueva(n.misiones["d-leccion"] === "pendiente");
      n.terminarLeccion(id);
    }
    setPaso(paso + 1);
    setRespuesta(null);
  };

  const retroceder = () => {
    if (paso === 0) return;
    setPaso(paso - 1);
    setRespuesta(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${p.nombre} te explica: ${p.tema}`}
      className={`animar-aparecer absolute inset-0 z-40 flex flex-col ${t.fondo}`}
    >
      {/* Progreso tipo historias */}
      <div className="flex gap-1.5 px-4 pt-4" aria-hidden="true">
        {pasos.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-tinta/10">
            <span
              className={`block h-full rounded-full transition-all duration-500 ${t.solido}`}
              style={{ width: i <= paso ? "100%" : "0%" }}
            />
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2.5">
          <Avatar id={id} tam={38} />
          <div>
            <p className={`font-display text-[16px] font-semibold leading-tight ${t.texto}`}>{p.nombre}</p>
            <p className="text-xs text-suave">Te explica: {p.tema}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="grid size-10 place-items-center rounded-full bg-white text-tinta shadow-suave transition active:scale-95"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mascota */}
      <div className="relative min-h-0 flex-1">
        <span className="absolute bottom-2 left-1/2 h-10 w-48 -translate-x-1/2 rounded-[50%] bg-tinta/10 blur-md" />
        <div className="flotar absolute inset-x-0 bottom-4 top-2 flex justify-center">
          <Image
            key={paso}
            src={`/personajes/${id}.webp`}
            alt={p.nombre}
            width={cuerpo.ancho}
            height={cuerpo.alto}
            priority
            className="animar-mascota desvanecer-bordes h-full max-h-[360px] w-auto self-end object-contain mix-blend-multiply"
          />
        </div>
      </div>

      {/* Guion */}
      <div key={paso} className="animar-subida mx-3 mb-3 rounded-[28px] bg-white p-5 shadow-suave">
        {fin ? (
          <div className="text-center">
            <span className={`mx-auto grid size-14 place-items-center rounded-full ${t.solido}`}>
              <Check className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">¡Lección completada!</h2>
            <p className="mt-1 text-sm text-suave">Ya sabes más sobre {p.tema.toLowerCase()}.</p>
            {misionNueva && (
              <p className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-kapifin-50 px-3 py-1.5 text-sm font-semibold text-kapifin-900">
                <Kapicoin tam={18} /> Misión cumplida: reclama +10 en Misiones
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={cerrar}
                className="h-12 flex-1 rounded-2xl bg-fondo font-semibold text-suave transition active:scale-[0.99]"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => irA(cta.ir as Tab)}
                className={`h-12 flex-[1.4] rounded-2xl font-semibold transition active:scale-[0.99] ${t.solido}`}
              >
                {cta.texto}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wider text-tenue">
              {esPregunta ? "Mini reto" : `Paso ${paso + 1} de ${pasos.length}`}
            </p>
            <h2 className={`mt-1 font-display text-[22px] font-semibold leading-tight ${t.texto}`}>{actual.titulo}</h2>
            {actual.texto && <Palabras texto={actual.texto} />}

            {esPregunta && (
              <>
                <Palabras texto={actual.pregunta ?? ""} fuerte />
                <div className="mt-3 space-y-2">
                  {actual.opciones?.map((o, i) => {
                    const respondida = respuesta !== null;
                    const correcta = i === actual.correcta;
                    const estilo = !respondida
                      ? "border-borde bg-white"
                      : correcta
                        ? "border-marca bg-marca-50 text-marca-700"
                        : i === respuesta
                          ? "border-peligro bg-red-50 text-peligro"
                          : "border-borde bg-white opacity-50";
                    return (
                      <button
                        key={o}
                        type="button"
                        disabled={respondida}
                        onClick={() => setRespuesta(i)}
                        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-2 text-left text-[14px] font-semibold transition ${estilo}`}
                      >
                        {o}
                        {respondida && correcta && <Check className="size-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                {respuesta !== null && (
                  <p
                    role="status"
                    className={`animar-subida mt-3 rounded-2xl px-3 py-2.5 text-[13px] leading-snug ${
                      respuesta === actual.correcta ? "bg-marca-50 text-marca-700" : "bg-red-50 text-peligro"
                    }`}
                  >
                    {respuesta === actual.correcta ? actual.bien : actual.mal}
                  </p>
                )}
              </>
            )}

            <div className="mt-4 flex gap-2">
              {paso > 0 && (
                <button
                  type="button"
                  onClick={retroceder}
                  className="h-12 rounded-2xl bg-fondo px-5 font-semibold text-suave transition active:scale-[0.99]"
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                disabled={esPregunta && respuesta === null}
                onClick={avanzar}
                className={`h-12 flex-1 rounded-2xl font-semibold transition active:scale-[0.99] disabled:opacity-40 ${t.solido}`}
              >
                {esPregunta && respuesta === null ? "Elige una respuesta" : paso === pasos.length - 1 ? "Terminar" : "Siguiente"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Muestra el texto palabra por palabra, como si el personaje lo estuviera diciendo.
function Palabras({ texto, fuerte = false }: { texto: string; fuerte?: boolean }) {
  return (
    <p className={`mt-2 text-[15px] leading-relaxed ${fuerte ? "font-semibold text-tinta" : "text-tinta/85"}`}>
      {texto.split(" ").map((palabra, i) => (
        <span key={i} className="animar-palabra" style={{ animationDelay: `${120 + i * 35}ms` }}>
          {palabra}{" "}
        </span>
      ))}
    </p>
  );
}
