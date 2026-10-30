import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/ui/Section";
import { Waveform } from "@/components/visuals/Waveform";

// Root params are not available here, so the message is shown in all three languages.
export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden pt-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-radial" />
      <Container className="text-center">
        <p className="font-mono text-sm font-bold tracking-[0.3em] text-accent-ink">ERROR 404 · NO ECHO</p>
        <h1 className="mt-4 text-[clamp(5rem,16vw,12rem)] font-extrabold leading-none tracking-[-0.06em] text-accent">404</h1>
        <Waveform className="mx-auto mt-2 h-20 w-full max-w-md text-ink" color="#1fc8f5" />
        <p className="mt-6 text-2xl font-extrabold text-ink">Página no encontrada · Página não encontrada · Page not found</p>
        <Link href="/es" className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-7 text-lg font-bold text-white dark:bg-neon dark:text-[#0b1533]">
          <ArrowLeft weight="bold" className="size-5" /> Tech-Inspection
        </Link>
      </Container>
    </section>
  );
}
