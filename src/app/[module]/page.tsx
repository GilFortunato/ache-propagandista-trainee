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
          src="/brand/ache-logo-tagline.webp"
          alt="Aché"
          width={115}
          height={69}
          className="acheHeaderLogo"
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
  const companyJourney = [
    { n: "01", title: "Entender", text: "Criar repertório digital, reduzir barreiras e identificar onde tecnologia e IA podem apoiar o trabalho.", accent: "Inic.IA + Letramento Digital" },
    { n: "02", title: "Aplicar", text: "Levar IA para processos, decisões e rotinas reais de RH, liderança e operações.", accent: "AI for Business" },
    { n: "03", title: "Construir", text: "Transformar desafios do negócio em protótipos e soluções funcionais desenvolvidas pelos próprios times.", accent: "AI Builders" },
  ];

  const careerBenefits = [
    { icon: Target, title: "Clareza de caminho", text: "Aprender deixa de ser uma coleção de cursos e passa a fazer sentido dentro de uma trajetória profissional." },
    { icon: BrainCircuit, title: "Habilidades do futuro", text: "Competências digitais e IA entram no repertório de forma prática, acessível e conectada ao trabalho." },
    { icon: Rocket, title: "Aprender fazendo", text: "Projetos, mentorias e desafios reais transformam conhecimento em experiência e confiança para aplicar." },
    { icon: Network, title: "Mais possibilidades", text: "Desenvolvimento, empregabilidade, mobilidade e conexão com oportunidades caminham juntos." },
  ];

  const businessBenefits = [
    "Capacitar públicos técnicos e não técnicos sem separar aprendizagem da realidade do negócio.",
    "Aumentar autonomia e produtividade antes de escalar soluções mais complexas.",
    "Criar capacidade interna para aplicar IA em processos, decisões e rotinas.",
    "Conectar desenvolvimento de talentos, diversidade, inovação e geração de valor.",
  ];

  const ecosystem = [
    { icon: GraduationCap, title: "Aquisição + formação", text: "Education Recruiting conecta atração, seleção, desenvolvimento e contratação em uma única jornada." },
    { icon: Lightbulb, title: "Habilidades digitais", text: "Letramento Digital e Inic.IA criam a base para novas formas de trabalho e adoção consciente de tecnologia." },
    { icon: BriefcaseBusiness, title: "IA aplicada ao negócio", text: "AI for Business leva IA para RH, liderança e operações usando problemas reais das áreas." },
    { icon: Rocket, title: "Construção de soluções", text: "AI Builders desenvolve protótipos funcionais e capacidade interna de inovação." },
    { icon: Sparkles, title: "Impacto + inclusão", text: "Potenc.IA conecta formação em IA, talentos, empregabilidade e agenda de diversidade." },
    { icon: Gauge, title: "Escala e mensuração", text: "Prosper Sprints organiza jornadas, assessments, projetos, mentorias e acompanhamento de evolução." },
  ];

  return (
    <main className="experiencePage prosperLanding prosperStory">
      <Header />

      <section className="prosperStoryHero">
        <div className="prosperStoryHeroCopy">
          <span className="prosperStoryEyebrow">PROSPER DIGITAL SKILLS</span>
          <h1>Quando pessoas desenvolvem novas habilidades, <em>o negócio também evolui.</em></h1>
          <p>
            A Prosper é a frente de desenvolvimento de habilidades digitais para o futuro do trabalho da Share People Hub.
            Mais do que ensinar ferramentas, estruturamos jornadas que ajudam pessoas a crescer e empresas a transformar
            aprendizagem em autonomia, inovação e geração de valor.
          </p>
          <a href="#prosper-story" className="prosperStoryCta">
            Conheça essa jornada <ArrowRight size={18}/>
          </a>
        </div>

        <div className="prosperStoryVisual" aria-hidden="true">
          <div className="prosperStoryHalo haloOne" />
          <div className="prosperStoryHalo haloTwo" />
          <div className="prosperStoryCore"><span>PROSPER</span><small>DIGITAL SKILLS</small></div>
          <div className="prosperStoryNode nodePeople"><UsersRound/><span>Pessoas</span></div>
          <div className="prosperStoryNode nodeSkills"><BrainCircuit/><span>Skills</span></div>
          <div className="prosperStoryNode nodeBusiness"><Building2/><span>Negócio</span></div>
        </div>
      </section>

      <section id="prosper-story" className="prosperNarrativeSection">
        <div className="prosperNarrativeNumber">01</div>
        <div className="prosperNarrativeCopy">
          <span>O PONTO DE PARTIDA</span>
          <h2>O trabalho mudou. E desenvolver pessoas também precisa mudar.</h2>
          <p>
            Novas ferramentas surgem o tempo todo. A IA acelera processos, altera funções e cria outras formas de decidir,
            comunicar e produzir. Só disponibilizar tecnologia, porém, não garante transformação.
          </p>
          <p>
            A Prosper entra justamente nesse espaço: tornar novas habilidades compreensíveis, aplicáveis e conectadas
            ao contexto real de quem aprende — seja uma pessoa construindo sua carreira, seja uma empresa preparando
            seus times para o que vem pela frente.
          </p>
        </div>
      </section>

      <section className="prosperCareerSection">
        <div className="prosperSectionHeading">
          <span>PARA QUEM ESTÁ CONSTRUINDO UMA CARREIRA</span>
          <h2>Desenvolvimento que aumenta repertório, autonomia e possibilidade.</h2>
          <p>
            A lógica é simples: aprender precisa ajudar a pessoa a fazer algo que antes não fazia, enxergar oportunidades
            que antes não enxergava e tomar decisões profissionais com mais segurança.
          </p>
        </div>
        <div className="prosperCareerGrid">
          {careerBenefits.map(({icon: Icon,title,text}) => (
            <article key={title}>
              <span><Icon size={25}/></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="prosperBridgeSection">
        <div className="prosperBridgeQuote">
          <span>MAS EXISTE UM SEGUNDO LADO DESSA HISTÓRIA</span>
          <h2>Empresas não precisam apenas de novas tecnologias. Precisam de pessoas preparadas para usá-las bem.</h2>
        </div>
        <div className="prosperBridgeText">
          <p>
            É aqui que desenvolvimento de carreira e estratégia de negócio se encontram. Quando a capacitação parte
            de desafios reais, a empresa não só atualiza conhecimentos: cria capacidade interna.
          </p>
          <p>
            Times ganham mais autonomia, aprendem a identificar oportunidades, aplicam IA em processos e conseguem
            evoluir de consumidores de tecnologia para protagonistas da transformação.
          </p>
        </div>
      </section>

      <section className="prosperBusinessSection">
        <div className="prosperSectionHeading">
          <span>PARA EMPRESAS</span>
          <h2>Capacitar o time pode ser parte da estratégia — não um evento isolado.</h2>
          <p>
            A Prosper estrutura programas personalizados para diferentes níveis de maturidade, áreas e objetivos,
            com conteúdo aplicado ao contexto real, formatos flexíveis e acompanhamento da evolução.
          </p>
        </div>

        <div className="prosperBusinessLayout">
          <div className="prosperBusinessList">
            {businessBenefits.map((item,i)=><div key={item}><span>0{i+1}</span><p>{item}</p></div>)}
          </div>
          <aside className="prosperBusinessCallout">
            <span>O QUE MUDA NA PRÁTICA</span>
            <strong>Aprender deixa de ser consumo de conteúdo e passa a gerar comportamento, projeto e decisão.</strong>
            <p>O foco está em aplicação, mentoria, problemas reais da área, assessment e evolução de maturidade.</p>
          </aside>
        </div>
      </section>

      <section className="prosperMaturitySection">
        <div className="prosperSectionHeading">
          <span>UMA JORNADA DE MATURIDADE</span>
          <h2>Do entendimento à geração de valor.</h2>
          <p>
            A empresa não precisa começar construindo soluções complexas. A jornada pode avançar no ritmo certo,
            acompanhando a maturidade dos times.
          </p>
        </div>
        <div className="prosperMaturityGrid">
          {companyJourney.map((item)=>(
            <article key={item.n}>
              <span className="prosperMaturityNumber">{item.n}</span>
              <small>{item.accent}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="prosperEcosystemStory">
        <div className="prosperSectionHeading">
          <span>ECOSSISTEMA PROSPER</span>
          <h2>Uma solução não serve para todo mundo. Por isso o ecossistema é modular.</h2>
          <p>
            Da atração de talentos ao desenvolvimento de habilidades, da sensibilização em IA à construção de soluções,
            os programas podem ser combinados conforme o desafio e o nível de maturidade.
          </p>
        </div>
        <div className="prosperEcosystemStoryGrid">
          {ecosystem.map(({icon:Icon,title,text})=>(
            <article key={title}>
              <span><Icon size={26}/></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="prosperScaleSection">
        <div className="prosperScaleCopy">
          <span>PROSPER SPRINTS</span>
          <h2>Aprendizagem com estrutura, acompanhamento e escala.</h2>
          <p>
            A tecnologia funciona como um hub de entrega e performance: organiza trilhas, assessments, conteúdo assíncrono,
            projetos, mentorias e dados de evolução. Isso permite manter consistência tanto em grupos pequenos quanto
            em programas de grande escala.
          </p>
        </div>
        <div className="prosperScaleMetrics">
          <div><strong>10 → 10.000</strong><span>pessoas com a mesma lógica de jornada</span></div>
          <div><strong>Dados</strong><span>para acompanhar progresso e maturidade</span></div>
          <div><strong>Escala</strong><span>sem perder estrutura e acompanhamento</span></div>
        </div>
      </section>

      <section className="prosperSoftSellSection">
        <div>
          <span>QUANDO DESENVOLVIMENTO E NEGÓCIO ANDAM JUNTOS</span>
          <h2>Uma empresa preparada para o futuro começa por pessoas preparadas para construí-lo.</h2>
          <p>
            Programas de desenvolvimento podem apoiar produtividade, inovação, diversidade, formação de novos talentos
            e transformação cultural ao mesmo tempo — desde que sejam desenhados a partir da realidade de cada organização.
          </p>
        </div>
        <aside>
          <strong>É essa ponte que a Prosper constrói.</strong>
          <p>Pessoas aprendem. Times aplicam. A organização evolui.</p>
        </aside>
      </section>

      <section className="prosperClientsStory">
        <span>EMPRESAS QUE JÁ CONSTRUÍRAM JORNADAS COM A PROSPER</span>
        <div>
          {["AB InBev","CI&T","TotalPass","John Deere","Citi","Alelo","Bosch","Vivo","BNP Paribas","Itaú","Localiza","Suzano","RD","RDI","Pismo","Serasa Experian","Webmotors"].map((name)=><span key={name}>{name}</span>)}
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
