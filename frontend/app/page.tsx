import { Hero } from "@/components/landing/hero";
import { ArchitecturePreview } from "@/components/landing/architecture-preview";
import { DemoCallout } from "@/components/landing/demo-callout";
import { MetricsTeaser } from "@/components/landing/metrics-teaser";
import { TechStack } from "@/components/landing/tech-stack";
import { UseCases } from "@/components/landing/use-cases";
import { AboutEngineer } from "@/components/landing/about-engineer";

export default function Home() {
  return (
    <>
      <Hero />
      <ArchitecturePreview />
      <DemoCallout />
      <MetricsTeaser />
      <TechStack />
      <UseCases />
      <AboutEngineer />
    </>
  );
}
