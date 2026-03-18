import { useState } from "react";
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
function SectionHeader({ eyebrow, title, subtitle, light = true }: {
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
        className="font-heading text-4xl md:text-5xl font-light mb-6"
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
        <h3 className="font-heading text-3xl font-light mb-3" style={{ color: "white" }}>
          Mensagem Enviada!
        </h3>
        <p className="font-body text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
          Você será redirecionado para o WhatsApp em instantes...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "white" }}>
          Nome Completo <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Seu nome completo"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.2 0.01 0)",
            background: "oklch(0.15 0.01 0)",
            color: "white",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.2 0.01 0)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "white" }}>
          WhatsApp <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={form.whatsapp}
          onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.2 0.01 0)",
            background: "oklch(0.15 0.01 0)",
            color: "white",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.2 0.01 0)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "white" }}>
          Cidade <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Sua cidade"
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.2 0.01 0)",
            background: "oklch(0.15 0.01 0)",
            color: "white",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.2 0.01 0)"}
          required
        />
      </div>
      <div>
        <label className="font-body text-sm font-700 mb-2 block" style={{ color: "white" }}>
          Interesse (Opcional)
        </label>
        <input
          type="text"
          placeholder="Ex: Facetas de Resina Composta"
          value={form.interest}
          onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid oklch(0.2 0.01 0)",
            background: "oklch(0.15 0.01 0)",
            color: "white",
          }}
          onFocus={e => e.target.style.borderColor = "var(--gold)"}
          onBlur={e => e.target.style.borderColor = "oklch(0.2 0.01 0)"}
        />
      </div>
      <button
        type="submit"
        disabled={submitLead.isPending}
        className="btn-gold w-full"
      >
        {submitLead.isPending ? "Enviando..." : "Agendar Consulta"}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.08 0.01 0)" }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ background: "rgba(15, 15, 15, 0.8)" }}>
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-heading font-700 text-lg" style={{ background: "var(--gold)", color: "oklch(0.1 0 0)" }}>
              IT
            </div>
            <div>
              <p className="font-heading font-700 text-white">Dr. Igor Totti</p>
              <p className="font-body text-xs" style={{ color: "var(--gold)" }}>Odontologia Estética</p>
            </div>
          </div>
          <a href={buildWhatsAppUrl()} className="btn-whatsapp">
            <WhatsAppIcon size={20} />
            AGENDAR CONSULTA
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: `url(${IMAGES.heroSmile}) center/cover` }}></div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0.5) 50%, rgba(15,15,15,0.7) 100%)" }}></div>
        
        <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <p className="font-body text-sm font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "var(--gold)" }}>
                ✨ ESPECIALISTA EM ODONTOLOGIA ESTÉTICA
              </p>
              <h1 className="font-heading text-5xl md:text-6xl font-light leading-tight text-white mb-6">
                Transforme Seu Sorriso e Reconquiste Sua <span style={{ color: "var(--gold)" }}>Confiança</span>
              </h1>
            </div>
            <p className="font-body text-lg leading-relaxed text-white/80">
              Especialista em facetas de resina composta com aparência natural. Resultados imediatos que vão mudar a forma como você se vê e como o mundo te vê.
            </p>
            <div className="flex gap-4 pt-4">
              <a href={buildWhatsAppUrl()} className="btn-whatsapp">
                <WhatsAppIcon size={20} />
                Agendar no WhatsApp
              </a>
              <button className="btn-outline-gold">
                Saiba Mais
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative w-full aspect-square">
              <img src={IMAGES.dentistPortrait} alt="Dr. Igor Totti" className="w-full h-full object-cover rounded-2xl" style={{ boxShadow: "0 20px 60px rgba(212, 165, 116, 0.2)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24" style={{ background: "oklch(0.1 0.01 0)" }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <img src={IMAGES.smileCloseup} alt="Sorriso Perfeito" className="w-full rounded-2xl" style={{ boxShadow: "0 20px 60px rgba(212, 165, 116, 0.2)" }} />
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <SectionHeader
                eyebrow="Conheça o Especialista"
                title="Dr. Igor Totti"
                light={true}
              />
              <div className="space-y-6">
                <p className="font-body text-lg leading-relaxed text-white/80">
                  Com mais de 15 anos de experiência em odontologia estética, o Dr. Igor Totti é especialista em facetas de resina composta — a solução perfeita para quem busca resultados naturais e imediatos.
                </p>
                <p className="font-body text-lg leading-relaxed text-white/80">
                  Seu compromisso é transformar sorrisos com técnicas atualizadas, atendimento humanizado e resultados que excedem expectativas. Cada paciente recebe um design de sorriso personalizado, respeitando sua individualidade e características faciais.
                </p>
                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="font-heading text-4xl font-light" style={{ color: "var(--gold)" }}>15+</p>
                    <p className="font-body text-sm text-white/60">Anos de Experiência</p>
                  </div>
                  <div>
                    <p className="font-heading text-4xl font-light" style={{ color: "var(--gold)" }}>2000+</p>
                    <p className="font-body text-sm text-white/60">Pacientes Satisfeitos</p>
                  </div>
                  <div>
                    <p className="font-heading text-4xl font-light" style={{ color: "var(--gold)" }}>100%</p>
                    <p className="font-body text-sm text-white/60">Satisfação Garantida</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className="py-24" style={{ background: "oklch(0.08 0.01 0)" }}>
        <div className="container">
          <SectionHeader
            eyebrow="Tratamentos"
            title="Facetas de Resina Composta"
            subtitle="Transformação imediata com a mais avançada tecnologia em odontologia estética"
            light={true}
          />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Resultados Imediatos", desc: "Veja a transformação no mesmo dia da consulta" },
              { title: "Minimamente Invasivo", desc: "Preserva a estrutura natural do seu dente" },
              { title: "Aparência Natural", desc: "Resultado que se integra perfeitamente ao seu sorriso" },
              { title: "Durável", desc: "Resultados que duram anos com cuidados simples" },
              { title: "Design Personalizado", desc: "Cada sorriso é único e pensado para você" },
              { title: "Sem Dor", desc: "Procedimento confortável e seguro" },
            ].map((item, i) => (
              <div key={i} className="card-premium p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(212, 165, 116, 0.1)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-light text-white">{item.title}</h3>
                <p className="font-body text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-24" style={{ background: "oklch(0.1 0.01 0)" }}>
        <div className="container">
          <SectionHeader
            eyebrow="Resultados Reais"
            title="Antes & Depois"
            subtitle="Transformações que falam por si"
            light={true}
          />
          <div className="grid md:grid-cols-3 gap-8">
            {[IMAGES.beforeAfter1, IMAGES.beforeAfter2, IMAGES.beforeAfter3].map((img, i) => (
              <div key={i} className="before-after-card h-96">
                <img src={img} alt={`Resultado ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24" style={{ background: "oklch(0.08 0.01 0)" }}>
        <div className="container">
          <SectionHeader
            eyebrow="Prova Social"
            title="O que Nossos Pacientes Dizem"
            light={true}
          />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Maria Silva", text: "Meu sorriso mudou completamente! Resultado imediato e natural. Recomendo demais!", stars: 5 },
              { name: "João Santos", text: "Profissional excelente, atendimento impecável. Estou muito feliz com o resultado.", stars: 5 },
              { name: "Ana Costa", text: "Finalmente tenho confiança para sorrir. Obrigada Dr. Igor!", stars: 5 },
              { name: "Carlos Oliveira", text: "Procedimento rápido, sem dor e resultado perfeito. Muito satisfeito!", stars: 5 },
              { name: "Patricia Gomes", text: "Melhor decisão que tomei. Meu sorriso ficou lindo e natural.", stars: 5 },
              { name: "Roberto Alves", text: "Profissionalismo do início ao fim. Resultado além das expectativas!", stars: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="testimonial-card">
                <Stars count={testimonial.stars} />
                <p className="font-body text-sm leading-relaxed text-white/80 my-4">"{testimonial.text}"</p>
                <p className="font-heading font-light text-white">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-24" style={{ background: "oklch(0.1 0.01 0)" }}>
        <div className="container">
          <SectionHeader
            eyebrow="Por Que Nos Escolher"
            title="Nossos Diferenciais"
            light={true}
          />
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: "Atendimento Humanizado", desc: "Cada paciente é único e merece atenção especial" },
              { title: "Resultados Naturais", desc: "Facetas que se integram perfeitamente ao seu sorriso" },
              { title: "Design Personalizado", desc: "Seu sorriso é pensado especialmente para você" },
              { title: "Técnicas Atualizadas", desc: "Sempre em dia com as melhores práticas da odontologia" },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--gold)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.1 0 0)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-light text-white mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: "oklch(0.08 0.01 0)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: `url(${IMAGES.clinic}) center/cover` }}></div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(15,15,15,0.8) 100%)" }}></div>
        
        <div className="container relative z-10 text-center space-y-8 max-w-2xl mx-auto">
          <h2 className="font-heading text-5xl font-light text-white">
            Seu Novo Sorriso Começa <span style={{ color: "var(--gold)" }}>Aqui</span>
          </h2>
          <p className="font-body text-lg text-white/80">
            Não espere mais para ter o sorriso que você sempre sonhou. Agende sua consulta hoje e descubra como as facetas de resina composta podem transformar sua vida.
          </p>
          <a href={buildWhatsAppUrl()} className="btn-whatsapp inline-flex">
            <WhatsAppIcon size={20} />
            Quero Agendar Minha Consulta
          </a>
        </div>
      </section>

      {/* Lead Form Section */}
      <section className="py-24" style={{ background: "oklch(0.1 0.01 0)" }}>
        <div className="container max-w-2xl">
          <SectionHeader
            eyebrow="Fale Conosco"
            title="Solicite Sua Avaliação"
            subtitle="Preencha o formulário abaixo e entraremos em contato via WhatsApp"
            light={true}
          />
          <div className="card-premium p-12">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={buildWhatsAppUrl()}
        className="floating-whatsapp"
        title="Fale conosco no WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: "oklch(0.2 0.01 0)", background: "oklch(0.08 0.01 0)" }}>
        <div className="container text-center">
          <p className="font-body text-sm text-white/60">
            © 2026 Dr. Igor Totti - Odontologia Estética. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
