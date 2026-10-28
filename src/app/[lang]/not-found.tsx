import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/ui/Section";
import { Waveform } from "@/components/visuals/Waveform";

// Root params are not available here, so the message is shown in all three languages.
export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 bg-blueprint mask-radial" />
      <Container className="relative text-center">
        <p className="font-mono text-sm font-bold tracking-[0.3em] text-mute">ERROR 404 · NO ECHO</p>
        <h1 className="mt-4 font-display text-[clamp(5rem,16vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-brand-700">404</h1>
        <Waveform className="mx-auto mt-2 h-20 w-full max-w-md text-ink" />
        <p className="mt-6 font-display text-2xl font-bold text-ink">Página no encontrada · Página não encontrada · Page not found</p>
        <Link href="/es" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-700 px-7 py-4 font-display text-lg font-bold text-white">
          <ArrowLeft weight="bold" className="size-5" /> Tech-Inspection
        </Link>
      </Container>
    </section>
  );
}
