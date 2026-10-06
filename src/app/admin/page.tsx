import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="adminPage">
      <header className="simpleHeader">
        <div>
          <Link href="/home" aria-label="Ir para Home" className="headerLogoLink">
            <Image
              src="/brand/ache-logo-tagline.webp"
              alt="Aché"
              width={115}
              height={69}
              className="acheHeaderLogo"
            />
          </Link>
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
        <article className="adminCommunityCard">
          <h2>Comunidade</h2>
          <p>Cadastre links do YouTube, títulos, categorias e destaques.</p>
          <div className="adminVideoCurrent">
            <span>Vídeo cadastrado</span>
            <strong>Comunidade Aché — Vídeo 01</strong>
            <a href="https://youtu.be/RewY7L3wcyg" target="_blank" rel="noreferrer">Abrir no YouTube</a>
          </div>
          <div className="adminVideoFields" aria-label="Estrutura preparada para novos vídeos">
            <label>Link do YouTube<input value="https://youtu.be/RewY7L3wcyg" readOnly /></label>
            <label>Título<input value="Comunidade Aché — Vídeo 01" readOnly /></label>
            <label>Categoria<input value="Comunidade" readOnly /></label>
          </div>
          <Link href="/comunidade" className="adminCommunityLink">Ver página da Comunidade</Link>
        </article>
        <article><h2>Vagas</h2><p>Publique e organize oportunidades.</p></article>
        <article className="adminRebrandCard">
          <h2>ReBrand / LinkedIn</h2>
          <p>Diagnóstico independente do projeto comercial, com conectores próprios para análise pública do LinkedIn e IA.</p>
          <div className="adminRebrandKeys">
            <code>ACHE_REBRAND_APIFY_TOKEN</code>
            <code>ACHE_REBRAND_GEMINI_API_KEY</code>
          </div>
          <p className="adminRebrandNote">As credenciais devem ser cadastradas somente neste projeto/Vercel. Não reutilize as chaves do Diagnóstico Comercial.</p>
          <Link href="/rebrand" className="adminCommunityLink">Abrir ReBrand Pessoal</Link>
        </article>
      </section>
    </main>
  );
}
