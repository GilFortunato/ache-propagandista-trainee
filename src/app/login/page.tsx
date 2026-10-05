"use client";

import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="loginPage">
      <div className="organic organicOne" />
      <div className="organic organicTwo" />

      <section className="loginBrand">
        <Image
          src="/brand/ache-logo.png"
          alt="Aché"
          width={115}
          height={69}
          className="acheLogoLogin"
          priority
        />
        <p className="eyebrow">Programa PcD</p>
        <h1>Propagandista Trainee</h1>
        <p className="programSlogan">Mais que contratar, queremos incluir.</p>
        <p className="brandSlogan">Mais vida pra você</p>
      </section>

      <section className="loginCard">
        <Image
          src="/brand/ache-logo.png"
          alt="Aché"
          width={115}
          height={69}
          className="acheLogoCard"
        />
        <h2>Bem-vinda(o) à sua jornada</h2>
        <p>Acesse conteúdos, experiências e ferramentas do programa.</p>
        <Link className="googleButton" href="/home">Continuar com Google</Link>
        <small>POC visual — autenticação Google será conectada na próxima etapa.</small>
      </section>
    </main>
  );
}
