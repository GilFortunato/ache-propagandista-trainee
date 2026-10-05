import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="adminPage">
      <header className="simpleHeader">
        <div>
          <Image
            src="/brand/ache-logo-tagline.webp"
            alt="Aché"
            width={115}
            height={69}
            className="acheHeaderLogo"
          />
          <strong>Administração</strong>
        </div>
        <Link href="/home">Voltar para Home</Link>
      </header>

      <section className="adminHero">
        <p className="eyebrow">Área administrativa</p>
        <h1>Gestão da experiência</h1>
        <p>POC da estrutura de gestão com dois perfis: participante e administrador.</p>
      </section>

      <section className="adminGrid">
        <article><h2>Usuários</h2><p>Gerencie participantes e administradores.</p></article>
        <article><h2>Comunidade</h2><p>Cadastre links do YouTube, títulos, categorias e destaques.</p></article>
        <article><h2>Vagas</h2><p>Publique e organize oportunidades.</p></article>
        <article><h2>LinkedIn</h2><p>Acompanhe diagnósticos de marca profissional para propagandistas.</p></article>
      </section>
    </main>
  );
}
