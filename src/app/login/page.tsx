"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="loginPage">
      <div className="organic organicOne" />
      <div className="organic organicTwo" />
      <section className="loginBrand">
        <div className="acheWordmark" aria-label="Aché">aché</div>
        <p className="eyebrow">Programa PcD</p>
        <h1>Propagandista Trainee</h1>
        <p className="programSlogan">Mais que contratar, queremos incluir.</p>
        <p className="brandSlogan">Mais vida pra você</p>
      </section>
      <section className="loginCard">
        <span className="badge">Aché Experience</span>
        <h2>Bem-vinda(o) à sua jornada</h2>
        <p>Acesse conteúdos, experiências e ferramentas do programa.</p>
        <Link className="googleButton" href="/home">Continuar com Google</Link>
        <small>POC visual — autenticação Google será conectada na próxima etapa.</small>
      </section>
    </main>
  );
}
