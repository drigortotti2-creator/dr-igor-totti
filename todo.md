# Dr. Igor Totti - Landing Page TODO

## Banco de Dados
- [x] Criar tabela `leads` no schema Drizzle
- [x] Gerar e aplicar migration SQL
- [x] Criar helper de query em server/db.ts

## Backend (tRPC)
- [x] Criar procedure `leads.submit` para salvar lead no banco
- [x] Integrar notificação ao proprietário via notifyOwner
- [x] Retornar URL do WhatsApp pré-preenchida após submissão

## Design System
- [x] Definir paleta de cores (branco, preto, dourado/champagne)
- [x] Configurar tipografia premium (Cormorant Garamond + Lato via Google Fonts)
- [x] Atualizar index.css com tokens de design e utilitários customizados
- [x] Atualizar index.html com fontes e meta tags

## Seções da Landing Page
- [x] Hero Section (imagem, headline emocional, subheadline, CTAs WhatsApp)
- [x] Seção Sobre Dr. Igor Totti (foto, texto humanizado, credenciais, autoridade)
- [x] Seção Facetas de Resina Composta (6 benefícios em cards premium)
- [x] Galeria Antes e Depois (5 imagens em grid com overlay)
- [x] Seção Depoimentos (6 testemunhos com nomes e estrelas)
- [x] Seção Diferenciais (4 diferenciais com ícones + imagem do consultório)
- [x] Seção CTA Final (reforço emocional + botões de agendamento)
- [x] Formulário de captação de leads (Nome, WhatsApp, Cidade, Interesse)
- [x] Botão flutuante de WhatsApp em toda a página (com animação pulse)
- [x] Navbar fixa com logo e CTA

## UX/UI
- [x] Smooth scrolling
- [x] Design responsivo (mobile-first)
- [x] Múltiplos CTAs ao longo da página
- [x] Navegação simples sem menus complexos
- [x] Animações e hover effects premium

## Testes
- [x] Vitest para procedure de leads (6 testes passando)
- [x] Verificar TypeScript sem erros (pnpm check)
- [x] Verificar submissão do formulário e redirecionamento WhatsApp
- [x] Verificar notificação ao proprietário


## Painel Administrativo de Leads
- [x] Criar queries de leads no server/db.ts (listar, filtrar, buscar)
- [x] Criar procedures tRPC protegidas para admin (leads.list, leads.search, leads.export)
- [x] Criar página /admin/leads com tabela responsiva
- [x] Implementar filtros por data, cidade, interesse
- [x] Implementar busca por nome/WhatsApp
- [x] Implementar paginação
- [x] Implementar exportação CSV/JSON
- [x] Criar testes para procedures de admin (17 testes passando)
- [x] Verificar proteção de rota (apenas admin)
