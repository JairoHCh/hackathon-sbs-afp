"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, X } from "lucide-react";
import lecciones from "@/data/lecciones.json";
import { Avatar, cuerpo, Kapicoin, personaje, tono, type IdPersonaje } from "@/components/comunes";
import { useNido, type Tab } from "@/components/estado";

type Paso = {
  titulo: string;
  texto?: string;
  nota?: string;
  boton?: string;
  equipo?: boolean;
  pose?: string;
  pregunta?: string;
  opciones?: string[];
  correcta?: number;
  bien?: string;
  mal?: string;
};
type Guion = { cta: { texto: string; ir: string }; pasos: Paso[]; poseFinal?: string };

const GUIONES = lecciones as unknown as Record<IdPersonaje, Guion>;
const EQUIPO: IdPersonaje[] = ["kapifin", "porky", "sabiondo", "monedina"];

// Pantalla completa en la que un personaje explica su tema paso a paso.
export function Leccion({ id, irA }: { id: IdPersonaje; irA: (t: Tab) => void }) {
  const n = useNido();
  const { cta, pasos, poseFinal } = GUIONES[id];
  const p = personaje(id);
  const t = tono(id);
  const [paso, setPaso] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [misionNueva, setMisionNueva] = useState(false);

  const fin = paso >= pasos.length;
  const actual = pasos[paso];
  const ilustracion = cuerpo(id, fin ? poseFinal : actual.pose);
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
            key={ilustracion.src + paso}
            src={ilustracion.src}
            alt={p.nombre}
            width={ilustracion.ancho}
            height={ilustracion.alto}
            priority
            className="animar-mascota desvanecer-bordes h-full max-h-[360px] w-auto self-end object-contain mix-blend-multiply"
          />
        </div>
      </div>

      {/* Guion */}
      <div key={paso} className="animar-subida mx-3 mb-3 max-h-[68%] overflow-y-auto rounded-[28px] bg-white p-5 shadow-suave">
        {fin ? (
          <div className="text-center">
            <span className={`mx-auto grid size-14 place-items-center rounded-full ${t.solido}`}>
              <Check className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">¡Lección completada!</h2>
            <p className="mt-1 text-sm text-suave">
              Completaste «{p.tema}» con {p.nombre}.
            </p>
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
            {actual.equipo && (
              <div className="animar-subida mt-3 grid grid-cols-4 gap-1">
                {EQUIPO.map((x) => (
                  <span key={x} className="flex flex-col items-center gap-1">
                    <Avatar id={x} tam={44} className="shadow-suave" />
                    <span className="text-center text-[10.5px] font-semibold leading-tight">{personaje(x).nombre}</span>
                  </span>
                ))}
              </div>
            )}
            {actual.texto && <Palabras texto={actual.texto} />}
            {actual.nota && (
              <div className={`mt-3 flex gap-2.5 rounded-2xl px-3 py-2.5 ${t.fondo}`}>
                <Avatar id={id} tam={26} className="mt-0.5" />
                <Palabras texto={actual.nota} retraso={120 + (actual.texto?.split(" ").length ?? 0) * 35} compacto />
              </div>
            )}

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
                className={`flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 text-[15px] font-semibold leading-tight transition active:scale-[0.99] disabled:opacity-40 ${t.solido}`}
              >
                {esPregunta && respuesta === null
                  ? "Elige una respuesta"
                  : (actual.boton ?? (paso === pasos.length - 1 ? "Terminar" : "Siguiente"))}
                {!(esPregunta && respuesta === null) && <ArrowRight className="size-4 shrink-0" aria-hidden="true" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Muestra el texto palabra por palabra, como si el personaje lo estuviera diciendo.
function Palabras({
  texto,
  fuerte = false,
  compacto = false,
  retraso = 120,
}: {
  texto: string;
  fuerte?: boolean;
  compacto?: boolean;
  retraso?: number;
}) {
  return (
    <p
      className={
        compacto
          ? "text-[14px] leading-snug text-tinta/90"
          : `mt-2 text-[15px] leading-relaxed ${fuerte ? "font-semibold text-tinta" : "text-tinta/85"}`
      }
    >
      {texto.split(" ").map((palabra, i) => (
        <span key={i} className="animar-palabra" style={{ animationDelay: `${retraso + i * 35}ms` }}>
          {palabra}{" "}
        </span>
      ))}
    </p>
  );
}
