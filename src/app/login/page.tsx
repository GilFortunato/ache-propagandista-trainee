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
        <Link className="googleButton" href="/api/auth/google/start">Continuar com Google</Link>
        <small>O Google identifica sua conta para proteger o limite de 3 pesquisas do ReBrand.</small>
        <p><Link href="/admin/login">Sou administradora — entrar no ADM</Link></p>
      </section>
    </main>
  );
}
