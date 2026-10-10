import datos from "@/data/datos.json";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Hackathon SBS AFP</h1>
        <p className="text-sm text-zinc-500">{datos.mensaje}</p>
      </header>

      <ul className="flex flex-col gap-3">
        {datos.afiliados.map((a) => (
          <li
            key={a.id}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="font-medium">{a.nombre}</p>
            <p className="text-sm text-zinc-500">
              {a.fondo} · S/ {a.aporteMensual.toFixed(2)} al mes
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
