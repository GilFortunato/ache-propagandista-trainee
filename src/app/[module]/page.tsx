import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Gauge,
  GraduationCap,
  Lightbulb,
  Network,
  Rocket,
  Sparkles,
  Target,
  UsersRound,
  WandSparkles,
} from "lucide-react";

const fallbackData: Record<string, { title: string; description: string }> = {
  ache: { title: "Aché", description: "Conheça a marca, o programa e a jornada de inclusão." },
  cultura: { title: "Cultura", description: "Cultura Aché, valores e contexto para a jornada de Propagandista Trainee." },
  vagas: { title: "Vagas", description: "Oportunidades e conteúdos de preparação para carreira." },
  comunidade: { title: "Comunidade", description: "Histórias, experiências e vídeos da comunidade." },
  rebrand: { title: "ReBrand Pessoal", description: "Diagnóstico de LinkedIn e marca profissional orientado à carreira de Propagandista." },
};

function Header() {
  return (
    <header className="experienceHeader">
      <div className="experienceBrand">
        <Image
          src="/brand/ache-logo.png"
          alt="Aché"
          width={115}
          height={69}
          className="acheLogoSmall"
          priority
        />
        <strong>Programa PcD – Propagandista Trainee</strong>
      </div>
      <Link href="/home" className="backNexus">
        <ArrowLeft size={18} aria-hidden="true" />
        Voltar ao Nexus
      </Link>
    </header>
  );
}

function ProsperPage() {
  const ecosystem = [
    { title: "Aquisição de Talentos", text: "Atração, seleção e formação de profissionais alinhados às necessidades da empresa.", bullets: ["Education Recruiting pré ou pós contratação"] },
    { title: "Habilidades Digitais", text: "Capacitação de equipes em IA para aumento de produtividade e futuro do trabalho.", bullets: ["Letramento Digital", "Inic.IA – Sensibilização de IA"] },
    { title: "Aplicação de IA", text: "Projetos práticos de Inteligência Artificial para gerar impacto direto no negócio.", bullets: ["AI for Business", "AI Builders (Vibe Coding)"] },
  ];

  const solutions = [
    { icon: GraduationCap, title: "Education Recruiting", text: "Formação de talentos sob medida, conectando atração, aprendizagem e contratação." },
    { icon: Lightbulb, title: "Letramento Digital", text: "Competências digitais essenciais para profissionais de diferentes áreas e públicos não técnicos." },
    { icon: BrainCircuit, title: "Inic.IA", text: "Sensibilização em IA para sair do interesse teórico e identificar oportunidades reais." },
    { icon: BriefcaseBusiness, title: "AI for Business", text: "Aplicação estratégica de IA em RH, liderança e operações para gerar eficiência." },
    { icon: Rocket, title: "AI Builders", text: "Construção de protótipos funcionais com IA, conectados a desafios reais do negócio." },
    { icon: Sparkles, title: "Potenc.IA", text: "Impacto ESG + negócio, conectando formação, inclusão produtiva e empregabilidade." },
  ];

  return (
    <main className="experiencePage prosperLanding">
      <Header />
      <section className="prosperHero landingSection">
        <div className="prosperHeroCopy">
          <span className="sectionTag">PROSPER DIGITAL SKILLS</span>
          <p className="prosperKicker">Desenvolvimento de habilidades digitais</p>
          <h1>Preparando pessoas para o <em>futuro do trabalho.</em></h1>
          <p className="lead">
            Somos a frente de desenvolvimento de habilidades digitais da Share People Hub,
            promovendo o desenvolvimento por habilidades como forma de ampliar diversidade,
            equidade e inclusão.
          </p>
          <a className="landingCta" href="#ecossistema">
            Conhecer o ecossistema <ArrowRight size={18} />
          </a>
        </div>
        <div className="prosperSignal" aria-hidden="true">
          <div className="signalOrb signalOrb1" />
          <div className="signalOrb signalOrb2" />
          <div className="signalLine" />
          <div className="signalCard signalCardA"><BrainCircuit size={34} /></div>
          <div className="signalCard signalCardB"><UsersRound size={34} /></div>
          <div className="signalCard signalCardC"><Rocket size={34} /></div>
        </div>
      </section>

      <section className="landingSection prosperStatement">
        <span className="sectionTag">SOBRE A PROSPER</span>
        <h2>Desenvolvimento de <strong>HABILIDADES DIGITAIS</strong></h2>
        <p>
          Soluções modulares de ponta a ponta: conectando talentos à geração de valor real
          para o negócio.
        </p>
      </section>

      <section id="ecossistema" className="landingSection prosperEcosystem">
        <div className="sectionHeading">
          <span className="sectionTag">NOSSO ECOSSISTEMA</span>
          <h2>Ecossistema de Desenvolvimento de Talentos e Transformação com IA</h2>
        </div>
        <div className="ecosystemGrid">
          {ecosystem.map((item) => (
            <article key={item.title} className="glassPanel">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="ecosystemBottom">
          <article><strong>Potenc.IA</strong><span>Programa transversal de impacto ESG + Negócio.</span></article>
          <article><strong>Prosper Sprints</strong><span>Gestão de jornada, escala e mensuração de resultados.</span></article>
        </div>
      </section>

      <section className="landingSection prosperSolutions">
        <div className="sectionHeading">
          <span className="sectionTag">SOLUÇÕES</span>
          <h2>Da formação à geração de valor.</h2>
        </div>
        <div className="solutionGrid">
          {solutions.map(({ icon: Icon, title, text }) => (
            <article key={title} className="solutionCard">
              <span className="solutionIcon"><Icon size={26} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection clientStrip">
        <span className="sectionTag">CLIENTES</span>
        <h2>Empresas que transformam o mundo com a gente.</h2>
        <div className="clientWords" aria-label="Exemplos de empresas atendidas">
          {["AB InBev","CI&T","TotalPass","John Deere","Citi","Alelo","Bosch","Vivo","Itaú","Localiza","Suzano","RD","RDI","Pismo","Webmotors"].map((name) => <span key={name}>{name}</span>)}
        </div>
      </section>
    </main>
  );
}

function LetramentoPage() {
  const columns = [
    {
      icon: Target,
      title: "A solução",
      subtitle: "Programa de Habilidades Essenciais",
      text: "Desenvolvimento estruturado de competências digitais para profissionais de diferentes áreas, com foco especial em públicos não técnicos.",
    },
    {
      icon: Gauge,
      title: "Problemas que resolve",
      bullets: ["Dificuldade de adaptação ao digital", "Uso ineficiente de ferramentas", "Dependência excessiva de suporte", "Baixa autonomia das equipes"],
    },
    {
      icon: WandSparkles,
      title: "Diferenciais Prosper",
      bullets: ["Conteúdo aplicado ao contexto real", "Linguagem acessível e adaptável", "Online, presencial ou gravado", "Personalização por nível de maturidade"],
    },
  ];

  return (
    <main className="experiencePage letramentoLanding">
      <Header />
      <section className="landingSection letramentoHero">
        <div className="letramentoHeroIcon"><Network size={54} /></div>
        <div>
          <span className="sectionTag">DESENVOLVIMENTO DE HABILIDADES DIGITAIS</span>
          <h1>Letramento Digital: <em>Preparando Times para Novas Formas de Trabalho</em></h1>
          <p className="lead">
            Tornando a tecnologia acessível e eficiente para criar uma base sólida de evolução
            para suas equipes.
          </p>
        </div>
      </section>

      <section className="landingSection letramentoCore">
        <div className="letramentoGrid">
          {columns.map(({ icon: Icon, title, subtitle, text, bullets }) => (
            <article key={title} className="letramentoCard">
              <Icon size={30} />
              <h2>{title}</h2>
              {subtitle && <strong>{subtitle}</strong>}
              {text && <p>{text}</p>}
              {bullets && <ul>{bullets.map((item) => <li key={item}><CheckCircle2 size={17} />{item}</li>)}</ul>}
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection letramentoBenefits">
        <div>
          <span className="sectionTag">BENEFÍCIOS PARA O NEGÓCIO</span>
          <h2>Mais autonomia. Menos barreiras.</h2>
          <ul>
            <li><CheckCircle2 />Aumento da autonomia e produtividade</li>
            <li><CheckCircle2 />Uso inteligente do ecossistema digital</li>
            <li><CheckCircle2 />Redução de chamados de suporte técnico</li>
            <li><CheckCircle2 />Base sólida para evolução digital</li>
          </ul>
        </div>
        <aside className="formatCard">
          <span className="sectionTag">FORMATO DO PROGRAMA</span>
          <div><strong>Carga horária</strong><span>Flexível e adaptada aos objetivos.</span></div>
          <div><strong>Estrutura</strong><span>Modular, ajustada conforme o público-alvo.</span></div>
          <div><strong>Aplicação</strong><span>Todas as áreas e perfis corporativos.</span></div>
        </aside>
      </section>
    </main>
  );
}

function PotenciaPage() {
  const differentials = ["Jornada estruturada", "Aprendizado aplicado", "Personalização via assessment", "Ciclos curtos", "Ferramentas de IA diversas"];
  const levels = [
    { n: "01", name: "Exploradoras da IA", level: "Iniciante · 14h", text: "Desmistificar a IA, desenvolver letramento digital e promover o uso prático no cotidiano.", items: ["Letramento Digital e Tecnológico", "Engenharia de Prompt", "IA no dia a dia", "Organização e Produtividade"] },
    { n: "02", name: "Transformadoras", level: "Intermediária · 14h", text: "Desenvolver habilidades práticas de IA em contextos profissionais.", items: ["Prompt Estratégico", "Aplicação Estratégica", "Design com Agentes", "Criação de Conteúdo"] },
    { n: "03", name: "Criadoras", level: "Avançada · 14h", text: "Desenvolver soluções com IA e liderar iniciativas transformadoras.", items: ["Resolução de Problemas", "Automação Inteligente", "Comunicação Estratégica", "Decisão Orientada por Dados"] },
  ];

  return (
    <main className="experiencePage potenciaLanding">
      <Header />
      <section className="landingSection potenciaHero">
        <div className="potenciaHeroCopy">
          <span className="potenciaBrand">Potenc.IA</span>
          <h1>Impulsionando carreiras femininas <em>por meio da IA.</em></h1>
          <p>
            Um movimento para promover a aceleração da carreira de mulheres por meio do
            letramento em Inteligência Artificial.
          </p>
          <a href="#jornada" className="potenciaCta">Conheça a jornada <ArrowRight size={18} /></a>
        </div>
        <div className="potenciaVisual" aria-hidden="true">
          <div className="neonMesh" />
          <div className="aiBadge"><BrainCircuit size={56} /><span>IA</span></div>
          <div className="neonDot dot1" /><div className="neonDot dot2" /><div className="neonDot dot3" />
        </div>
      </section>

      <section className="landingSection potenciaImpact">
        <div className="impactNumber">10.000</div>
        <div>
          <span>mulheres</span>
          <p>colaboradoras e da comunidade como meta de impacto do movimento.</p>
        </div>
        <div className="impactGauge"><strong>29%</strong><span>marco já alcançado</span></div>
      </section>

      <section className="landingSection potenciaProposal">
        <div className="sectionHeading">
          <span className="potenciaTag">A PROPOSTA</span>
          <h2>Uma jornada. Não um curso isolado.</h2>
          <p>Formação em IA generativa com foco em habilidades práticas, personalização da aprendizagem e conexão com oportunidades reais.</p>
        </div>
        <div className="potenciaDiffGrid">
          {differentials.map((item, i) => (
            <article key={item}><span>0{i+1}</span><strong>{item}</strong></article>
          ))}
        </div>
      </section>

      <section id="jornada" className="landingSection potenciaJourney">
        <div className="sectionHeading">
          <span className="potenciaTag">JORNADA</span>
          <h2>Aprender, experimentar e transformar.</h2>
        </div>
        <div className="journeyRail">
          <article><span>01</span><h3>Assessment inicial</h3><p>Avalia conhecimento e identifica gaps para uma trilha personalizada.</p></article>
          <ArrowRight className="railArrow" />
          <article><span>02</span><h3>Sprints de aprendizagem</h3><p>Caminho focado nos gaps individuais, com conteúdo relevante e adaptado.</p></article>
          <ArrowRight className="railArrow" />
          <article><span>03</span><h3>Assessment final</h3><p>Mede progresso e avalia a eficácia dos projetos desenvolvidos.</p></article>
        </div>
        <div className="journeySupport">
          <span><UsersRound /> Mentoria</span>
          <span><GraduationCap /> Conteúdo assíncrono</span>
          <span><Rocket /> Projeto prático</span>
        </div>
      </section>

      <section className="landingSection potenciaLevels">
        <div className="sectionHeading">
          <span className="potenciaTag">CONTEÚDO EM 3 NÍVEIS</span>
          <h2>Uma trilha para cada momento.</h2>
        </div>
        <div className="levelGrid">
          {levels.map((level) => (
            <article key={level.n} className="levelCard">
              <span className="levelNumber">{level.n}</span>
              <h3>{level.name}</h3>
              <strong>{level.level}</strong>
              <p>{level.text}</p>
              <ul>{level.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;

  if (module === "prosper") return <ProsperPage />;
  if (module === "letramento") return <LetramentoPage />;
  if (module === "potencia") return <PotenciaPage />;

  const item = fallbackData[module] ?? { title: "Experiência", description: "Módulo em construção." };

  return (
    <main className="modulePage">
      <Header />
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
