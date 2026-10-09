# Correção do build Vercel

O commit a261f5d continha simultaneamente `app/` e `src/app/`. O Next selecionava a primeira, mas o alias `@/*` apontava para `src/*`, causando erros em Header, Footer, StatusBadge e lib/data.

A aplicação anterior e sua configuração foram preservadas em `legacy/`, excluída do TypeScript. A versão ativa é `src/app/`, com renovação de sessão em `src/proxy.ts`. A versão de Node foi limitada à série 22.x. Nenhum dado ou SQL foi alterado.

Na Vercel: Root Directory na raiz do repositório, framework Next.js, build `npm run build` e instalação padrão. Mantenha as variáveis Supabase do projeto PROSUL. Aplique a correção à main para que o deploy de produção utilize a estrutura corrigida.
