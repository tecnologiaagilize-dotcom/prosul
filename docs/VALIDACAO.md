# Validação da entrega 0.1.0

Data: 09/10/2026. Ambiente local descartável; nenhum banco remoto alterado.

## Executado

- `npm test`: 8 testes aprovados. O teste integrado executa a migração completa em PostgreSQL embarcado (PGlite), com funções simuladas de identidade Supabase.
- Casos: usuário não escolhe papel pelo cadastro; administração exige MFA; usuário comum não publica; rascunho não vaza; bens operacionais não aparecem publicamente; notas ficam isoladas; edição sem versão ou com versão antiga é rejeitada; importação repetida da mesma fonte é rejeitada.
- Academy: matrícula antes de conclusão; alternativas sem gabarito público; resposta incorreta não libera certificado; aprovação registra progresso e libera verificação por código.
- Validação de entradas: links inseguros, números negativos, país, fuso e vínculo obrigatório.
- Transporte oficial: bloqueio de host externo; teste com resposta simulada da Câmara; RSS filtrado; XML com entidades recusado. Estes testes não comprovam disponibilidade contínua das fontes reais.
- `npm run build`: Next.js compilou, verificou TypeScript e gerou rotas; proxy de sessão incluído.

A inspeção visual automatizada em navegador não foi concluída: o Chromium foi impedido pelo ambiente de criar seu socket (`Operation not permitted`). Portanto responsividade e navegação visual ainda exigem homologação no ambiente de destino.

## Limites

PGlite valida SQL e regras de acesso com identidades simuladas. Não substitui teste de integração com Supabase Auth, PostgREST e SMTP reais. Não foram testados envio de e-mail, MFA por aplicativo real, recuperação de conta, carga concorrente, cobrança, hospedagem pública ou restauração de backup.

O arquivo `docs/ADAPTACAO.md` registra funcionalidades ainda ausentes. Publicação em produção requer homologação da equipe, configuração de domínio e autenticação e conclusão dos textos institucionais/privacidade.
