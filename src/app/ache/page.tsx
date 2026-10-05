import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, HeartPulse, ShieldCheck, Leaf, Sparkles, UsersRound, Scale } from "lucide-react";

const values = [
  { label: "Apaixonados pela vida", Icon: HeartPulse },
  { label: "Inovamos para estar sempre à frente", Icon: Sparkles },
  { label: "Cuidamos dos nossos clientes", Icon: UsersRound },
  { label: "Inspiramos pelo talento e pela diversidade", Icon: UsersRound },
  { label: "Zelamos pela nossa reputação", Icon: ShieldCheck },
];

export default function AchePage() {
  return (
    <main className="acheLanding">
      <header className="experienceHeader acheHeader">
        <div className="experienceBrand">
          <Image src="/brand/ache-logo-tagline.webp" alt="Aché" width={115} height={69} className="acheHeaderLogo" priority />
          <strong>Programa PcD – Propagandista Trainee</strong>
        </div>
        <Link href="/home" className="backNexus"><ArrowLeft size={17}/>Voltar ao Nexus</Link>
      </header>

      <section className="acheHero landingSection">
        <div>
          <span className="sectionTag acheTag">O Aché</span>
          <h1>Mais vida<br/><em>para você.</em></h1>
          <p>Conheça a história, o propósito, a governança e os compromissos que sustentam a atuação do Aché.</p>
        </div>
        <div className="acheHeroArt" aria-hidden="true">
          <span className="acheBlob magentaBlob"/>
          <span className="acheBlob orangeBlob"/>
          <Image src="/brand/ache-logo-clean.webp" alt="Aché" width={220} height={92} className="acheHeroLogoClean" priority/>
        </div>
      </section>

      <div className="acheBodyLayout">
        <aside className="acheSectionNav" aria-label="Navegação da página Aché">
          <span className="acheMenuLabel">Navegue</span>
          <a href="#sobre"><span>01</span>Sobre o Aché</a>
          <a href="#governanca"><span>02</span>Governança</a>
          <a href="#conduta"><span>03</span>Código de Conduta</a>
          <a href="#sustentabilidade"><span>04</span>Sustentabilidade</a>
        </aside>

        <div className="acheBodyContent">
      <section id="sobre" className="landingSection acheAbout">
        <div className="sectionHeading">
          <span className="acheSectionNumber">01</span>
          <span className="sectionTag acheTag">Sobre o Aché</span>
          <h2>Uma trajetória brasileira construída com inovação, saúde e confiança.</h2>
          <p>O Aché está entre as cinco maiores empresas farmacêuticas do Brasil, atua em mais de 157 classes terapêuticas e 30 especialidades médicas, possui quatro plantas industriais e mais de 6 mil colaboradores.</p>
        </div>
        <div className="acheStats">
          <article><strong>157+</strong><span>classes terapêuticas</span></article>
          <article><strong>30</strong><span>especialidades médicas</span></article>
          <article><strong>4</strong><span>plantas industriais</span></article>
          <article><strong>6 mil+</strong><span>colaboradores</span></article>
        </div>
        <div className="acheValuesGrid">
          {values.map(({label, Icon}) => <article key={label}><Icon size={25}/><strong>{label}</strong></article>)}
        </div>
      </section>

      <section id="governanca" className="landingSection acheGovernance">
        <div className="sectionHeading">
          <span className="acheSectionNumber light">02</span>
          <span className="sectionTag acheTag lightTag">Governança</span>
          <h2>Ética e transparência como pilares do negócio.</h2>
          <p>A governança corporativa parte da construção de relações sólidas, transparentes e responsáveis. Ética, integridade e conformidade orientam decisões e fortalecem a confiança.</p>
        </div>
        <div className="governanceGrid">
          <article><Building2 size={28}/><strong>Estrutura de Governança</strong></article>
          <article><Scale size={28}/><strong>Ética</strong></article>
          <article><ShieldCheck size={28}/><strong>Programa de Integridade</strong></article>
          <article><ShieldCheck size={28}/><strong>Concorrencial</strong></article>
        </div>
        <div className="acheMilestones">
          <div><span>1998</span><p>Participação na criação do Instituto Ethos.</p></div>
          <div><span>2004</span><p>Primeira publicação do Código de Conduta.</p></div>
          <div><span>Hoje</span><p>Ética e conformidade integradas à tomada de decisão.</p></div>
        </div>
      </section>

      <section id="conduta" className="landingSection acheConduct">
        <div className="sectionHeading">
          <span className="acheSectionNumber">03</span>
          <span className="sectionTag acheTag">Código de Conduta Corporativa</span>
          <h2>Fazer o certo — e do jeito certo.</h2>
          <p>O Código de Conduta funciona como guia de comportamento para colaboradores, lideranças, parceiros e demais públicos que se relacionam com o Aché.</p>
        </div>
        <div className="conductFeature">
          <article><ShieldCheck size={36}/><h3>Integridade</h3><p>Ética, transparência e responsabilidade.</p></article>
          <article><UsersRound size={36}/><h3>Diversidade e inclusão</h3><p>Respeito às diferentes experiências, competências e identidades.</p></article>
          <article><Scale size={36}/><h3>Governança</h3><p>Regras claras, conformidade e proteção da reputação.</p></article>
          <article><Leaf size={36}/><h3>Olhar ESG</h3><p>Aspectos ambientais, sociais e de governança integrados às decisões.</p></article>
        </div>
        <div className="conductQuote"><strong>Somos Magenta</strong><p>Paixão pela vida, inovação, cuidado com clientes, valorização do talento e da diversidade e compromisso com a reputação.</p></div>
      </section>

      <section id="sustentabilidade" className="landingSection acheSustainability">
        <div className="sectionHeading">
          <span className="acheSectionNumber light">04</span>
          <span className="sectionTag acheTag lightTag">Sustentabilidade</span>
          <h2>Mais pacientes. Mais inovação. Mais impacto. Mais futuro.</h2>
          <p>O relatório anual mais recente coloca o paciente no centro das decisões e conecta ciência, inovação, acesso e impacto positivo.</p>
        </div>
        <div className="sustainabilityGrid">
          <article><HeartPulse size={27}/><strong>Mais pacientes</strong><span>Conectar inovação científica à jornada de saúde.</span></article>
          <article><Sparkles size={27}/><strong>Mais inovação</strong><span>Transformar conhecimento em soluções relevantes.</span></article>
          <article><Leaf size={27}/><strong>Mais impacto</strong><span>Gerar valor para sociedade e meio ambiente.</span></article>
          <article><Building2 size={27}/><strong>Mais futuro</strong><span>Preparar a companhia para novos ciclos de crescimento.</span></article>
        </div>
        <div className="acheFuture"><strong>100 mi</strong><span>pessoas por ano até 2030</span></div>
      </section>
        </div>
      </div>
    </main>
  );
}
