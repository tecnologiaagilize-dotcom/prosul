# Instalação e operação

## Primeiro administrador

Após aplicar a migração e cadastrar/confirmar a primeira conta, consulte o UUID em Authentication → Users. Execute no SQL Editor do projeto novo, substituindo o UUID pelo da conta correta:

```sql
update public.prosul_members m
set role = 'admin', status = 'active'
from auth.users u
where m.id = u.id
  and u.id = 'COLOQUE-O-UUID-DA-CONTA-AQUI'::uuid
  and u.email_confirmed_at is not null;
```

Confirme que exatamente uma linha foi atualizada. Esta é a única elevação inicial manual. Não existe senha padrão, administrador oculto ou chave privilegiada no código. Depois, MFA em `/seguranca` é obrigatório para `/admin`. Administrações posteriores de membros ocorrem no painel, com auditoria. É bloqueada alteração do próprio papel pelo painel.

## Papéis

| Papel      | Permissão                                              |
| ---------- | ------------------------------------------------------ |
| member     | Formação, anotações próprias e inscrições quando ativo |
| editor     | Conteúdo público e Observatório, com MFA               |
| academy    | Estrutura e conteúdo educacional, com MFA              |
| operations | Instituições e patrimônio, com MFA                     |
| admin      | Todos os módulos, acessos e auditoria, com MFA         |

Cadastro novo inicia como `pending/member`. Confirmação de e-mail não aprova participação. A administração deve aprovar somente após análise. Suspensão impede novas operações de aprendizagem e acesso às lições. Dados operacionais nunca são incluídos no feed público, mesmo com estado `published`.

## Cadastro inicial de conteúdo

1. Crie páginas institucionais, notícias e eventos como rascunho; revise fontes, datas e vínculos.
2. Na Academy, crie curso → módulo → lição. Escola → jornada → programa é a hierarquia opcional acima de curso. Módulo e lição exigem vínculo principal.
3. Para avaliação, salve a lição em rascunho, abra novamente e adicione questões antes da publicação. Opções entre 2 e 6; aprovação com 70%. Sem questões, a conclusão é autodeclarada.
4. Publique curso, módulos e lições. Matrícula e certificado exigem membro ativo. O certificado usa as lições publicadas no momento da emissão; mudanças posteriores não invalidam automaticamente certificados anteriores. Recomenda-se novo curso para nova edição curricular.
5. Vídeos podem usar YouTube ou Vimeo (carregamento mediante clique). Outros materiais ficam disponíveis por link HTTPS. Não há upload de arquivos nesta versão.
6. No Observatório, consulte uma fonte e termo. Revise país, tema, situação e relevância antes de publicar os resultados importados. Amplie termos e páginas para cobertura adicional.
7. Bens e seus registros de manutenção, inventário e empréstimo são vinculados pelo formulário de administração. Arquivar não apaga o histórico de auditoria.

## Publicação técnica

Execute testes e build, configure as mesmas variáveis na hospedagem e use `npm start` (porta padrão 3000; `PORT` pode ser definido pelo host). Proxy reverso deve preservar domínio/origem HTTPS para a verificação de origem das APIs. Configure Auth para o domínio definitivo. A instalação requer um processo Node; não exporte somente a pasta `src`.

O código usa apenas a chave pública com identidade do usuário e políticas RLS. Não desligue RLS para resolver erros. Recuperação de MFA e mudanças administrativas emergenciais devem seguir os procedimentos do provedor e a identificação do titular.

## Homologação antes de abrir cadastros

- Completar identificação do controlador, canal de contato, fundamentos e retenção em `src/app/privacidade/page.tsx`.
- Confirmar cadastro, e-mail, recuperação, MFA e saída usando contas de teste no ambiente real.
- Verificar membro pendente, ativo e suspenso; contas editor, academy, operations e admin.
- Testar curso completo, avaliação, anotações isoladas e certificado por código.
- Testar draft/review/publicado/arquivado e bem privado com usuário anônimo.
- Executar consultas reais Câmara/Senado, comparar amostras na fonte e confirmar relevância regional.
- Validar acessibilidade, conteúdo institucional, domínio, backups e restauração com a equipe responsável.

O aplicativo não agenda coleta, não envia campanhas e não publica resultados importados automaticamente. Contas, dados ou credenciais dos doadores não são migrados.
