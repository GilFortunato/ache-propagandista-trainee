import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  HeartPulse,
  Sparkles,
  UsersRound,
  ShieldCheck,
  Building2,
  Stethoscope,
  Dumbbell,
  GraduationCap,
  Utensils,
  Bus,
} from "lucide-react";

const values = [
  { label: "Somos apaixonados pela vida", Icon: HeartPulse },
  { label: "Inovamos para estar sempre à frente", Icon: Sparkles },
  { label: "Cuidamos dos nossos clientes", Icon: UsersRound },
  { label: "Inspiramos pelo talento e pela diversidade", Icon: UsersRound },
  { label: "Zelamos pela nossa reputação", Icon: ShieldCheck },
];

export default function VagasPage() {
  return (
    <main className="vagasLanding">
      <header className="experienceHeader vagasHeader">
        <div className="experienceBrand">
          <Link href="/home" aria-label="Ir para Home" className="headerLogoLink">
            <Image
              src="/brand/ache-logo-tagline.webp"
              alt="Aché"
              width={115}
              height={69}
              className="acheHeaderLogo"
              priority
            />
          </Link>
          <strong>Programa PcD – Propagandista Trainee</strong>
        </div>
        <Link href="/home" className="backNexus">
          <ArrowLeft size={17} />
          Voltar ao Nexus
        </Link>
      </header>

      <section className="landingSection vagasHero">
        <div className="vagasHeroCopy">
          <span className="sectionTag acheTag">Carreiras</span>
          <h1>Construa sua jornada na <span>Aché</span>.</h1>
          <p>
            Um ambiente diverso e inclusivo, com espaço para aprendizagem, desenvolvimento
            e reconhecimento de talentos que constroem resultados e reputação.
          </p>
        </div>
      </section>

      <section className="vagasEntry landingSection">
        <div className="vagasCards">
          <a
            className="vagaChoice active"
            href="https://vagasache.gupy.io/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="vagaChoiceIcon"><BriefcaseBusiness size={30} /></div>
            <span className="vagaChoiceTag">Oportunidades abertas</span>
            <h2>Vagas Aché</h2>
            <p>
              Consulte as oportunidades disponíveis e encontre vagas alinhadas ao seu perfil.
            </p>
            <div className="vagaChoiceCta">Ver vagas <ArrowRight size={18} /></div>
          </a>

          <article className="vagaChoice exclusive">
            <div className="vagaChoiceIcon"><UsersRound size={30} /></div>
            <span className="vagaChoiceTag">Programa exclusivo</span>
            <h2>Vaga Exclusiva Programa</h2>
            <p>
              Espaço reservado para oportunidades exclusivas do Programa PcD – Propagandista Trainee.
            </p>
            <div className="vagaChoiceCta disabled">Disponível em breve</div>
          </article>
        </div>
      </section>

      <section className="landingSection generationSection">
        <div className="sectionHeading">
          <span className="sectionTag acheTag">Geração Aché</span>
          <h2>Somos Aché. Somos potência.</h2>
          <p>
            A experiência de carreira valoriza desenvolvimento, alta performance e um ambiente
            colaborativo, diverso e inclusivo.
          </p>
        </div>

        <div className="acheValuesGrid vagasValues">
          {values.map(({ label, Icon }) => (
            <article key={label}>
              <Icon size={25} />
              <strong>{label}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection vagasNumbers">
        <div className="sectionHeading">
          <span className="sectionTag acheTag">Aché em números</span>
          <h2>Uma estrutura nacional com força de vendas relevante.</h2>
        </div>

        <div className="acheStats">
          <article><strong>Top 5</strong><span>entre as maiores farmacêuticas do Brasil</span></article>
          <article><strong>6 mil+</strong><span>colaboradores</span></article>
          <article><strong>Uma das maiores</strong><span>forças de vendas do setor</span></article>
          <article><strong>4</strong><span>unidades no Brasil</span></article>
        </div>
      </section>

      <section className="landingSection vagasBenefits">
        <div className="sectionHeading">
          <span className="sectionTag acheTag">Benefícios</span>
          <h2>Uma jornada pensada para saúde, bem-estar e desenvolvimento.</h2>
          <p>
            Os benefícios variam conforme área, modelo de trabalho e unidade, mas a proposta
            combina cuidado com a saúde, qualidade de vida, desenvolvimento e conveniência.
          </p>
        </div>

        <div className="benefitGrid">
          <article>
            <Stethoscope size={28} />
            <h3>Saúde</h3>
            <p>Assistência médica e odontológica, medicamentos, exames preventivos e iniciativas de cuidado.</p>
          </article>
          <article>
            <Dumbbell size={28} />
            <h3>Bem-estar</h3>
            <p>Wellhub, programa de saúde mental e apoio a colaboradoras e famílias.</p>
          </article>
          <article>
            <GraduationCap size={28} />
            <h3>Desenvolvimento</h3>
            <p>Parcerias e convênios com bolsas e descontos educacionais.</p>
          </article>
          <article>
            <Utensils size={28} />
            <h3>Dia a dia</h3>
            <p>Restaurante ou vale-refeição, vale-alimentação e outras facilidades.</p>
          </article>
          <article>
            <Bus size={28} />
            <h3>Mobilidade</h3>
            <p>Vale-transporte, estacionamento ou fretado, conforme elegibilidade.</p>
          </article>
          <article>
            <Building2 size={28} />
            <h3>Flexibilidade</h3>
            <p>Benefícios como auxílio home office e Short Friday podem variar conforme a função.</p>
          </article>
        </div>
      </section>

      <section className="landingSection diversitySection">
        <div className="sectionHeading">
          <span className="sectionTag acheTag">Diversidade, Equidade & Inclusão</span>
          <h2>Inclusão como parte da cultura.</h2>
          <p>
            O Aché apresenta diversidade, equidade e inclusão como pilares da cultura e cita
            iniciativas de governança, letramento, grupos de afinidade e uso do nome social
            desde o recrutamento e seleção.
          </p>
        </div>

        <div className="diversityBanner">
          <div>
            <UsersRound size={34} />
            <strong>Mais que contratar, queremos incluir.</strong>
          </div>
          <p>
            A proposta do programa se conecta diretamente a esse compromisso de ampliar
            oportunidades e criar uma experiência de carreira mais inclusiva.
          </p>
        </div>
      </section>
    </main>
  );
}
