import Link from "next/link";

const data: Record<string, { title: string; description: string }> = {
  prosper: { title: "Prosper", description: "Desenvolvimento de habilidades digitais para o futuro do trabalho." },
  ache: { title: "Aché", description: "Conheça a marca, o programa e a jornada de inclusão." },
  letramento: { title: "Letramento", description: "Conteúdos de inclusão, acessibilidade e desenvolvimento digital." },
  cultura: { title: "Cultura", description: "Cultura Aché, valores e contexto para a jornada de Propagandista Trainee." },
  vagas: { title: "Vagas", description: "Oportunidades e conteúdos de preparação para carreira." },
  potencia: { title: "Potenc.IA", description: "Formação em IA com aplicação prática, empregabilidade e impacto social." },
  comunidade: { title: "Comunidade", description: "Histórias, experiências e vídeos da comunidade. Os vídeos serão cadastrados no ADM por link do YouTube." },
  rebrand: { title: "ReBrand Pessoal", description: "Diagnóstico de LinkedIn e marca profissional orientado à carreira de Propagandista." },
};

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const item = data[module] ?? { title: "Experiência", description: "Módulo em construção." };

  return (
    <main className="modulePage">
      <header className="simpleHeader">
        <div>
          <div className="acheWordmark small" aria-label="Aché">aché</div>
          <strong>Programa PcD – Propagandista Trainee</strong>
        </div>
        <Link href="/home">Voltar ao Nexus</Link>
      </header>
      <section className="moduleHero">
        <p className="eyebrow">Experiência</p>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <div className="modulePlaceholder">
          <strong>Estrutura pronta para a próxima etapa.</strong>
          <span>Conteúdo, identidade específica e funcionalidades serão conectados sem alterar a Home.</span>
        </div>
      </section>
    </main>
  );
}
