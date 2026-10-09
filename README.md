# PROSUL · Plataforma de integração e formação

Versão 0.1.0 — base funcional independente, adaptada dos arquivos fornecidos. Entrega de código em 09/10/2026. Não foi instalada em infraestrutura de produção.

O foco é a integração Câmara–Senado em notícias e proposições de interesse latino-americano, cooperação, incentivos e investimentos. Não há candidatos, análise eleitoral, células ou hierarquia religiosa. Cadastro na plataforma não comprova participação formal na Frente.

## Iniciar

Requisitos: Node.js 22.13 ou superior, npm e projeto Supabase **novo e exclusivo do PROSUL**.

```bash
npm ci
cp .env.example .env.local
```

1. No SQL Editor do novo Supabase, execute **uma vez** `supabase/migrations/001_prosul.sql`. A migração cria tabelas, funções, permissões e políticas. Não execute sobre CEC/IBFC ou banco em uso. Não transfere dados pessoais nem senhas dos projetos anteriores.
2. Preencha `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do novo projeto. Use a chave pública `anon`; não coloque `service_role` no aplicativo.
3. Em Authentication, habilite e-mail/senha, confirmação de e-mail e MFA TOTP. Configure SMTP para entrega de mensagens; aplique os limites de autenticação do provedor. Configure senha mínima de 12 caracteres também no provedor, para não depender apenas do formulário.
4. Defina Site URL e Redirect URLs. Para desenvolvimento, permita `http://localhost:3000/auth/callback` e `http://localhost:3000/auth/callback?next=/nova-senha`. Em produção use o domínio HTTPS real. Os templates de e-mail devem manter o fluxo PKCE do Supabase (`ConfirmationURL`). Teste confirmação e recuperação no ambiente de destino.
5. Inicie `npm run dev`, crie a primeira conta em `/cadastrar` e confirme o e-mail.
6. Promova somente essa conta verificada conforme `docs/INSTALACAO.md`. Entre em `/seguranca`, configure e confirme o autenticador. O painel administrativo exige membro ativo, papel autorizado e sessão MFA AAL2.
7. Cadastre os conteúdos em `/admin`. O banco começa vazio; não há nomes, cargos, estatísticas ou notícias fictícias.

```bash
npm test
npm run build
npm start
```

Sem configuração Supabase, a página inicial e formulários podem ser visualizados; as operações exibem indisponibilidade. Hospedagem deve executar Next.js/Node com acesso HTTPS às fontes oficiais. Não é uma exportação HTML estática.

## Módulos presentes

- Portal institucional, notícias, vídeos, biblioteca por links HTTPS e agenda com inscrições.
- Cadastro, login, confirmação por e-mail, recuperação de senha, MFA e aprovação de membros.
- Academy: escolas, jornadas, programas, cursos, módulos, lições e cadastro de turmas; matrícula por curso, avaliações, progresso, anotações privadas, leitura em voz alta e certificado verificável.
- Patrimônio: bens, responsáveis, localização, aquisição, manutenção, inventários e empréstimos; acesso privado.
- Instituições, projetos de cooperação, oportunidades de incentivos/investimentos e fontes oficiais.
- Consulta temática manual à Câmara/Senado e RSS, com importação para revisão; fonte duplicada é recusada.
- Administração por papel, rascunhos, revisão, publicação, arquivamento, proteção contra edição concorrente e auditoria.

A publicação preserva a última versão pública durante edições em rascunho. O editor autorizado pode publicar seu próprio conteúdo nesta versão: separação obrigatória entre autor e revisor e restauração de versões são pendências documentadas. Não apresentar esta entrega como conclusão integral do Caderno Master CORE 1.0.

## Documentação

- `docs/INSTALACAO.md`: implantação, primeiro administrador e verificação real.
- `docs/ADAPTACAO.md`: reaproveitamento dos arquivos e limites de cada módulo.
- `docs/VALIDACAO.md`: verificações executadas e condições de homologação.

Conteúdos institucionais, marca, contatos, tradução e privacidade precisam de validação da administração PROSUL. Não foram habilitadas integrações pagas ou credenciais externas. A classificação de oportunidades é informativa; proposta legislativa não equivale a incentivo vigente.
