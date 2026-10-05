"use client";

import Link from "next/link";
import { Building2, GraduationCap, HeartHandshake, BriefcaseBusiness, Sparkles, UsersRound, BadgeCheck, BookOpenText } from "lucide-react";

const modules = [
  { label: "Prosper", href: "/prosper", icon: Sparkles },
  { label: "Aché", href: "/ache", icon: HeartHandshake },
  { label: "Letramento", href: "/letramento", icon: BookOpenText },
  { label: "Cultura", href: "/cultura", icon: Building2 },
  { label: "Vagas", href: "/vagas", icon: BriefcaseBusiness },
  { label: "Potenc.IA", href: "/potencia", icon: GraduationCap },
  { label: "Comunidade", href: "/comunidade", icon: UsersRound },
  { label: "ReBrand Pessoal", href: "/rebrand", icon: BadgeCheck },
];

export default function HomePage() {
  return (
    <main className="homePage">
      <header className="topbar">
        <div>
          <div className="acheWordmark small" aria-label="Aché">aché</div>
          <span>Programa PcD – Propagandista Trainee</span>
        </div>
        <Link href="/admin" className="adminLink">ADM</Link>
      </header>

      <section className="hero">
        <p className="eyebrow">Sua jornada começa aqui</p>
        <h1>Mais que contratar,<br />queremos incluir.</h1>
        <p>Explore os módulos da experiência e acompanhe seu desenvolvimento.</p>
      </section>

      <section className="nexus" aria-label="Nexus do programa">
        <div className="nexusCore">
          <div className="acheWordmark" aria-label="Aché">aché</div>
          <span>Propagandista<br/>Trainee</span>
        </div>
        {modules.map(({ label, href, icon: Icon }, index) => (
          <Link key={label} href={href} className={"nexusPetal petal" + index}>
            <Icon size={24} strokeWidth={1.7} />
            <span>{label}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
