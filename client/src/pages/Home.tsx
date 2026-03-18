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
function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// Star Rating
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex" style={{ gap: "0.25rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--tan)" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
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
      <div className="text-center" style={{ padding: "3rem 0" }}>
        <div className="flex items-center justify-center" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #25D366, #128C7E)", margin: "0 auto 1.5rem" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M20 6L9 17l-5-5"/>
            <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ fontSize: "1.75rem", color: "var(--tan)", marginBottom: "0.5rem" }}>
          Mensagem Enviada!
        </h3>
        <p style={{ color: "var(--cream)", opacity: 0.8 }}>
          Você será redirecionado para o WhatsApp em instantes...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--cream)", fontSize: "0.9rem", fontWeight: "600" }}>
          Nome Completo <span style={{ color: "var(--tan)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Seu nome completo"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          required
        />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--cream)", fontSize: "0.9rem", fontWeight: "600" }}>
          WhatsApp <span style={{ color: "var(--tan)" }}>*</span>
        </label>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={form.whatsapp}
          onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          required
        />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--cream)", fontSize: "0.9rem", fontWeight: "600" }}>
          Cidade <span style={{ color: "var(--tan)" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Sua cidade"
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          required
        />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--cream)", fontSize: "0.9rem", fontWeight: "600" }}>
          Interesse (Opcional)
        </label>
        <input
          type="text"
          placeholder="Ex: Facetas de Resina Composta"
          value={form.interest}
          onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
        />
      </div>
      <button
        type="submit"
        disabled={submitLead.isPending}
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {submitLead.isPending ? "Enviando..." : "Agendar Consulta"}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Navigation */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(59, 47, 47, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(214, 188, 166, 0.1)"
      }}>
        <div className="container flex justify-between items-center" style={{ height: "80px" }}>
          <div className="flex items-center" style={{ gap: "1rem" }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "var(--tan)",
              color: "var(--dark-brown)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: "600"
            }}>
              IT
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: "600" }}>Dr. Igor Totti</p>
              <p style={{ fontSize: "0.75rem", color: "var(--tan)" }}>Odontologia Estética</p>
            </div>
          </div>
          <a href={buildWhatsAppUrl()} className="btn btn-whatsapp">
            <WhatsAppIcon size={18} />
            AGENDAR CONSULTA
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: "120px",
        paddingBottom: "80px",
        background: "linear-gradient(135deg, rgba(59, 47, 47, 0.9) 0%, rgba(1, 50, 32, 0.3) 100%)",
        backgroundImage: `url(${IMAGES.heroSmile})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(59, 47, 47, 0.85) 0%, rgba(59, 47, 47, 0.7) 100%)"
        }}></div>
        
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className="grid grid-cols-2" style={{ alignItems: "center", gap: "4rem" }}>
            <div style={{ animation: "fadeInUp 0.8s ease-out" }}>
              <p style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--tan)",
                marginBottom: "1.5rem"
              }}>
                ✨ ESPECIALISTA EM ODONTOLOGIA ESTÉTICA
              </p>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "3.5rem",
                lineHeight: "1.2",
                marginBottom: "1.5rem",
                color: "var(--cream)"
              }}>
                Odontologia estética com excelência e humanidade para você
              </h1>
              <p style={{
                fontSize: "1.1rem",
                lineHeight: "1.8",
                color: "rgba(245, 245, 220, 0.9)",
                marginBottom: "2rem"
              }}>
                Transforme seu sorriso com facetas de resina composta. Resultados naturais e imediatos que mudam a forma como você se vê.
              </p>
              <div className="flex" style={{ gap: "1rem" }}>
                <a href={buildWhatsAppUrl()} className="btn btn-primary">
                  <WhatsAppIcon size={18} />
                  Agendar Consulta
                </a>
                <button className="btn btn-secondary">Saiba Mais</button>
              </div>
            </div>
            <div style={{ animation: "slideInLeft 0.8s ease-out" }}>
              <img src={IMAGES.dentistPortrait} alt="Dr. Igor Totti" style={{
                width: "100%",
                borderRadius: "1rem",
                boxShadow: "0 20px 60px rgba(214, 188, 166, 0.2)"
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ background: "var(--background)", paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--tan)",
              marginBottom: "1rem"
            }}>
              PROVA SOCIAL
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Testemunhas
            </h2>
          </div>
          
          <div className="grid grid-cols-4" style={{ gap: "1.5rem" }}>
            {[
              { name: "Maria Silva", role: "Paciente", text: "Resultado imediato e natural!" },
              { name: "João Santos", role: "Paciente", text: "Profissional excelente!" },
              { name: "Ana Costa", role: "Paciente", text: "Finalmente tenho confiança!" },
              { name: "Carlos Oliveira", role: "Paciente", text: "Muito satisfeito!" }
            ].map((testimonial, i) => (
              <div key={i} className="card" style={{
                textAlign: "center",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "var(--tan)",
                  marginBottom: "1rem"
                }}></div>
                <Stars count={5} />
                <p style={{
                  fontSize: "0.95rem",
                  color: "rgba(245, 245, 220, 0.8)",
                  margin: "1rem 0",
                  fontStyle: "italic"
                }}>
                  "{testimonial.text}"
                </p>
                <p style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--tan)"
                }}>
                  {testimonial.name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "rgba(245, 245, 220, 0.6)" }}>
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consulta Particular Section */}
      <section style={{
        background: "linear-gradient(135deg, rgba(1, 50, 32, 0.9) 0%, rgba(59, 47, 47, 0.9) 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div className="container">
          <div className="grid grid-cols-2" style={{ alignItems: "center", gap: "4rem" }}>
            <div>
              <img src={IMAGES.smileCloseup} alt="Consulta Particular" style={{
                width: "100%",
                borderRadius: "1rem",
                boxShadow: "0 20px 60px rgba(214, 188, 166, 0.2)"
              }} />
            </div>
            <div>
              <p style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--tan)",
                marginBottom: "1.5rem"
              }}>
                CONSULTORIA
              </p>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.75rem",
                marginBottom: "1.5rem"
              }}>
                Consulta Particular
              </h2>
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.8",
                color: "rgba(245, 245, 220, 0.9)",
                marginBottom: "2rem"
              }}>
                Cada sorriso é único e merece uma abordagem personalizada. Na consulta particular, você receberá uma análise completa do seu caso, com recomendações específicas para alcançar o sorriso dos seus sonhos.
              </p>
              <a href={buildWhatsAppUrl()} className="btn btn-primary">
                <WhatsAppIcon size={18} />
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Por que escolher o Dr. Igor?
            </h2>
          </div>
          
          <div className="grid grid-cols-3" style={{ gap: "3rem" }}>
            {[
              { number: "+4", label: "Anos de Experiência", desc: "Especializado em facetas de resina composta" },
              { number: "+1mil", label: "Pacientes Satisfeitos", desc: "Transformações que mudam vidas" },
              { number: "+3mil", label: "Sorrisos Transformados", desc: "Resultados naturais e duradouros" }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: "center",
                padding: "2rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(214, 188, 166, 0.2)"
              }}>
                <p style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "3rem",
                  color: "var(--tan)",
                  marginBottom: "0.5rem"
                }}>
                  {stat.number}
                </p>
                <p style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--cream)",
                  marginBottom: "0.5rem"
                }}>
                  {stat.label}
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  color: "rgba(245, 245, 220, 0.7)"
                }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section style={{
        background: "rgba(214, 188, 166, 0.05)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Nossos Diferenciais
            </h2>
          </div>
          
          <div className="grid grid-cols-2" style={{ gap: "2rem" }}>
            {[
              { title: "Atendimento Humanizado", desc: "Cada paciente é único e merece atenção especial" },
              { title: "Resultados Naturais", desc: "Facetas que se integram perfeitamente ao seu sorriso" },
              { title: "Design Personalizado", desc: "Seu sorriso é pensado especialmente para você" },
              { title: "Técnicas Atualizadas", desc: "Sempre em dia com as melhores práticas da odontologia" }
            ].map((item, i) => (
              <div key={i} className="flex" style={{ gap: "1.5rem" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "var(--tan)",
                  color: "var(--dark-brown)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1.5rem"
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.25rem",
                    marginBottom: "0.5rem"
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: "0.95rem",
                    color: "rgba(245, 245, 220, 0.7)"
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--tan)",
              marginBottom: "1rem"
            }}>
              GALERIA
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Casos de Sucesso
            </h2>
          </div>
          
          <div className="grid grid-cols-3" style={{ gap: "2rem" }}>
            {[IMAGES.beforeAfter1, IMAGES.beforeAfter2, IMAGES.beforeAfter3].map((img, i) => (
              <div key={i} style={{
                height: "350px",
                borderRadius: "1rem",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
              }}>
                <img src={img} alt={`Caso ${i + 1}`} style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        background: "rgba(214, 188, 166, 0.05)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Perguntas Frequentes
            </h2>
          </div>
          
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {[
              { q: "Quanto tempo dura o procedimento?", a: "O procedimento de facetas de resina composta geralmente leva entre 1 a 2 horas, dependendo da quantidade de dentes a serem tratados." },
              { q: "O resultado é permanente?", a: "O resultado dura em média 5 a 7 anos com os devidos cuidados. Você pode fazer manutenção ou renovação conforme necessário." },
              { q: "Dói o procedimento?", a: "Não! O procedimento é indolor. Usamos anestesia local para garantir seu conforto durante todo o tratamento." },
              { q: "Qual é o valor?", a: "O valor varia conforme a quantidade de dentes e a complexidade do caso. Agende uma consulta para receber um orçamento personalizado." }
            ].map((faq, i) => (
              <div key={i} style={{
                marginBottom: "1.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid rgba(214, 188, 166, 0.2)"
              }}>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.25rem",
                  marginBottom: "0.75rem",
                  color: "var(--tan)"
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontSize: "0.95rem",
                  color: "rgba(245, 245, 220, 0.8)",
                  lineHeight: "1.7"
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section style={{
        background: "linear-gradient(135deg, rgba(1, 50, 32, 0.9) 0%, rgba(59, 47, 47, 0.9) 100%)",
        paddingTop: "80px",
        paddingBottom: "80px"
      }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.75rem",
              marginBottom: "1.5rem"
            }}>
              Solicite Sua Avaliação
            </h2>
            <p style={{
              fontSize: "1rem",
              color: "rgba(245, 245, 220, 0.8)"
            }}>
              Preencha o formulário e entraremos em contato via WhatsApp
            </p>
          </div>
          
          <div className="card" style={{ padding: "2.5rem" }}>
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        background: `linear-gradient(135deg, rgba(59, 47, 47, 0.9) 0%, rgba(59, 47, 47, 0.8) 100%), url(${IMAGES.clinic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "80px",
        paddingBottom: "80px",
        textAlign: "center"
      }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "3rem",
            marginBottom: "1.5rem"
          }}>
            Transforme sua vida com um novo sorriso
          </h2>
          <p style={{
            fontSize: "1.1rem",
            color: "rgba(245, 245, 220, 0.9)",
            marginBottom: "2rem",
            lineHeight: "1.8"
          }}>
            Não espere mais. Agende sua consulta hoje e descubra como as facetas de resina composta podem transformar sua vida.
          </p>
          <a href={buildWhatsAppUrl()} className="btn btn-primary">
            <WhatsAppIcon size={18} />
            Quero Agendar Minha Consulta
          </a>
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
      <footer style={{
        paddingTop: "3rem",
        paddingBottom: "3rem",
        borderTop: "1px solid rgba(214, 188, 166, 0.2)",
        textAlign: "center"
      }}>
        <div className="container">
          <p style={{
            fontSize: "0.9rem",
            color: "rgba(245, 245, 220, 0.6)"
          }}>
            © 2026 Dr. Igor Totti - Odontologia Estética. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
