"use client";

import { useEffect, useRef, useState } from "react";
import datos from "@/data/datos.json";
import { proyectar, round2, soles, TASAS } from "@/lib/finanzas";
import { GoogleG, Grafico, Personaje } from "@/components/comunes";
import {
  calcularRacha,
  nivelMascota,
  NIVELES,
  SUGERENCIAS,
  useNido,
  type Chip,
  type Tab,
} from "@/components/estado";

const TEXTO_SUAVE = "text-[#56665F]";
const TARJETA = "rounded-2xl border border-[#E3E9E6] bg-white p-4";

/* ───────────────────────── 1. Registro ───────────────────────── */

export function Registro() {
  const { registrar } = useNido();
  const [google, setGoogle] = useState(false);
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [tipo, setTipo] = useState<"fijo" | "variable">("variable");
  const [acepta, setAcepta] = useState(false);
  const listo = nombre.trim().length > 0 && acepta;

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pb-6 pt-10">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-[#FFF1D6] text-5xl">🐿️</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{datos.app.nombre}</h1>
        <p className={`mt-1 text-[15px] ${TEXTO_SUAVE}`}>{datos.app.lema}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setGoogle(true);
          setNombre(datos.usuario.nombre);
        }}
        className="mt-8 flex h-12 items-center justify-center gap-3 rounded-xl border border-[#D5DDD9] bg-white text-[15px] font-medium shadow-sm active:bg-[#F6F8F7]"
      >
        <GoogleG />
        {google ? datos.usuario.correo : "Continuar con Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-[#8A9893]">
        <span className="h-px flex-1 bg-[#E3E9E6]" />
        {google ? "Completa lo que falta" : "o completa tus datos"}
        <span className="h-px flex-1 bg-[#E3E9E6]" />
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="¿Cómo te llamas?"
            className="mt-1 h-11 w-full rounded-xl border border-[#D5DDD9] px-3 text-[15px] outline-none focus:border-[#0E7C66]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Celular (para tu asistente de WhatsApp)</span>
          <input
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            inputMode="tel"
            placeholder="999 000 000"
            className="mt-1 h-11 w-full rounded-xl border border-[#D5DDD9] px-3 text-[15px] outline-none focus:border-[#0E7C66]"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">¿Cómo son tus ingresos?</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["fijo", "variable"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tipo === t}
                onClick={() => setTipo(t)}
                className={`h-11 rounded-xl border text-[15px] font-medium ${
                  tipo === t ? "border-[#0E7C66] bg-[#E6F4EF] text-[#0B5E4E]" : "border-[#D5DDD9]"
                }`}
              >
                {t === "fijo" ? "Fijos cada mes" : "Cambian cada mes"}
              </button>
            ))}
          </div>
          {tipo === "variable" && (
            <p className="mt-2 rounded-lg bg-[#FFF8EA] px-3 py-2 text-[13px] text-[#7A4B05]">
              Perfecto: no te pediremos un monto fijo. Apartas lo que puedas, cuando puedas.
            </p>
          )}
        </fieldset>
        <label className="flex items-start gap-2 pt-1 text-[13px] text-[#4F5F5A]">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-0.5 size-4 accent-[#0E7C66]"
          />
          Acepto el tratamiento de mis datos personales (Ley N.° 29733).
        </label>
      </div>

      <button
        type="button"
        disabled={!listo}
        onClick={() => registrar(nombre)}
        className="mt-6 h-12 rounded-xl bg-[#0E7C66] text-[15px] font-semibold text-white disabled:bg-[#B9C7C2]"
      >
        Empezar a ahorrar
      </button>
      <p className="mt-3 text-center text-[11px] text-[#8A9893]">
        Prototipo: el acceso con Google y WhatsApp están simulados. Datos ficticios.
      </p>
    </div>
  );
}

/* ───────────────────────── 2. Inicio ───────────────────────── */

export function Inicio({ irA }: { irA: (t: Tab) => void }) {
  const n = useNido();
  const racha = calcularRacha(n.semanas);
  const nivel = nivelMascota(racha);
  const siguiente = NIVELES.find((x) => x.desde > racha);
  const semanaLista = n.semanas[n.semanas.length - 1];
  const [dato, setDato] = useState(0);
  const d = datos.datosDelDia[dato % datos.datosDelDia.length];
  const { reto, beneficio } = datos;

  return (
    <div className="space-y-4 px-5 pb-6 pt-4">
      <header className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${TEXTO_SUAVE}`}>Hola, {n.nombre} 👋</p>
          <h1 className="text-xl font-bold tracking-tight">Tu nido de ahorro</h1>
        </div>
        <span className="rounded-full bg-[#E6F4EF] px-3 py-1 text-xs font-medium text-[#0B5E4E]">
          Ingreso variable
        </span>
      </header>

      {/* Widget de racha y mascota */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0E7C66] to-[#0A5446] p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div
            className={`relative grid size-20 shrink-0 place-items-center rounded-full bg-white/15 transition ${
              nivel.nivel === 3 ? "ring-4 ring-[#F5A524]" : ""
            }`}
          >
            <span className={nivel.nivel === 1 ? "text-4xl" : "text-5xl"}>{nivel.emoji}</span>
            {nivel.nivel === 3 && <span className="absolute -right-1 -top-2 text-xl">👑</span>}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
              Nivel {nivel.nivel} · {nivel.nombre}
            </p>
            <p className="mt-0.5 whitespace-nowrap text-[26px] font-bold leading-tight">🔥 {racha} semanas</p>
            <p className="text-sm text-white/80">seguidas apartando algo</p>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          {n.semanas.map((s, i) => {
            const actual = i === n.semanas.length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                    s
                      ? "bg-[#F5A524] text-[#3B2600]"
                      : actual
                        ? "border-2 border-dashed border-white/60"
                        : "bg-white/15"
                  }`}
                >
                  {s ? "✓" : ""}
                </span>
                <span className="text-[10px] text-white/70">{actual ? "Esta" : `S${i + 1}`}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[13px]">
          {semanaLista
            ? "✅ Semana asegurada. ¡La constancia vale más que el monto!"
            : "Aparta aunque sea S/ 1 antes del domingo y tu racha sigue viva."}
        </p>
        {siguiente && (
          <p className="mt-2 text-xs text-white/70">
            Te {siguiente.desde - racha === 1 ? "falta 1 semana" : `faltan ${siguiente.desde - racha} semanas`} para
            ser {siguiente.nombre}.
          </p>
        )}
      </section>

      {/* Dinero ahorrado */}
      <section>
        <p className={`text-sm ${TEXTO_SUAVE}`}>Llevas ahorrado</p>
        <p className="text-4xl font-bold tracking-tight">{soles(n.saldoPrev + n.saldoEmer)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className={TARJETA}>
            <p className="text-xl">🛡️</p>
            <p className={`mt-1 text-xs ${TEXTO_SUAVE}`}>Para tu yo de 65</p>
            <p className="text-lg font-bold">{soles(n.saldoPrev)}</p>
            <p className="text-[11px] text-[#8A9893]">Ahorro previsional</p>
          </div>
          <div className={TARJETA}>
            <p className="text-xl">☂️</p>
            <p className={`mt-1 text-xs ${TEXTO_SUAVE}`}>Emergencias</p>
            <p className="text-lg font-bold">{soles(n.saldoEmer)}</p>
            <p className="text-[11px] text-[#8A9893]">Disponible cuando lo necesites</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => irA("chat")}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0E7C66] text-[15px] font-semibold text-white"
        >
          💬 Registrar un ingreso por WhatsApp
        </button>
      </section>

      {/* Reto */}
      <section className={TARJETA}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A8670A]">Reto de la semana</p>
            <p className="font-semibold">{reto.titulo}</p>
            <p className={`text-sm ${TEXTO_SUAVE}`}>{reto.detalle}</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#EEF2F0]">
          <div className="h-2 rounded-full bg-[#F5A524]" style={{ width: `${(reto.progreso / reto.meta) * 100}%` }} />
        </div>
        <p className={`mt-1.5 text-xs ${TEXTO_SUAVE}`}>
          {reto.progreso} de {reto.meta} días · ahorro estimado {soles(reto.ahorroEstimado)}
        </p>
      </section>

      <Equipo />

      {/* Dato del día */}
      <section className="rounded-2xl bg-[#FFF8EA] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A8670A]">💡 Dato del día</p>
        <p className="mt-1 text-[15px] font-medium leading-snug">{d.texto}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#8A6A33]">{d.fuente}</p>
          <button type="button" onClick={() => setDato(dato + 1)} className="shrink-0 text-sm font-semibold text-[#0E7C66]">
            Otro dato →
          </button>
        </div>
      </section>

      {/* Beneficio */}
      <section className={TARJETA}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎁</span>
          <div className="flex-1">
            <p className="font-semibold">Beneficio por constancia</p>
            <p className={`text-sm ${TEXTO_SUAVE}`}>
              Llega a {beneficio.semanasMeta} semanas de racha y desbloquea {beneficio.detalle} en {beneficio.marca}.
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#EEF2F0]">
          <div
            className="h-2 rounded-full bg-[#0E7C66]"
            style={{ width: `${Math.min(1, racha / beneficio.semanasMeta) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[#8A9893]">
          {racha} de {beneficio.semanasMeta} semanas · marca ilustrativa para el prototipo
        </p>
      </section>
    </div>
  );
}

function Equipo() {
  const [sel, setSel] = useState(0);
  const [idx, setIdx] = useState(0);
  const p = datos.personajes[sel];

  return (
    <section className={TARJETA}>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Tu equipo</p>
        <p className="text-xs text-[#8A9893]">Toca para un consejo</p>
      </div>
      <div className="mt-3 flex gap-2">
        {datos.personajes.map((x, i) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={i === sel}
            onClick={() => {
              if (i === sel) setIdx(idx + 1);
              else {
                setSel(i);
                setIdx(0);
              }
            }}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-2 ${
              i === sel ? "border-[#0E7C66] bg-[#E6F4EF]" : "border-[#E3E9E6]"
            }`}
          >
            <span className="text-3xl">{x.emoji}</span>
            <span className="text-center text-[11px] font-medium leading-tight">{x.corto}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-[#F6F8F7] p-3">
        <p className="text-sm font-semibold">
          {p.nombre} <span className={`font-normal ${TEXTO_SUAVE}`}>· {p.rol}</span>
        </p>
        <p className="mt-1 text-sm italic">«{p.frase}»</p>
        <p className="mt-2 text-sm">💡 {p.consejos[idx % p.consejos.length]}</p>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. WhatsApp (simulado) ───────────────────────── */

type Respuesta = { texto: string; chips?: Chip[] };

export function Chat({ irA }: { irA: (t: Tab) => void }) {
  const n = useNido();
  const [texto, setTexto] = useState("");
  const finRef = useRef<HTMLDivElement>(null);
  const ultimo = n.chat[n.chat.length - 1];

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [n.chat.length, n.escribiendo]);

  const responderLuego = (r: Respuesta, despues?: () => void) => {
    n.setEscribiendo(true);
    setTimeout(() => {
      n.setEscribiendo(false);
      n.agregarMsg("bot", r.texto, r.chips);
      if (despues) setTimeout(despues, 900);
    }, 800);
  };

  const procesar = (t: string): Respuesta => {
    if (/afp|pensi|jubil|onp/i.test(t) && !/\d/.test(t)) {
      return {
        texto:
          "🛡️ Una AFP administra tu fondo de pensiones: lo que aportas se invierte y crece durante años para darte una pensión en tu vejez.\n\nSi trabajas por tu cuenta, también puedes afiliarte y aportar de forma voluntaria, a tu ritmo.",
        chips: [{ etiqueta: "¿Cuánto tendría a los 65?", ir: "proyeccion" }, ...SUGERENCIAS.slice(0, 2)],
      };
    }
    const m = t.replace(",", ".").match(/\d+(\.\d+)?/);
    if (!m) {
      return {
        texto: "No encontré un monto 🤔 Prueba con algo como «Hoy recibí 350 soles» o «Gasté 6 en desayuno».",
        chips: SUGERENCIAS,
      };
    }
    const monto = parseFloat(m[0]);

    if (/gast|pagu|compr/i.test(t)) {
      n.registrarMov("gasto", t, monto);
      const redondeo = round2(Math.ceil(monto) - monto);
      const apartar = redondeo > 0 ? redondeo : datos.regla.minimo;
      let r =
        redondeo > 0
          ? `Anotado: gasto de ${soles(monto)}. Si lo redondeamos a ${soles(Math.ceil(monto))}, apartas ${soles(apartar)} para tu yo de 65.`
          : `Anotado: gasto de ${soles(monto)}. ¿Apartamos ${soles(apartar)} para tu yo de 65? Es poquito y suma.`;
      if (/desayun/i.test(t) && monto > 3) {
        r += `\n\n🎯 Tu reto: bajar el desayuno a S/ 3. Hoy te habrías ahorrado ${soles(monto - 3)}.`;
      }
      return {
        texto: r,
        chips: [
          { etiqueta: `Sí, aparta ${soles(apartar)}`, aporte: { prev: apartar, emer: 0, motivo: "Redondeo de gasto" } },
          { etiqueta: "Ahora no", rechazo: true },
        ],
      };
    }

    n.registrarMov("ingreso", t, monto);
    const total = Math.max(datos.regla.minimo, round2(monto * datos.regla.porcentaje));
    const emer = Math.round(total * datos.regla.parteEmergencia);
    const prev = round2(total - emer);
    return {
      texto: `¡Bien, ${n.nombre}! Anoté un ingreso de ${soles(monto)} 💸\n\nComo tu ingreso cambia cada mes, no te pido un monto fijo. Te sugiero apartar el 10% → ${soles(total)}:\n• ${soles(emer)} para tu fondo de emergencia\n• ${soles(prev)} para tu ahorro previsional\n\n¿Lo apartamos?`,
      chips: [
        { etiqueta: `Sí, aparta ${soles(total)}`, aporte: { prev, emer, motivo: "Aporte desde WhatsApp" } },
        { etiqueta: "Solo el mínimo (S/ 1)", aporte: { prev: 1, emer: 0, motivo: "Aporte mínimo" } },
        { etiqueta: "Esta vez no", rechazo: true },
      ],
    };
  };

  const enviar = (t: string) => {
    const limpio = t.trim();
    if (!limpio || n.escribiendo) return;
    n.agregarMsg("juan", limpio);
    setTexto("");
    responderLuego(procesar(limpio));
  };

  const tocarChip = (c: Chip) => {
    if (c.ir) return irA(c.ir);
    if (c.enviar) return enviar(c.enviar);
    n.agregarMsg("juan", c.etiqueta);
    if (c.aporte) {
      const { prev, emer, motivo } = c.aporte;
      const r = n.aportar(prev, emer, motivo);
      responderLuego(
        {
          texto:
            `✅ ¡Listo! Aparté ${soles(prev)} para tu yo de 65${emer > 0 ? ` y ${soles(emer)} para emergencias` : ""}.` +
            (r.subioRacha
              ? `\n\n🔥 Semana asegurada: tu racha sube a ${r.racha} semanas.`
              : "\n\n🔥 Tu semana ya estaba asegurada. ¡Esto suma igual!") +
            (r.evoluciono ? "\n\n🐿️ ¡Tu ardilla evolucionó! Mírala en Inicio." : ""),
          chips: [
            { etiqueta: "Ver mi ardilla", ir: "inicio" },
            { etiqueta: "¿Cuánto tendré a los 65?", ir: "proyeccion" },
          ],
        },
        r.evoluciono ? () => n.celebrar(nivelMascota(r.racha).nombre) : undefined,
      );
    } else {
      const semanaLista = n.semanas[n.semanas.length - 1];
      responderLuego({
        texto: semanaLista
          ? "Sin problema 🙂 Esta semana ya la tienes asegurada."
          : "Tranquilo 🙂 Aquí no hay montos fijos. Tienes hasta el domingo para apartar aunque sea S/ 1 y mantener tu racha.",
        chips: SUGERENCIAS.slice(0, 2),
      });
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#EFE7DE]">
      <header className="flex shrink-0 items-center gap-3 bg-[#0A5446] px-3 py-2.5 text-white">
        <button type="button" onClick={() => irA("inicio")} aria-label="Volver" className="px-1 text-xl">
          ←
        </button>
        <div className="grid size-9 place-items-center rounded-full bg-white/15 text-lg">🐿️</div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">Nido · Asistente</p>
          <p className="text-xs text-white/70">{n.escribiendo ? "escribiendo…" : "en línea"}</p>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          WhatsApp simulado
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {n.chat.map((m) => (
          <div key={m.id} className={`flex ${m.de === "juan" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[14.5px] leading-snug shadow-sm ${
                m.de === "juan" ? "rounded-br-sm bg-[#D9FDD3]" : "rounded-bl-sm bg-white"
              }`}
            >
              {m.texto}
            </p>
          </div>
        ))}
        {n.escribiendo && (
          <div className="flex justify-start">
            <p className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm" aria-label="Escribiendo">
              <span className="size-2 animate-bounce rounded-full bg-[#9AA8A3]" />
              <span className="size-2 animate-bounce rounded-full bg-[#9AA8A3] [animation-delay:120ms]" />
              <span className="size-2 animate-bounce rounded-full bg-[#9AA8A3] [animation-delay:240ms]" />
            </p>
          </div>
        )}
        {ultimo?.de === "bot" && ultimo.chips && !n.escribiendo && (
          <div className="flex flex-wrap gap-2 pt-1">
            {ultimo.chips.map((c) => (
              <button
                key={c.etiqueta}
                type="button"
                onClick={() => tocarChip(c)}
                className="rounded-full border border-[#0E7C66]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#0B5E4E] shadow-sm active:bg-[#E6F4EF]"
              >
                {c.etiqueta}
              </button>
            ))}
          </div>
        )}
        <div ref={finRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="flex shrink-0 gap-2 bg-[#F0F2F0] p-2"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: Hoy recibí 120 soles"
          aria-label="Mensaje"
          className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-[15px] outline-none"
        />
        <button type="submit" aria-label="Enviar" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0E7C66] text-white">
          ➤
        </button>
      </form>
    </div>
  );
}

/* ───────────────────────── 4. Proyección ───────────────────────── */

export function Proyeccion() {
  const n = useNido();
  const a = proyectar(n.aporteMensual, 20, n.tasa);
  const b = proyectar(n.aporteMensual, 30, n.tasa);
  const menos = Math.round((1 - b.total / a.total) * 100);

  return (
    <div className="space-y-4 px-5 pb-6 pt-4">
      <h1 className="text-xl font-bold tracking-tight">¿Cuánto tendrías a los 65?</h1>
      <Personaje id="guardian" texto="¡Cada aporte de hoy es una ayuda para tu yo del futuro! Mueve la barra y mira qué pasa." />

      <section className={TARJETA}>
        <div className="flex items-baseline justify-between">
          <label htmlFor="aporte" className="text-sm font-medium">
            Aporte promedio al mes
          </label>
          <span className="text-lg font-bold text-[#0B5E4E]">{soles(n.aporteMensual)}</span>
        </div>
        <input
          id="aporte"
          type="range"
          min={5}
          max={300}
          step={5}
          value={n.aporteMensual}
          onChange={(e) => n.setAporteMensual(Number(e.target.value))}
          className="mt-3 w-full accent-[#0E7C66]"
        />
        <p className={`mt-1 text-xs ${TEXTO_SUAVE}`}>
          Es un promedio: unos meses más, otros menos. Son ≈ {soles(round2(n.aporteMensual / 4.3))} por semana.
        </p>
        <p className={`mt-4 text-xs font-medium ${TEXTO_SUAVE}`}>Rentabilidad anual supuesta (descontando inflación)</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TASAS.map((t) => (
            <button
              key={t.nombre}
              type="button"
              aria-pressed={n.tasa === t.valor}
              onClick={() => n.setTasa(t.valor)}
              className={`rounded-xl border py-2 text-sm ${
                n.tasa === t.valor ? "border-[#0E7C66] bg-[#E6F4EF] font-semibold text-[#0B5E4E]" : "border-[#E3E9E6]"
              }`}
            >
              {t.nombre}
              <span className="block text-xs">{t.valor * 100}%</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[#0E7C66] p-5 text-white">
        <p className="text-sm text-white/80">Empezando a los 20, a los 65 tendrías</p>
        <p className="text-4xl font-bold tracking-tight">{soles(a.total)}</p>
        <p className="mt-2 text-sm text-white/85">
          Tú aportas {soles(a.aportado)} y el interés compuesto suma {soles(a.total - a.aportado)}.
        </p>
      </section>

      <section className={TARJETA}>
        <Grafico aporte={n.aporteMensual} tasa={n.tasa} />
        <p className="mt-3 rounded-xl bg-[#FFF8EA] p-3 text-sm text-[#5C3A04]">
          ⏳ <b>El costo de esperar:</b> si empiezas a los 30, con el mismo aporte tendrías {soles(b.total)}, un {menos}% menos.
        </p>
      </section>

      <p className="text-[11px] leading-snug text-[#8A9893]">
        Proyección ilustrativa en soles de hoy. Supone aportes constantes y una rentabilidad fija; no garantiza resultados.
        Las rentabilidades reales varían y pueden ser negativas en algunos años.
      </p>
    </div>
  );
}

/* ───────────────────────── 5. Mi futuro ───────────────────────── */

export function Futuro({ irWeb }: { irWeb: () => void }) {
  const n = useNido();
  const a = proyectar(n.aporteMensual, 20, n.tasa);
  const racha = calcularRacha(n.semanas);
  const aportes = n.movimientos.filter((m) => m.tipo === "aporte").length;

  return (
    <div className="space-y-4 px-5 pb-6 pt-4">
      <section className="rounded-3xl bg-gradient-to-b from-[#FFF1D6] to-white p-6 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-white text-6xl shadow">👴</div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#A8670A]">
          Don Futuro · {n.nombre} a los 65
        </p>
        <p className="mt-2 text-lg font-semibold leading-snug">
          «¿Qué decisiones estás tomando hoy para que yo pueda vivir con tranquilidad mañana?»
        </p>
        <p className={`mt-2 text-sm ${TEXTO_SUAVE}`}>
          {racha >= 6
            ? `¡Gracias por no olvidarme estas ${racha} semanas! Así se construye mi tranquilidad.`
            : "Cada semana que apartas algo, me acerco a una vejez tranquila."}
        </p>
      </section>

      <section className={TARJETA}>
        <p className={`text-sm ${TEXTO_SUAVE}`}>Si mantienes {soles(n.aporteMensual)} al mes en promedio, a los 65 tendrías</p>
        <p className="text-3xl font-bold tracking-tight">{soles(a.total)}</p>
        <p className={`text-sm ${TEXTO_SUAVE}`}>Equivale a ≈ {soles(Math.round(a.total / 240))} al mes durante 20 años*</p>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className={TARJETA}>
          <p className="text-2xl font-bold">🔥 {racha}</p>
          <p className={`text-[11px] ${TEXTO_SUAVE}`}>semanas de racha</p>
        </div>
        <div className={TARJETA}>
          <p className="text-2xl font-bold">{aportes}</p>
          <p className={`text-[11px] ${TEXTO_SUAVE}`}>aportes hechos</p>
        </div>
        <div className={TARJETA}>
          <p className="text-lg font-bold leading-8">{soles(n.saldoPrev)}</p>
          <p className={`text-[11px] ${TEXTO_SUAVE}`}>para tu yo de 65</p>
        </div>
      </section>

      <button
        type="button"
        onClick={irWeb}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#13201C] text-[15px] font-semibold text-white"
      >
        💻 Continuar en la versión web
      </button>
      <p className="text-[11px] leading-snug text-[#8A9893]">
        *Ilustrativo: divide el capital proyectado entre 240 meses, sin rentabilidad durante el retiro ni comisiones.
      </p>
    </div>
  );
}
