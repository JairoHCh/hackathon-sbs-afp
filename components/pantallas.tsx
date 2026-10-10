"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Hourglass,
  Laptop,
  MessageCircle,
  PiggyBank,
  Send,
  ShieldCheck,
  Target,
  Umbrella,
} from "lucide-react";
import datos from "@/data/datos.json";
import { proyectar, round2, soles, TASAS } from "@/lib/finanzas";
import {
  Avatar,
  GoogleG,
  Grafico,
  Kapicoin,
  Personaje,
  TONOS,
  personaje,
  type IdPersonaje,
} from "@/components/comunes";
import {
  calcularRacha,
  misionesPorReclamar,
  nivelMascota,
  NIVELES,
  SUGERENCIAS,
  useNido,
  type Chip,
  type Tab,
} from "@/components/estado";

export const TARJETA = "rounded-3xl bg-white p-4 shadow-suave";
const INPUT =
  "mt-1.5 h-12 w-full rounded-2xl border border-borde bg-fondo px-4 text-[15px] outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/10";
const EQUIPO: IdPersonaje[] = ["kapifin", "porky", "sabiondo", "monedina"];

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
    <div className="flex min-h-full flex-col bg-white px-6 pb-6 pt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex -space-x-3">
          {EQUIPO.map((id) => (
            <Avatar key={id} id={id} tam={56} className="shadow-suave" />
          ))}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold text-marca-700">{datos.app.nombre}</h1>
        <p className="mt-1 text-[15px] text-suave">{datos.app.lema}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setGoogle(true);
          setNombre(datos.usuario.nombre);
        }}
        className="mt-7 flex h-12 items-center justify-center gap-3 rounded-2xl border border-borde bg-white text-[15px] font-semibold shadow-suave transition active:scale-[0.99]"
      >
        <GoogleG />
        {google ? datos.usuario.correo : "Continuar con Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-tenue">
        <span className="h-px flex-1 bg-borde" />
        {google ? "Completa lo que falta" : "o completa tus datos"}
        <span className="h-px flex-1 bg-borde" />
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" className={INPUT} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Celular</span>
          <span className="ml-1 text-xs text-tenue">para hablar con Porky por WhatsApp</span>
          <input
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            inputMode="tel"
            placeholder="999 000 000"
            className={INPUT}
          />
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">¿Cómo son tus ingresos?</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-2xl bg-fondo p-1">
            {(["fijo", "variable"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tipo === t}
                onClick={() => setTipo(t)}
                className={`h-10 rounded-xl text-[14px] font-semibold transition ${
                  tipo === t ? "bg-white text-marca-700 shadow-suave" : "text-suave"
                }`}
              >
                {t === "fijo" ? "Fijos cada mes" : "Cambian cada mes"}
              </button>
            ))}
          </div>
          {tipo === "variable" && (
            <div className="animar-subida mt-3 flex items-center gap-3 rounded-2xl bg-marca-50 p-3">
              <Avatar id="monedina" tam={36} />
              <p className="text-[13px] leading-snug text-marca-700">
                ¡Perfecto! No te pediremos un monto fijo. Apartas lo que puedas, cuando puedas.
              </p>
            </div>
          )}
        </fieldset>
        <label className="flex items-start gap-2.5 text-[13px] text-suave">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-0.5 size-4 accent-marca"
          />
          Acepto el tratamiento de mis datos personales (Ley N.° 29733).
        </label>
      </div>

      <button
        type="button"
        disabled={!listo}
        onClick={() => registrar(nombre)}
        className="mt-6 h-12 rounded-2xl bg-marca text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:bg-borde disabled:text-tenue"
      >
        Empezar a ahorrar
      </button>
      <p className="mt-3 text-center text-[11px] text-tenue">
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
  const porReclamar = misionesPorReclamar(n.misiones);
  const hechas = Object.values(n.misiones).filter((e) => e !== "pendiente").length;
  const [dato, setDato] = useState(0);
  const d = datos.datosDelDia[dato % datos.datosDelDia.length];
  const [hecho, meta] = datos.misiones.find((m) => m.id === "s-reto")?.progreso ?? [0, 1];
  const reto = { titulo: "Reto del desayuno", progreso: hecho, meta };

  return (
    <div className="space-y-4 px-5 pb-6 pt-3">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-marca-50 font-display text-lg font-semibold text-marca-700">
            {n.nombre.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-[13px] text-suave">Hola, {n.nombre}</p>
            <h1 className="font-display text-xl font-semibold leading-tight">Tu nido de ahorro</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => irA("misiones")}
          aria-label={`${n.kapicoins} Kapicoins`}
          className="relative flex h-10 items-center gap-1.5 rounded-full bg-white pl-1.5 pr-3 shadow-suave"
        >
          <Kapicoin tam={26} />
          <span className="font-bold tabular-nums">{n.kapicoins}</span>
          {porReclamar > 0 && (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-peligro text-[10px] font-bold text-white">
              {porReclamar}
            </span>
          )}
        </button>
      </header>

      {/* Widget: racha y mascota */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marca to-marca-700 p-5 text-white shadow-suave">
        <span className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/[0.06]" />
        <span className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-white/[0.05]" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Racha semanal</p>
            <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap font-display text-[34px] font-semibold leading-none">
              <Flame className="size-8 fill-kapifin text-kapifin" aria-hidden="true" />
              {racha} semanas
            </p>
            <p className="mt-2 text-[13px] text-white/80">
              Nivel {nivel.nivel} · {nivel.nombre}
            </p>
          </div>
          <button
            type="button"
            onClick={() => n.abrirLeccion("monedina")}
            aria-label="Que Monedina te explique"
            className="relative shrink-0 rounded-full transition active:scale-95"
          >
            <Avatar
              id="monedina"
              tam={78}
              className={`transition ${nivel.nivel === 3 ? "ring-4 ring-kapifin" : "ring-4 ring-white/30"}`}
            />
            {nivel.nivel === 3 && (
              <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-kapifin text-kapifin-900 shadow">
                <Crown className="size-4" aria-hidden="true" />
              </span>
            )}
          </button>
        </div>

        <div className="relative mt-4 flex justify-between">
          {n.semanas.map((s, i) => {
            const actual = i === n.semanas.length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`grid size-9 place-items-center rounded-full ${
                    s ? "bg-kapifin text-kapifin-900" : actual ? "border-2 border-dashed border-white/60" : "bg-white/15"
                  }`}
                >
                  {s && <Flame className="size-4 fill-current" aria-hidden="true" />}
                </span>
                <span className="text-[10px] font-medium text-white/70">{actual ? "Esta" : `S${i + 1}`}</span>
              </div>
            );
          })}
        </div>

        <p className="relative mt-4 rounded-2xl bg-white/10 px-3 py-2.5 text-[13px] leading-snug">
          {semanaLista
            ? "Semana asegurada. ¡La constancia vale más que el monto!"
            : "Aparta aunque sea S/ 1 antes del domingo y tu racha sigue viva."}
          {siguiente && (
            <span className="block text-white/70">
              Te {siguiente.desde - racha === 1 ? "falta 1 semana" : `faltan ${siguiente.desde - racha} semanas`} para
              ser {siguiente.nombre}.
            </span>
          )}
        </p>
      </section>

      {/* Dinero ahorrado */}
      <section className={TARJETA}>
        <p className="text-[13px] font-medium text-suave">Llevas ahorrado</p>
        <p className="mt-0.5 text-[40px] font-bold leading-tight tracking-tight tabular-nums">
          {soles(n.saldoPrev + n.saldoEmer)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-marca-50 p-3">
            <ShieldCheck className="size-5 text-marca" aria-hidden="true" />
            <p className="mt-2 text-xs text-marca-700">Para tu yo de 65</p>
            <p className="text-lg font-bold tabular-nums">{soles(n.saldoPrev)}</p>
          </div>
          <div className="rounded-2xl bg-fondo p-3">
            <Umbrella className="size-5 text-suave" aria-hidden="true" />
            <p className="mt-2 text-xs text-suave">Emergencias</p>
            <p className="text-lg font-bold tabular-nums">{soles(n.saldoEmer)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => irA("chat")}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-marca text-[15px] font-semibold text-white transition active:scale-[0.99]"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Registrar un ingreso por WhatsApp
        </button>
      </section>

      {/* Bento: misiones y reto */}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => irA("misiones")} className="rounded-3xl bg-kapifin-50 p-4 text-left shadow-suave">
          <div className="flex items-center justify-between">
            <Avatar id="kapifin" tam={36} />
            <ChevronRight className="size-4 text-kapifin-900/60" aria-hidden="true" />
          </div>
          <p className="mt-3 font-display text-[15px] font-semibold text-kapifin-900">Misiones</p>
          <p className="text-xs text-kapifin-900/80">
            {porReclamar > 0 ? `${porReclamar} por reclamar` : `${hechas} de ${datos.misiones.length} hechas`}
          </p>
        </button>
        <div className="rounded-3xl bg-white p-4 shadow-suave">
          <Target className="size-6 text-marca" aria-hidden="true" />
          <p className="mt-3 font-display text-[15px] font-semibold leading-tight">{reto.titulo}</p>
          <div className="mt-2 h-1.5 rounded-full bg-fondo">
            <div className="h-1.5 rounded-full bg-marca" style={{ width: `${(reto.progreso / reto.meta) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-suave">
            {reto.progreso} de {reto.meta} días
          </p>
        </div>
      </div>

      <Equipo />

      {/* Dato del día con Sabiondo */}
      <section className="rounded-3xl bg-sabiondo-50 p-4">
        <div className="flex items-center gap-3">
          <Avatar id="sabiondo" tam={40} />
          <div>
            <p className="font-display text-[15px] font-semibold text-sabiondo-700">Dato del día</p>
            <p className="text-xs text-sabiondo-700/80">con Sabiondo</p>
          </div>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-snug">{d.texto}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-[11px] leading-snug text-suave">{d.fuente}</p>
          <button
            type="button"
            onClick={() => {
              setDato(dato + 1);
              n.cumplirMision("dato");
            }}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-sabiondo-700 shadow-suave"
          >
            Otro dato
          </button>
        </div>
      </section>
    </div>
  );
}

function Equipo() {
  const n = useNido();

  return (
    <section className={TARJETA}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-semibold">Aprende con tu equipo</p>
        <p className="text-xs font-medium tabular-nums text-tenue">
          {n.leccionesVistas.length}/{EQUIPO.length} lecciones
        </p>
      </div>
      <p className="mt-0.5 text-[13px] text-suave">Toca a un personaje y te lo explica en 1 minuto.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {EQUIPO.map((x) => {
          const p = personaje(x);
          const tx = TONOS[p.tono as keyof typeof TONOS];
          const vista = n.leccionesVistas.includes(x);
          return (
            <button
              key={x}
              type="button"
              onClick={() => n.abrirLeccion(x)}
              aria-label={`${p.nombre} te explica: ${p.tema}`}
              className={`relative flex items-center gap-2.5 rounded-2xl p-2.5 text-left transition active:scale-[0.97] ${tx.fondo}`}
            >
              <Avatar id={x} tam={44} />
              <span className="min-w-0">
                <span className={`block font-display text-[14px] font-semibold leading-tight ${tx.texto}`}>{p.nombre}</span>
                <span className="block text-[11px] leading-tight text-suave">{p.tema}</span>
              </span>
              {vista && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-marca text-white">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
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
            (r.evoluciono ? `\n\n🐱 ¡Monedina subió de nivel! Ahora es ${nivelMascota(r.racha).nombre}.` : "") +
            "\n\n🎯 Kapifin dice: ¡cumpliste misiones! Reclama tus Kapicoins.",
          chips: [
            { etiqueta: "Reclamar Kapicoins", ir: "misiones" },
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
    <div className="flex h-full flex-col bg-[#efe7de]">
      <header className="flex shrink-0 items-center gap-3 bg-marca-700 px-3 py-2.5 text-white">
        <button type="button" onClick={() => irA("inicio")} aria-label="Volver" className="-ml-1 p-1">
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <Avatar id="porky" tam={38} className="ring-0" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] font-semibold leading-tight">Porky Cash</p>
          <p className="text-xs text-white/70">{n.escribiendo ? "escribiendo…" : "en línea"}</p>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          WhatsApp simulado
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {n.chat.map((m) => (
          <div key={m.id} className={`animar-subida flex ${m.de === "juan" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[14.5px] leading-snug shadow-sm ${
                m.de === "juan" ? "rounded-br-md bg-[#d9fdd3]" : "rounded-bl-md bg-white"
              }`}
            >
              {m.texto}
            </p>
          </div>
        ))}
        {n.escribiendo && (
          <div className="flex justify-start">
            <p className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm" aria-label="Escribiendo">
              <span className="size-2 animate-bounce rounded-full bg-tenue" />
              <span className="size-2 animate-bounce rounded-full bg-tenue [animation-delay:120ms]" />
              <span className="size-2 animate-bounce rounded-full bg-tenue [animation-delay:240ms]" />
            </p>
          </div>
        )}
        {ultimo?.de === "bot" && ultimo.chips && !n.escribiendo && (
          <div className="animar-subida flex flex-wrap gap-2 pt-1">
            {ultimo.chips.map((c) => (
              <button
                key={c.etiqueta}
                type="button"
                onClick={() => tocarChip(c)}
                className="rounded-full border border-marca/25 bg-white px-3.5 py-2 text-sm font-semibold text-marca-700 shadow-sm transition active:scale-[0.98]"
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
        className="flex shrink-0 gap-2 bg-[#f0f2f0] p-2"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: Hoy recibí 120 soles"
          aria-label="Mensaje"
          className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-[15px] outline-none"
        />
        <button type="submit" aria-label="Enviar" className="grid size-11 shrink-0 place-items-center rounded-full bg-marca text-white">
          <Send className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

/* ───────────────────────── 4. Proyección (Sabiondo) ───────────────────────── */

export function Proyeccion() {
  const n = useNido();
  const a = proyectar(n.aporteMensual, 20, n.tasa);
  const b = proyectar(n.aporteMensual, 30, n.tasa);
  const menos = Math.round((1 - b.total / a.total) * 100);

  return (
    <div className="space-y-4 px-5 pb-6 pt-3">
      <h1 className="font-display text-2xl font-semibold">¿Cuánto tendrías a los 65?</h1>
      <Personaje id="sabiondo" texto="El tiempo es tu superpoder. Mueve la barra y mira cómo crece tu ahorro." />

      <section className={TARJETA}>
        <div className="flex items-baseline justify-between">
          <label htmlFor="aporte" className="text-sm font-semibold">
            Aporte promedio al mes
          </label>
          <span className="text-xl font-bold tabular-nums text-sabiondo-700">{soles(n.aporteMensual)}</span>
        </div>
        <input
          id="aporte"
          type="range"
          min={5}
          max={300}
          step={5}
          value={n.aporteMensual}
          onChange={(e) => n.setAporteMensual(Number(e.target.value))}
          className="mt-3 w-full accent-sabiondo"
        />
        <p className="mt-1 text-xs text-suave">
          Es un promedio: unos meses más, otros menos. Son ≈ {soles(round2(n.aporteMensual / 4.3))} por semana.
        </p>
        <p className="mt-4 text-xs font-semibold text-suave">Rentabilidad anual supuesta (descontando inflación)</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-fondo p-1">
          {TASAS.map((t) => (
            <button
              key={t.nombre}
              type="button"
              aria-pressed={n.tasa === t.valor}
              onClick={() => n.setTasa(t.valor)}
              className={`rounded-xl py-2 text-sm transition ${
                n.tasa === t.valor ? "bg-white font-semibold text-sabiondo-700 shadow-suave" : "text-suave"
              }`}
            >
              {t.nombre}
              <span className="block text-xs">{t.valor * 100}%</span>
            </button>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sabiondo to-sabiondo-700 p-5 text-white shadow-suave">
        <span className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/[0.07]" />
        <p className="relative text-sm text-white/80">Empezando a los 20, a los 65 tendrías</p>
        <p className="relative mt-1 text-[40px] font-bold leading-tight tracking-tight tabular-nums">{soles(a.total)}</p>
        <p className="relative mt-2 text-sm text-white/85">
          Tú aportas {soles(a.aportado)} y el interés compuesto suma {soles(a.total - a.aportado)}.
        </p>
      </section>

      <section className={TARJETA}>
        <Grafico aporte={n.aporteMensual} tasa={n.tasa} />
        <div className="mt-3 flex gap-2.5 rounded-2xl bg-kapifin-50 p-3 text-sm text-kapifin-900">
          <Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <b>El costo de esperar:</b> si empiezas a los 30, con el mismo aporte tendrías {soles(b.total)}, un {menos}% menos.
          </p>
        </div>
      </section>

      <p className="text-[11px] leading-snug text-tenue">
        Proyección ilustrativa en soles de hoy. Supone aportes constantes y una rentabilidad fija; no garantiza resultados.
        Las rentabilidades reales varían y pueden ser negativas en algunos años.
      </p>
    </div>
  );
}

/* ───────────────────────── 5. Jubilación (Porky Cash) ───────────────────────── */

export function Futuro({ irWeb }: { irWeb: () => void }) {
  const n = useNido();
  const a = proyectar(n.aporteMensual, 20, n.tasa);
  const racha = calcularRacha(n.semanas);
  const aportes = n.movimientos.filter((m) => m.tipo === "aporte").length;

  return (
    <div className="space-y-4 px-5 pb-6 pt-3">
      <section className="relative overflow-hidden rounded-3xl bg-marca-50 shadow-suave">
        <div className="flex items-end">
          <div className="min-w-0 flex-1 p-5 pr-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-marca-700">Tu jubilación con Porky Cash</p>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight">{n.nombre} a los 65</h1>
            <p className="mt-2 text-[14px] leading-snug">«Mi superpoder es pensar en el largo plazo: ¡cada sol cuenta!»</p>
            <button
              type="button"
              onClick={() => n.abrirLeccion("porky")}
              className="mt-3 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-marca-700 shadow-suave"
            >
              ¿Cómo funciona mi fondo?
            </button>
          </div>
          <Image
            src="/personajes/porky.webp"
            alt="Porky Cash"
            width={120}
            height={172}
            className="h-[172px] w-[120px] shrink-0 object-cover object-top mix-blend-multiply"
          />
        </div>
      </section>

      <section className={TARJETA}>
        <p className="text-sm text-suave">Si mantienes {soles(n.aporteMensual)} al mes en promedio, a los 65 tendrías</p>
        <p className="mt-1 text-[36px] font-bold leading-tight tracking-tight tabular-nums text-marca-700">{soles(a.total)}</p>
        <p className="text-sm text-suave">Equivale a ≈ {soles(Math.round(a.total / 240))} al mes durante 20 años*</p>
        <p className="mt-3 rounded-2xl bg-marca-50 px-3 py-2.5 text-[13px] text-marca-700">
          {racha >= 6
            ? `¡Gracias por no olvidarme estas ${racha} semanas! Así se construye tu tranquilidad.`
            : "Cada semana que apartas algo, te acercas a una vejez tranquila."}
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className={TARJETA}>
          <Flame className="mx-auto size-5 fill-kapifin text-kapifin" aria-hidden="true" />
          <p className="mt-1 text-xl font-bold tabular-nums">{racha}</p>
          <p className="text-[11px] text-suave">semanas de racha</p>
        </div>
        <div className={TARJETA}>
          <PiggyBank className="mx-auto size-5 text-marca" aria-hidden="true" />
          <p className="mt-1 text-xl font-bold tabular-nums">{aportes}</p>
          <p className="text-[11px] text-suave">aportes hechos</p>
        </div>
        <div className={TARJETA}>
          <span className="mx-auto block w-fit">
            <Kapicoin tam={20} />
          </span>
          <p className="mt-1 text-xl font-bold tabular-nums">{n.kapicoins}</p>
          <p className="text-[11px] text-suave">Kapicoins</p>
        </div>
      </section>

      <button
        type="button"
        onClick={irWeb}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-tinta text-[15px] font-semibold text-white transition active:scale-[0.99]"
      >
        <Laptop className="size-5" aria-hidden="true" />
        Continuar en la versión web
      </button>
      <p className="text-[11px] leading-snug text-tenue">
        *Ilustrativo: divide el capital proyectado entre 240 meses, sin rentabilidad durante el retiro ni comisiones.
      </p>
    </div>
  );
}
