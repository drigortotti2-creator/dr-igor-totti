'use client';

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// CDN image URLs
const IMAGES = {
  heroSmile: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/hero-smile_99ee2167.jpg",
  dentistPortrait: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/dentist-portrait_a9f61fcd.jpg",
  beforeAfter1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-1_74c23aa4.png",
  beforeAfter2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-2_f59bab21.jpg",
  beforeAfter3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/before-after-3_07995cb8.jpg",
  beforeAfter4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/smile-closeup_7cdf2293.jpg",
  beforeAfter5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663452340162/f3MExMXZ9LFBQoZQkZPCsr/smile-woman_0bdde4ab.jpg",
};

const WHATSAPP_NUMBER = "5511999999999";

function buildWhatsAppUrl(name?: string) {
  const msg = name
    ? `Olá, Dr. Igor! Me chamo ${name} e gostaria de agendar uma consulta para saber mais sobre as Facetas de Resina Composta.`
    : "Olá, Dr. Igor! Gostaria de agendar uma consulta para saber mais sobre as Facetas de Resina Composta.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// WhatsApp Icon
function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// Stars Component
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#d6bca6" }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// Scroll Observer Hook
const useScrollObserver = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...Array.from(prev), entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-scroll-trigger]");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return visibleElements;
}

// Carousel Component
function BeforeAfterCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [IMAGES.beforeAfter1, IMAGES.beforeAfter2, IMAGES.beforeAfter3, IMAGES.beforeAfter4, IMAGES.beforeAfter5];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden group">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={img} alt={`Resultado ${idx + 1}`} className="w-full h-full object-cover" />
            {/* Blend overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        ←
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        →
      </button>
    </div>
  );
}

// FAQ Component with Popups
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visibleElements = useScrollObserver();

  const faqs = [
    {
      question: "Quanto tempo dura uma faceta de resina composta?",
      answer: "Com os cuidados adequados, as facetas de resina composta duram entre 5 a 10 anos. A durabilidade depende de hábitos de higiene, alimentação e se há bruxismo.",
    },
    {
      question: "O procedimento dói?",
      answer: "Não! O procedimento é totalmente indolor. Usamos anestesia local e técnicas modernas para garantir seu conforto durante toda a sessão.",
    },
    {
      question: "Quantas sessões são necessárias?",
      answer: "A maioria dos casos é resolvida em 1 a 2 sessões. Dependendo da complexidade, pode ser necessário mais tempo. Avaliaremos seu caso durante a consulta.",
    },
    {
      question: "Qual é o custo das facetas de resina?",
      answer: "O valor varia conforme o número de dentes e a complexidade do caso. As facetas de resina são mais acessíveis que as de porcelana. Oferecemos planos de pagamento flexíveis.",
    },
    {
      question: "Como cuidar das facetas após o procedimento?",
      answer: "Evite alimentos muito duros, não use os dentes para abrir objetos, mantenha uma boa higiene bucal e visite regularmente o consultório para acompanhamento.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 md:px-8 relative section-fade-bottom">
      <div className="max-w-4xl mx-auto">
        <div
          data-scroll-trigger
          className={`text-center mb-16 ${visibleElements.has("faq-header") ? "animate-fade-in-up" : "opacity-0"}`}
          id="faq-header"
        >
          <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
            DÚVIDAS FREQUENTES
          </p>
          <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#d6bca6" }}>
            Perguntas Comuns
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              data-scroll-trigger
              className={`transition-all duration-300 ${visibleElements.has(`faq-item-${idx}`) ? "animate-fade-in-up" : "opacity-0"}`}
              id={`faq-item-${idx}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-6 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: openIndex === idx ? "rgba(214, 188, 166, 0.15)" : "transparent",
                  borderBottom: "1px solid rgba(214, 188, 166, 0.2)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg" style={{ color: "#d6bca6" }}>
                    {faq.question}
                  </h3>
                  <span className="text-2xl transition-transform duration-300" style={{ transform: openIndex === idx ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▼
                  </span>
                </div>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 bg-rgba(59, 47, 47, 0.3) rounded-b-lg animate-fade-in">
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Video Section Component
function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleElements = useScrollObserver();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play();
          } else if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section id="video" className="py-20 px-4 md:px-8 relative section-fade-bottom">
      <div className="max-w-6xl mx-auto">
        <div
          data-scroll-trigger
          className={`text-center mb-12 ${visibleElements.has("video-header") ? "animate-fade-in-up" : "opacity-0"}`}
          id="video-header"
        >
          <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
            DEPOIMENTO
          </p>
          <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#d6bca6" }}>
            Veja o Depoimento de Nossos Pacientes
          </h2>
        </div>

        <div
          data-scroll-trigger
          className={`relative w-full aspect-video rounded-2xl overflow-hidden ${
            visibleElements.has("video-container") ? "animate-fade-in-up" : "opacity-0"
          }`}
          id="video-container"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            poster={IMAGES.heroSmile}
          >
            <source src="https://example.com/video.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>
        </div>
      </div>
    </section>
  );
}

// Lead Form Component
function LeadForm() {
  const [formData, setFormData] = useState({ fullName: "", whatsapp: "", city: "", interest: "" });
  const [loading, setLoading] = useState(false);
  const submitLead = trpc.leads.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        await submitLead.mutateAsync({ fullName: formData.fullName, whatsapp: formData.whatsapp, city: formData.city, interest: formData.interest });
      toast.success("Agendamento enviado! Redirecionando para WhatsApp...");
      window.location.href = buildWhatsAppUrl(formData.fullName);
      setFormData({ fullName: "", whatsapp: "", city: "", interest: "" });
    } catch (error) {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Seu Nome Completo"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
        className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
      />
      <input
        type="tel"
        placeholder="WhatsApp (com DDD)"
        value={formData.whatsapp}
        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
        required
        className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
      />
      <input
        type="text"
        placeholder="Sua Cidade"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        required
        className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
      />
      <select
        value={formData.interest}
        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
        className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/50"
      >
        <option value="">Selecione seu interesse</option>
        <option value="facetas">Facetas de Resina</option>
        <option value="clareamento">Clareamento</option>
        <option value="outros">Outros Tratamentos</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-whatsapp justify-center"
      >
        <WhatsAppIcon size={20} />
        {loading ? "Enviando..." : "Agendar Consulta"}
      </button>
    </form>
  );
}

// Navbar Component
function Navbar() {
  const navItems = [
    { label: "Nosso espaço", href: "#about" },
    { label: "Tratamentos", href: "#treatments" },
    { label: "Sobre", href: "#about-doctor" },
    { label: "Resultados", href: "#resultados" },
    { label: "Depoimentos", href: "#testimonials" },
    { label: "Contato", href: "#contact" },
    { label: "Localização", href: "#location" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4"
      style={{
        background: "linear-gradient(to right, rgba(59, 47, 47, 0.95) 0%, rgba(59, 47, 47, 0.7) 70%, rgba(59, 47, 47, 0) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Signature */}
        <div className="font-heading text-2xl" style={{ color: "#d6bca6" }}>
          Igor
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-white/80 hover:text-white transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <a
          href="#contact"
          className="btn-primary text-sm"
          style={{ backgroundColor: "#013220" }}
        >
          AGENDAR CONSULTA
        </a>
      </div>
    </nav>
  );
}

// Main Home Component
export default function Home() {
  const visibleElements = useScrollObserver();

  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: "#3b2f2f" }}>
      {/* Navbar */}
      <Navbar />

      {/* Floating WhatsApp Button */}
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 btn-whatsapp shadow-lg hover:shadow-xl"
      >
        <WhatsAppIcon size={24} />
      </a>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 relative overflow-hidden section-fade-bottom">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div
            data-scroll-trigger
            className={`relative h-96 md:h-[600px] rounded-2xl overflow-hidden ${
              visibleElements.has("hero-image") ? "animate-fade-in-up" : "opacity-0"
            }`}
            id="hero-image"
          >
            <img src={IMAGES.heroSmile} alt="Sorriso Perfeito" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Right: Content - Aligned to Right */}
          <div
            data-scroll-trigger
            className={`flex flex-col justify-center text-right ${
              visibleElements.has("hero-content") ? "animate-fade-in-up" : "opacity-0"
            }`}
            id="hero-content"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
              ESPECIALISTA EM ODONTOLOGIA ESTÉTICA
            </p>

            <h1 className="font-heading text-5xl md:text-6xl mb-6 leading-tight" style={{ color: "#d6bca6" }}>
              Transforme Seu Sorriso e <em>Reconquiste</em> Sua Confiança
            </h1>

            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg ml-auto">
              Especialista em facetas de resina composta com aparência natural. Resultados imediatos que vão mudar a forma como você se vê e como o mundo te vê.
            </p>

            {/* Statistics Highlight */}
            <div className="grid grid-cols-3 gap-6 mb-12 bg-rgba(214, 188, 166, 0.1) p-8 rounded-xl">
              <div className="text-center">
                <p className="font-heading text-3xl md:text-4xl" style={{ color: "#d6bca6" }}>
                  500+
                </p>
                <p className="text-sm text-white/70 mt-2">Sorrisos Transformados</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-3xl md:text-4xl" style={{ color: "#d6bca6" }}>
                  8+
                </p>
                <p className="text-sm text-white/70 mt-2">Anos de Experiência</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-3xl md:text-4xl" style={{ color: "#d6bca6" }}>
                  100%
                </p>
                <p className="text-sm text-white/70 mt-2">Satisfação Garantida</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-end">
              <a href={buildWhatsAppUrl()} className="btn-whatsapp">
                <WhatsAppIcon size={20} />
                Agendar no WhatsApp
              </a>
              <a href="#resultados" className="btn-secondary">
                Saiba Mais
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Doctor Section */}
      <section id="about-doctor" className="py-20 px-4 md:px-8 relative section-fade-bottom" style={{ backgroundColor: "#d6bca6" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div
            data-scroll-trigger
            className={`relative h-96 md:h-[500px] rounded-2xl overflow-hidden ${
              visibleElements.has("doctor-image") ? "animate-fade-in-up" : "opacity-0"
            }`}
            id="doctor-image"
          >
            <img src={IMAGES.dentistPortrait} alt="Dr. Igor Totti" className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div
            data-scroll-trigger
            className={`${visibleElements.has("doctor-content") ? "animate-fade-in-up" : "opacity-0"}`}
            id="doctor-content"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#3b2f2f" }}>
              CONHEÇA O ESPECIALISTA
            </p>

            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#3b2f2f" }}>
              Dr. Igor Totti
            </h2>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Com mais de 8 anos de experiência em odontologia estética, o Dr. Igor Totti é especialista em facetas de resina composta. Sua abordagem humanizada e técnicas modernas garantem resultados naturais e transformadores.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span style={{ color: "#013220" }} className="text-xl">✓</span>
                <span className="text-gray-700">Especialista em Facetas de Resina Composta</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: "#013220" }} className="text-xl">✓</span>
                <span className="text-gray-700">Atendimento Humanizado e Personalizado</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: "#013220" }} className="text-xl">✓</span>
                <span className="text-gray-700">Técnicas Modernas e Atualizadas</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: "#013220" }} className="text-xl">✓</span>
                <span className="text-gray-700">Resultados Naturais e Duradouros</span>
              </li>
            </ul>

            <a href={buildWhatsAppUrl()} className="btn-primary" style={{ backgroundColor: "#013220" }}>
              <WhatsAppIcon size={20} />
              Agendar Consulta
            </a>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="treatments" className="py-20 px-4 md:px-8 relative section-fade-bottom">
        <div className="max-w-6xl mx-auto">
          <div
            data-scroll-trigger
            className={`text-center mb-16 ${visibleElements.has("treatments-header") ? "animate-fade-in-up" : "opacity-0"}`}
            id="treatments-header"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
              NOSSOS TRATAMENTOS
            </p>
            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#d6bca6" }}>
              Facetas de Resina Composta
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Transforme seu sorriso com resultados imediatos e aparência totalmente natural
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Resultados Imediatos",
                description: "Veja a transformação do seu sorriso em uma ou duas sessões. Sem esperas, sem complicações.",
              },
              {
                title: "Minimamente Invasivo",
                description: "Procedimento que preserva a estrutura natural do seu dente. Conforto garantido durante todo o processo.",
              },
              {
                title: "Aparência Natural",
                description: "Facetas que se integram perfeitamente ao seu sorriso. Ninguém perceberá que são facetas.",
              },
              {
                title: "Acessível",
                description: "Mais acessível que facetas de porcelana. Oferecemos planos de pagamento flexíveis.",
              },
              {
                title: "Durável",
                description: "Com cuidados adequados, duram entre 5 a 10 anos. Investimento que vale a pena.",
              },
              {
                title: "Personalizado",
                description: "Design de sorriso único para você. Cada caso é tratado com atenção especial.",
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                data-scroll-trigger
                className={`card-premium text-center ${
                  visibleElements.has(`benefit-${idx}`) ? "animate-fade-in-up" : "opacity-0"
                }`}
                id={`benefit-${idx}`}
                style={{ backgroundColor: "#4a3f3f", borderColor: "#5a4f4f" }}
              >
                <div className="text-4xl mb-4" style={{ color: "#d6bca6" }}>
                  ★
                </div>
                <h3 className="font-heading text-xl mb-4" style={{ color: "#d6bca6" }}>
                  {benefit.title}
                </h3>
                <p className="text-white/70 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="resultados" className="py-20 px-4 md:px-8 relative section-fade-bottom">
        <div className="max-w-6xl mx-auto">
          <div
            data-scroll-trigger
            className={`text-center mb-16 ${visibleElements.has("results-header") ? "animate-fade-in-up" : "opacity-0"}`}
            id="results-header"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
              ANTES E DEPOIS
            </p>
            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#d6bca6" }}>
              Veja a Transformação
            </h2>
          </div>

          <div
            data-scroll-trigger
            className={`${visibleElements.has("carousel") ? "animate-fade-in-up" : "opacity-0"}`}
            id="carousel"
          >
            <BeforeAfterCarousel />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 md:px-8 relative section-fade-bottom" style={{ backgroundColor: "#d6bca6" }}>
        <div className="max-w-6xl mx-auto">
          <div
            data-scroll-trigger
            className={`text-center mb-16 ${visibleElements.has("testimonials-header") ? "animate-fade-in-up" : "opacity-0"}`}
            id="testimonials-header"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#3b2f2f" }}>
              DEPOIMENTOS
            </p>
            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#3b2f2f" }}>
              O Que Nossos Pacientes Dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                text: "Meu sorriso mudou completamente! O Dr. Igor foi muito profissional e atencioso. Recomendo demais!",
              },
              {
                name: "João Santos",
                text: "Resultado perfeito! Não dói nada e é rápido. Muito satisfeito com o atendimento.",
              },
              {
                name: "Ana Costa",
                text: "Finalmente tenho confiança para sorrir! Obrigada Dr. Igor por essa transformação.",
              },
              {
                name: "Carlos Oliveira",
                text: "Excelente profissional! Recomendo para todos que querem um sorriso perfeito.",
              },
              {
                name: "Patricia Gomes",
                text: "Adorei o resultado! Natural e lindo. Voltaria mil vezes!",
              },
              {
                name: "Roberto Alves",
                text: "Melhor decisão que tomei! Sorriso bonito e natural. Muito obrigado!",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                data-scroll-trigger
                className={`p-8 rounded-xl bg-white/10 backdrop-blur-sm ${
                  visibleElements.has(`testimonial-${idx}`) ? "animate-fade-in-up" : "opacity-0"
                }`}
                id={`testimonial-${idx}`}
              >
                <Stars count={5} />
                <p className="text-gray-700 my-4 leading-relaxed">"{testimonial.text}"</p>
                <p className="font-heading text-lg" style={{ color: "#3b2f2f" }}>
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 md:px-8 relative section-fade-bottom">
        <div className="max-w-2xl mx-auto">
          <div
            data-scroll-trigger
            className={`text-center mb-12 ${visibleElements.has("contact-header") ? "animate-fade-in-up" : "opacity-0"}`}
            id="contact-header"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#d6bca6" }}>
              ENTRE EM CONTATO
            </p>
            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#d6bca6" }}>
              Agende Sua Consulta
            </h2>
          </div>

          <div
            data-scroll-trigger
            className={`${visibleElements.has("contact-form") ? "animate-fade-in-up" : "opacity-0"}`}
            id="contact-form"
          >
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 px-4 md:px-8 relative section-fade-bottom" style={{ backgroundColor: "#d6bca6" }}>
        <div className="max-w-6xl mx-auto">
          <div
            data-scroll-trigger
            className={`text-center mb-12 ${visibleElements.has("location-header") ? "animate-fade-in-up" : "opacity-0"}`}
            id="location-header"
          >
            <p className="text-xs font-700 tracking-[0.25em] uppercase mb-4" style={{ color: "#3b2f2f" }}>
              LOCALIZAÇÃO
            </p>
            <h2 className="font-heading text-4xl md:text-5xl mb-6" style={{ color: "#3b2f2f" }}>
              OdontoNew Guarapuava
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Map */}
            <div
              data-scroll-trigger
              className={`relative w-full h-96 rounded-xl overflow-hidden ${
                visibleElements.has("map") ? "animate-fade-in-up" : "opacity-0"
              }`}
              id="map"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3633.5234567890123!2d-51.5!3d-25.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94f4a0a0a0a0a0a1%3A0x0!2sGuarapuava!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info */}
            <div
              data-scroll-trigger
              className={`flex flex-col justify-center ${
                visibleElements.has("location-info") ? "animate-fade-in-up" : "opacity-0"
              }`}
              id="location-info"
            >
              <div className="space-y-6">
                <div>
                  <p className="font-heading text-xl mb-2" style={{ color: "#3b2f2f" }}>
                    Endereço
                  </p>
                  <p className="text-gray-700">Rua Exemplo, 123 - Centro, Guarapuava - PR</p>
                </div>

                <div>
                  <p className="font-heading text-xl mb-2" style={{ color: "#3b2f2f" }}>
                    Telefone
                  </p>
                  <p className="text-gray-700">(42) 99999-9999</p>
                </div>

                <div>
                  <p className="font-heading text-xl mb-2" style={{ color: "#3b2f2f" }}>
                    Horário de Atendimento
                  </p>
                  <p className="text-gray-700">Segunda a Sexta: 8h às 18h</p>
                  <p className="text-gray-700">Sábado: 8h às 13h</p>
                </div>

                <a href={buildWhatsAppUrl()} className="btn-primary" style={{ backgroundColor: "#013220" }}>
                  <WhatsAppIcon size={20} />
                  Agendar Agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 text-center text-white/60 border-t border-white/10">
        <p className="text-sm">© 2026 Dr. Igor Totti. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
