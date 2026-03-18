import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// CDN image URLs
const IMAGES = {
  heroSmile: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/hero-smile_99ee2167.jpg",
  dentistPortrait: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/dentist-portrait_a9f61fcd.jpg",
  smileCloseup: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/smile-closeup_7cdf2293.jpg",
  smileWoman: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/smile-woman_0bdde4ab.jpg",
  beforeAfter1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-1_74c23aa4.png",
  beforeAfter2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-2_f59bab21.jpg",
  beforeAfter3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-3_07995cb8.jpg",
  clinic: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/clinic_6630c3d3.jpg",
};

const WHATSAPP_NUMBER = "5511999999999";

function buildWhatsAppUrl(name?: string) {
  const msg = name
    ? `Olá, Dr. Igor! Me chamo ${name} e gostaria de agendar uma consulta para saber mais sobre as Facetas de Resina Composta.`
    : "Olá, Dr. Igor! Gostaria de agendar uma consulta para saber mais sobre as Facetas de Resina Composta.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// WhatsApp SVG Icon
function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// Star Rating
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// Section Header Component
function SectionHeader({ eyebrow, title, subtitle, light = false }: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center mb-16">
      {eyebrow && (
        <p className="font-body text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "var(--gold)" }}>
          {eyebrow}
        </p>
      )}
      <h2
        className="font-heading text-4xl md:text-5xl font-light mb-6 gold-underline"
        style={{ color: light ? "white" : "var(--charcoal)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-body text-lg max-w-2xl mx-auto mt-8 leading-relaxed"
          style={{ color: light ? "rgba(255,255,255,0.8)" : "oklch(0.45 0.01 30)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Lead Form Component
function LeadForm() {
  const [form, setForm] = useState({ fullName: "", whatsapp: "", city: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.leads.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success("Mensagem enviada! Redirecionando para o WhatsApp...");
      setTimeout(() => {
        window.open(data.whatsappUrl, "_blank");
      }, 1200);
    },
    onError: (err) => {
      toast.error("Erro ao enviar. Tente novamente.");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.whatsapp || !form.city) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    submitLead.mutate(form);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M20 6L9 17l-5-5"/>
            <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="font-heading text-3xl font-light mb-3" style={{ color: "var(--charcoal)" }}>
          Mensagem Enviada!
        </h3>
        <p className="font-body text-base" style={{ color: "oklch(0.45 0.01 30)" }}>
          Você será redirecionado para o WhatsApp em instantes...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "var(--charcoal)" }}>
          Nome Completo <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Seu nome completo"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.006 85)",
            background: "white",
            color: "var(--charcoal)",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "var(--charcoal)" }}>
          WhatsApp <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={form.whatsapp}
          onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.006 85)",
            background: "white",
            color: "var(--charcoal)",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "var(--charcoal)" }}>
          Cidade <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Sua cidade"
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.006 85)",
            background: "white",
            color: "var(--charcoal)",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "var(--charcoal)" }}>
          O que você deseja melhorar no seu sorriso? <span className="font-body text-xs" style={{ color: "oklch(0.55 0.01 30)" }}>(opcional)</span>
        </label>
        <select
          value={form.interest}
          onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.91 0.006 85)",
            background: "white",
            color: form.interest ? "var(--charcoal)" : "oklch(0.6 0.01 30)",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.91 0.006 85)"}
        >
          <option value="">Selecione uma opção</option>
          <option value="Facetas de Resina Composta">Facetas de Resina Composta</option>
          <option value="Clareamento Dental">Clareamento Dental</option>
          <option value="Design do Sorriso">Design do Sorriso</option>
          <option value="Outros procedimentos estéticos">Outros procedimentos estéticos</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitLead.isPending}
        className="btn-whatsapp w-full justify-center text-base py-4"
        style={{ opacity: submitLead.isPending ? 0.7 : 1 }}
      >
        <WhatsAppIcon size={22} />
        {submitLead.isPending ? "Enviando..." : "Quero Agendar Minha Consulta"}
      </button>
      <p className="font-body text-xs text-center" style={{ color: "oklch(0.55 0.01 30)" }}>
        🔒 Seus dados estão protegidos. Não enviamos spam.
      </p>
    </form>
  );
}

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ─── FLOATING WHATSAPP BUTTON ─── */}
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Agendar via WhatsApp"
        title="Fale conosco no WhatsApp"
      >
        <WhatsAppIcon size={28} className="text-white" />
      </a>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "linear-gradient(90deg, #2a2a2a 0%, #1a3a3a 100%)", height: "64px", display: "flex", alignItems: "center" }}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6" style={{ gap: "2rem" }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.62 0.09 75), oklch(0.72 0.12 75))" }}>
              <span className="font-heading text-white font-600 text-sm">IT</span>
            </div>
          </div>
          <div className="flex items-center gap-8 flex-1 justify-center">
            {[{ label: "Nosso espaço", href: "#about" }, { label: "Tratamentos", href: "#procedures" }, { label: "Sobre", href: "#about-doctor" }, { label: "Resultados", href: "#results" }, { label: "Diferenciais", href: "#differentials" }, { label: "Contato", href: "#contact" }, { label: "Localização", href: "#location" }].map((item) => (
              <a key={item.label} href={item.href} className="font-body text-sm font-500 transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>{item.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.521 17.674c-1.431 2.582-4.169 4.326-7.521 4.326-4.687 0-8.5-3.813-8.5-8.5s3.813-8.5 8.5-8.5c3.352 0 6.09 1.744 7.521 4.326.788-1.973 1.25-4.14 1.25-6.326 0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12c2.186 0 4.353-.462 6.326-1.25z"/></svg>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={IMAGES.heroSmile}
            alt="Sorriso perfeito"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.2) 100%)" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <p className="font-body text-xs font-700 tracking-[0.3em] uppercase mb-6" style={{ color: "var(--gold)" }}>
              ✦ Especialista em Odontologia Estética
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6">
              Transforme Seu Sorriso e{" "}
              <em className="not-italic" style={{ color: "var(--gold)" }}>Reconquiste</em>{" "}
              Sua Confiança
            </h1>
            <p className="font-body text-lg md:text-xl text-white/85 mb-10 leading-relaxed">
              Especialista em facetas de resina composta com aparência natural. Resultados imediatos que vão mudar a forma como você se vê e como o mundo te vê.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-base"
              >
                <WhatsAppIcon size={22} />
                Agendar no WhatsApp
              </a>
              <button
                onClick={scrollToForm}
                className="font-body font-700 text-sm tracking-widest uppercase px-8 py-4 rounded-full transition-all"
                style={{ border: "2px solid rgba(255,255,255,0.6)", color: "white", background: "transparent" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; }}
              >
                Saiba Mais
              </button>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-6 mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="text-center">
                <p className="font-heading text-3xl font-light text-white">500+</p>
                <p className="font-body text-xs text-white/70 tracking-wider uppercase">Sorrisos Transformados</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="font-heading text-3xl font-light text-white">8+</p>
                <p className="font-body text-xs text-white/70 tracking-wider uppercase">Anos de Experiência</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="font-heading text-3xl font-light text-white">100%</p>
                <p className="font-body text-xs text-white/70 tracking-wider uppercase">Satisfação Garantida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <p className="font-body text-xs text-white/60 tracking-widest uppercase">Descubra</p>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ─── ABOUT DR. IGOR TOTTI ─── */}
      <section id="sobre" className="py-24 px-6" style={{ background: "var(--cream)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Photo */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/5" }}>
                <img
                  src={IMAGES.dentistPortrait}
                  alt="Dr. Igor Totti"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)" }} />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-6 -right-6 rounded-2xl p-5 shadow-xl" style={{ background: "white", border: "1px solid oklch(0.93 0.005 85)" }}>
                <p className="font-heading text-3xl font-light" style={{ color: "var(--charcoal)" }}>8+</p>
                <p className="font-body text-xs tracking-wider uppercase" style={{ color: "var(--gold)" }}>Anos de Experiência</p>
              </div>
              {/* Gold accent */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20" style={{ background: "var(--gold)" }} />
            </div>

            {/* Text */}
            <div>
              <p className="font-body text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "var(--gold)" }}>
                ✦ Conheça o Profissional
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light mb-6" style={{ color: "var(--charcoal)" }}>
                Dr. Igor Totti
              </h2>
              <div className="section-divider mb-8" style={{ width: "60px", height: "2px", background: "linear-gradient(to right, var(--gold), transparent)" }} />

              <p className="font-body text-base leading-relaxed mb-6" style={{ color: "oklch(0.35 0.01 30)" }}>
                Olá! Sou o Dr. Igor Totti, cirurgião-dentista especializado em Odontologia Estética com foco em facetas de resina composta. Ao longo de mais de 8 anos de carreira, já transformei centenas de sorrisos — e cada um deles tem uma história única que me motiva a ir além.
              </p>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "oklch(0.35 0.01 30)" }}>
                Acredito que um sorriso bonito vai muito além da estética: ele reflete autoestima, confiança e bem-estar. Por isso, meu trabalho começa ouvindo você — seus desejos, suas inseguranças e o sorriso que você sempre sonhou ter.
              </p>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: "🎓", label: "Especialista em Odontologia Estética" },
                  { icon: "🏆", label: "Membro da Sociedade Brasileira de Dentística" },
                  { icon: "✨", label: "Especialista em Design do Sorriso" },
                  { icon: "📚", label: "Atualização constante em técnicas modernas" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid oklch(0.93 0.005 85)" }}>
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-body text-xs leading-snug" style={{ color: "oklch(0.35 0.01 30)" }}>{item.label}</p>
                  </div>
                ))}
              </div>

              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <WhatsAppIcon size={20} />
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCEDURE SECTION ─── */}
      <section id="procedimento" className="py-24 px-6" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="O Procedimento"
            title="Facetas de Resina Composta"
            subtitle="Uma solução elegante e acessível para transformar seu sorriso em uma única sessão, sem desgaste excessivo dos dentes naturais."
          />

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "⚡",
                title: "Resultados Imediatos",
                desc: "Em uma única sessão, você já sai com seu novo sorriso. Sem esperas, sem procedimentos longos. Transformação real no mesmo dia.",
              },
              {
                icon: "🌿",
                title: "Minimamente Invasivo",
                desc: "Preservamos ao máximo a estrutura natural dos seus dentes. O procedimento é delicado, confortável e não exige anestesia na maioria dos casos.",
              },
              {
                icon: "✨",
                title: "Aparência 100% Natural",
                desc: "As facetas são esculpidas artesanalmente para imitar a translucidez e textura dos dentes naturais. Ninguém vai saber que é faceta — só que você ficou mais bonito.",
              },
              {
                icon: "💎",
                title: "Design Personalizado",
                desc: "Cada sorriso é único. Planejamos juntos o formato, tamanho e cor ideal para harmonizar com seu rosto e personalidade.",
              },
              {
                icon: "🛡️",
                title: "Durabilidade",
                desc: "Com os cuidados adequados, as facetas de resina duram anos, mantendo a beleza e a função do seu sorriso.",
              },
              {
                icon: "💰",
                title: "Investimento Acessível",
                desc: "Comparadas às facetas de porcelana, as de resina oferecem resultados igualmente belos com um custo muito mais acessível.",
              },
            ].map((item, i) => (
              <div key={i} className="card-premium p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5" style={{ background: "linear-gradient(135deg, oklch(0.97 0.005 85), oklch(0.93 0.01 80))" }}>
                  {item.icon}
                </div>
                <h3 className="font-heading text-xl font-500 mb-3" style={{ color: "var(--charcoal)" }}>
                  {item.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.45 0.01 30)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA inline */}
          <div className="text-center">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Quero Transformar Meu Sorriso
            </a>
          </div>
        </div>
      </section>

      {/* ─── BEFORE & AFTER GALLERY ─── */}
      <section id="resultados" className="py-24 px-6" style={{ background: "var(--charcoal)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Resultados Reais"
            title="Antes & Depois"
            subtitle="Cada transformação é uma história de autoestima recuperada. Veja os resultados reais de nossos pacientes."
            light
          />

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { img: IMAGES.beforeAfter1, name: "Paciente 1", desc: "Facetas de Resina — Sorriso Harmônico" },
              { img: IMAGES.beforeAfter2, name: "Paciente 2", desc: "Design do Sorriso Completo" },
              { img: IMAGES.beforeAfter3, name: "Paciente 3", desc: "Fechamento de Diastema + Facetas" },
            ].map((item, i) => (
              <div key={i} className="before-after-card group cursor-pointer" style={{ aspectRatio: "4/3" }}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 z-10" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}>
                  <p className="font-body text-xs tracking-widest uppercase mb-1" style={{ color: "var(--gold)" }}>
                    {item.name}
                  </p>
                  <p className="font-body text-sm text-white font-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional gallery row */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="before-after-card" style={{ aspectRatio: "16/9" }}>
              <img src={IMAGES.smileWoman} alt="Resultado 4" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}>
                <p className="font-body text-xs tracking-widest uppercase mb-1" style={{ color: "var(--gold)" }}>Paciente 4</p>
                <p className="font-body text-sm text-white font-700">Facetas + Clareamento</p>
              </div>
            </div>
            <div className="before-after-card" style={{ aspectRatio: "16/9" }}>
              <img src={IMAGES.smileCloseup} alt="Resultado 5" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}>
                <p className="font-body text-xs tracking-widest uppercase mb-1" style={{ color: "var(--gold)" }}>Paciente 5</p>
                <p className="font-body text-sm text-white font-700">Remodelação Completa do Sorriso</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon size={20} />
              Quero um Sorriso Assim
            </a>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="depoimentos" className="py-24 px-6" style={{ background: "var(--cream)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Depoimentos"
            title="O Que Nossos Pacientes Dizem"
            subtitle="Histórias reais de pessoas que transformaram não apenas o sorriso, mas a confiança e a qualidade de vida."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Ana Carolina S.",
                city: "São Paulo, SP",
                text: "Sempre tive vergonha de sorrir em fotos. Depois das facetas com o Dr. Igor, não consigo parar de sorrir! O resultado ficou tão natural que minha família nem percebeu que fiz o procedimento — só notaram que eu estava mais bonita e confiante.",
                stars: 5,
                initial: "A",
              },
              {
                name: "Mariana Oliveira",
                city: "Campinas, SP",
                text: "Fiz pesquisa em vários dentistas antes de escolher o Dr. Igor. Desde a primeira consulta, ele me explicou tudo com clareza e me deixou muito à vontade. O resultado superou todas as minhas expectativas. Recomendo de olhos fechados!",
                stars: 5,
                initial: "M",
              },
              {
                name: "Fernanda Lima",
                city: "Santos, SP",
                text: "Tinha um diastema que me incomodava há anos. Em uma única sessão, o Dr. Igor resolveu tudo. O atendimento é humanizado, o ambiente é acolhedor e o resultado é simplesmente incrível. Valeu cada centavo!",
                stars: 5,
                initial: "F",
              },
              {
                name: "Juliana Mendes",
                city: "São Paulo, SP",
                text: "Fiz as facetas há 2 anos e continua perfeito! O Dr. Igor é muito cuidadoso e atencioso. Ele realmente se preocupa com o resultado e com o bem-estar do paciente. Já indiquei para toda a minha família.",
                stars: 5,
                initial: "J",
              },
              {
                name: "Patricia Souza",
                city: "Guarulhos, SP",
                text: "Estava insegura com o formato dos meus dentes. O Dr. Igor fez um planejamento personalizado e o resultado ficou exatamente como eu sonhava. Sorrindo muito mais agora! Obrigada, doutor!",
                stars: 5,
                initial: "P",
              },
              {
                name: "Camila Rodrigues",
                city: "São Bernardo, SP",
                text: "Profissional excepcional! Além de ser muito competente, o Dr. Igor tem uma sensibilidade enorme para entender o que o paciente quer. Meu sorriso ficou harmonioso, natural e lindo. Recomendo muito!",
                stars: 5,
                initial: "C",
              },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-heading font-600 text-white text-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, oklch(0.62 0.09 75), oklch(0.72 0.12 75))" }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-body text-sm font-700" style={{ color: "var(--charcoal)" }}>{t.name}</p>
                    <p className="font-body text-xs" style={{ color: "oklch(0.55 0.01 30)" }}>{t.city}</p>
                  </div>
                </div>
                <Stars count={t.stars} />
                <p className="font-body text-sm leading-relaxed mt-4" style={{ color: "oklch(0.35 0.01 30)" }}>
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIFFERENTIALS ─── */}
      <section id="diferenciais" className="py-24 px-6" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "var(--gold)" }}>
                ✦ Por Que Nos Escolher
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light mb-6" style={{ color: "var(--charcoal)" }}>
                O Que Nos Torna{" "}
                <em className="not-italic" style={{ color: "var(--gold)" }}>Diferentes</em>
              </h2>
              <div className="mb-8" style={{ width: "60px", height: "2px", background: "linear-gradient(to right, var(--gold), transparent)" }} />
              <p className="font-body text-base leading-relaxed mb-10" style={{ color: "oklch(0.4 0.01 30)" }}>
                Não somos apenas um consultório odontológico. Somos um espaço dedicado a transformar vidas através de sorrisos. Cada detalhe do nosso atendimento foi pensado para que você se sinta especial, acolhido e confiante.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: "💛",
                    title: "Atendimento Humanizado",
                    desc: "Você não é apenas um paciente — é uma pessoa com uma história. Ouvimos seus desejos e medos para criar a experiência mais acolhedora possível.",
                  },
                  {
                    icon: "🎨",
                    title: "Design do Sorriso Personalizado",
                    desc: "Cada sorriso é planejado individualmente, levando em conta a harmonia do seu rosto, a cor da sua pele e a sua personalidade.",
                  },
                  {
                    icon: "🔬",
                    title: "Técnicas Atualizadas",
                    desc: "Investimos constantemente em cursos e atualizações para oferecer sempre o que há de mais moderno em odontologia estética.",
                  },
                  {
                    icon: "🌟",
                    title: "Resultados Naturais",
                    desc: "Nossa filosofia é criar sorrisos que pareçam naturais — belos, mas que combinem com quem você é.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, oklch(0.97 0.005 85), oklch(0.93 0.01 80))" }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-500 mb-1" style={{ color: "var(--charcoal)" }}>{item.title}</h3>
                      <p className="font-body text-sm leading-relaxed" style={{ color: "oklch(0.45 0.01 30)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinic image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/5" }}>
                <img src={IMAGES.clinic} alt="Consultório Dr. Igor Totti" className="w-full h-full object-cover" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl p-5 shadow-xl" style={{ background: "white", border: "1px solid oklch(0.93 0.005 85)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                    <WhatsAppIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-body text-xs font-700" style={{ color: "var(--charcoal)" }}>Resposta Rápida</p>
                    <p className="font-body text-xs" style={{ color: "oklch(0.55 0.01 30)" }}>Atendimento via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LEAD CAPTURE FORM ─── */}
      <section id="agendar" className="py-24 px-6" style={{ background: "var(--cream)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <p className="font-body text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "var(--gold)" }}>
                ✦ Dê o Primeiro Passo
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-light mb-6" style={{ color: "var(--charcoal)" }}>
                Seu Novo Sorriso{" "}
                <em className="not-italic" style={{ color: "var(--gold)" }}>Começa Aqui</em>
              </h2>
              <div className="mb-8" style={{ width: "60px", height: "2px", background: "linear-gradient(to right, var(--gold), transparent)" }} />
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "oklch(0.4 0.01 30)" }}>
                Preencha o formulário ao lado e nossa equipe entrará em contato pelo WhatsApp para agendar sua consulta de avaliação gratuita. Sem compromisso, sem pressão — apenas o começo de uma transformação.
              </p>

              <div className="space-y-4">
                {[
                  "✅ Consulta de avaliação gratuita",
                  "✅ Planejamento personalizado do sorriso",
                  "✅ Atendimento humanizado e acolhedor",
                  "✅ Resultados em uma única sessão",
                  "✅ Técnicas modernas e minimamente invasivas",
                ].map((item, i) => (
                  <p key={i} className="font-body text-sm" style={{ color: "oklch(0.35 0.01 30)" }}>{item}</p>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div ref={formRef} className="card-premium p-8">
              <h3 className="font-heading text-2xl font-light mb-2" style={{ color: "var(--charcoal)" }}>
                Agende Sua Consulta
              </h3>
              <p className="font-body text-sm mb-6" style={{ color: "oklch(0.5 0.01 30)" }}>
                Preencha seus dados e falaremos com você em breve.
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: "var(--charcoal)" }}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ background: "var(--gold)", filter: "blur(80px)", transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: "var(--gold)", filter: "blur(80px)", transform: "translate(30%, 30%)" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="font-body text-xs font-700 tracking-[0.3em] uppercase mb-6" style={{ color: "var(--gold)" }}>
            ✦ Não Espere Mais
          </p>
          <h2 className="font-heading text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
            Seu Sorriso Dos Sonhos{" "}
            <em className="not-italic" style={{ color: "var(--gold)" }}>Te Espera</em>
          </h2>
          <p className="font-body text-lg text-white/80 mb-10 leading-relaxed">
            Cada dia que passa é um dia a menos sorrindo com confiança. Dê o primeiro passo agora — a transformação que você sempre quis está a uma mensagem de distância.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-base px-10 py-5"
            >
              <WhatsAppIcon size={24} />
              Quero Agendar Minha Consulta
            </a>
            <button
              onClick={scrollToForm}
              className="font-body font-700 text-sm tracking-widest uppercase px-8 py-5 rounded-full transition-all"
              style={{ border: "2px solid rgba(255,255,255,0.4)", color: "white", background: "transparent" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; }}
            >
              Preencher Formulário
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6" style={{ background: "oklch(0.1 0.01 30)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.62 0.09 75), oklch(0.72 0.12 75))" }}>
              <span className="font-heading text-white font-600 text-sm">IT</span>
            </div>
            <div>
              <p className="font-heading font-600 text-sm text-white leading-tight">Dr. Igor Totti</p>
              <p className="font-body text-xs leading-tight" style={{ color: "var(--gold)" }}>Odontologia Estética</p>
            </div>
          </div>
          <p className="font-body text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Dr. Igor Totti — Todos os direitos reservados. CRO-SP XXXXX
          </p>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-body text-sm font-700"
            style={{ color: "#25D366" }}
          >
            <WhatsAppIcon size={18} />
            Agendar Consulta
          </a>
        </div>
      </footer>

    </div>
  );
}
