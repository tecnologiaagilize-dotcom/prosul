# Rede Prosul

Diretório e cadastro de empresas/institutos para negócios entre os países
do Foro para o Progresso da América do Sul (Prosul).

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Deploy: Vercel

## Deploy — passo a passo

### 1. Supabase
1. Crie um projeto novo em supabase.com (região sa-east-1 recomendada).
2. Abra o SQL Editor e rode o conteúdo de `supabase/migrations/001_empresas.sql`.
3. Em Authentication > Users, crie manualmente o usuário admin que vai
   acessar `/admin` (email + senha). É esse login que aprova/rejeita
   cadastros — não existe cadastro de admin pelo site.
4. Em Project Settings > API, copie a `Project URL` e a `anon public key`.

### 2. Vercel
1. Suba este projeto para um repositório no GitHub (upload pela interface
   web do GitHub funciona normalmente).
2. Importe o repositório na Vercel.
3. Em Environment Variables, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

### Rotas
- `/` — landing page
- `/cadastro` — formulário público de cadastro (entra como "pendente")
- `/diretorio` — diretório público, só mostra cadastros "aprovado"
- `/empresa/[id]` — página de detalhe de um cadastro aprovado
- `/admin/login` — login do painel
- `/admin` — moderação: aprovar, rejeitar, remover do diretório

### Migração futura para Hostgator
Como o projeto usa Server Components e Route Handlers do Next.js, ele
precisa de um ambiente Node (Vercel, ou qualquer host com suporte a
Node.js). Hostgator compartilhado tradicional não roda Next.js em modo
servidor — se a migração for necessária, o caminho mais direto é usar
`next export` só para as páginas estáticas (perdendo `/admin` com auth
server-side) ou trocar para hospedagem com suporte a Node (VPS,
Hostgator Cloud, etc). Podemos revisitar isso quando chegar a hora.
