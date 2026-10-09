# Matriz de adaptação PROSUL

## Origem e decisão

Os arquivos fornecidos foram tratados como bases autorizadas do novo PROSUL. A separação técnica evita carregar acoplamentos de domínio, dados pessoais e permissões de sistemas anteriores. Os arquivos originais permanecem preservados fora deste pacote.

| Base                                                         | Aplicação na entrega                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| CEC: cliente/servidor Supabase e renovação de sessão         | Reaproveitados e ajustados ao novo aplicativo                                 |
| CEC: MFA, leitura em voz alta e controles UI                 | Reaproveitamento seletivo, sem imposição da hierarquia antiga                 |
| CEC: membros, Academy, conteúdo e patrimônio                 | Fluxos reimplementados com esquema próprio `prosul_*` e papéis institucionais |
| IBFC: domínio legislativo e fontes oficiais                  | Adaptado como consulta temática Câmara/Senado sem vínculo a candidatos        |
| IBFC: eleitoral, candidatos, TSE, mapas de votação e ranking | Excluídos                                                                     |
| CEC: células, igreja, discipulado e hierarquia religiosa     | Excluídos                                                                     |
| Credenciais, cadastros, produção e migrações legadas         | Não copiados; requer migração específica caso futuramente autorizada          |

`ibfc-main (2)(1).zip` foi comparado com `ibfc-main (2).zip`: 427 arquivos, sem diferenças de conteúdo. A nova entrega não empacota cópias dos sistemas antigos.

## Cobertura funcional real

| Área                     | Implementado                                                                                           | Ainda não implementado                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Membros                  | Cadastro, confirmação, aprovação, suspensão, papéis, MFA                                               | Migração em lote, diretório público, recuperação administrativa de MFA própria                                                        |
| Portal/CMS               | 21 tipos de registro; texto, vínculos, busca por título/resumo/tema/país; snapshots públicos           | Blocos visuais, imagens, histórico restaurável, prévia privada, busca integral, traduções PT/ES/EN                                    |
| Governança editorial     | Rascunho, revisão, publicação, arquivo, auditoria e controle de versão concorrente                     | Aprovação obrigatória por pessoa distinta, justificativas de devolução e arquivo, revisões imutáveis completas                        |
| Vídeos/biblioteca        | Links HTTPS; player YouTube/Vimeo mediante clique; campo de transcrição                                | Upload, storage privado, antivírus, CDN e transcodificação                                                                            |
| Academy                  | Hierarquia, matrícula por curso, lições, questões, progresso, notas, TTS, certificado verificável      | Matrícula específica em turma, frequência, prova proctorada, edição/exclusão de questões, trilhas condicionais e relatórios avançados |
| Eventos                  | Conteúdo, data/fuso, inscrição e cancelamento                                                          | Capacidade, lista de espera, check-in, recorrência e lembretes                                                                        |
| Patrimônio               | Bens, aquisição, responsáveis, manutenção, inventário e empréstimos                                    | Depreciação contábil, baixa com aprovação, bloqueio de empréstimos simultâneos, assinatura de termos e conciliação financeira         |
| Observatório             | Coleta sob demanda, links oficiais, hash da resposta, data de consulta, revisão e deduplicação por URL | Robô agendado, histórico integral de tramitações, comparação de versões, alertas e cobertura exaustiva                                |
| Cooperação/investimentos | Cadastro editorial com situação, prazo, critérios e fonte                                              | Assessoria financeira, transações, captação ou confirmação automática de vigência                                                     |
| Serviços adicionais      | Sem dependências de IA paga                                                                            | Chatbot/IA, rádio, transmissões ao vivo, gamificação, pagamentos, aplicativos nativos                                                 |

A versão amplia a base com Academy e patrimônio conforme as instruções posteriores do usuário. Não implementa integralmente todos os requisitos do documento preliminar CORE 1.0; esta matriz é a referência da entrega 0.1.0. Não há atribuição automática de cargo parlamentar, filiação institucional ou condição de país membro por simples cadastro.

## Fontes e alcance do Observatório

- Câmara: `https://dadosabertos.camara.leg.br/api/v2/proposicoes`, pesquisa por palavra-chave, período móvel de 90 dias, 20 itens por página.
- Senado: `https://legis.senado.leg.br/dadosabertos/processo`, pesquisa por termo no mesmo período; interface limita apresentação a 50 itens e informa limitação.
- Notícias Câmara: RSS de Relações Exteriores.
- Notícias Senado: RSS de notícias; ambos filtrados localmente pelo termo sem acentos.

O filtro textual não prova pertinência à América Latina. Um editor precisa classificar cada resultado. A resposta original recebe SHA-256, mas não é arquivada integralmente; portanto o hash é registro de consulta, não um acervo documental recuperável. Credenciais não são exigidas nas fontes públicas. Mudanças nos formatos oficiais podem exigir ajuste dos adaptadores.

O artigo histórico fornecido não foi usado para inventar cargos atuais. Marca textual, conteúdo inicial e estrutura visual são propostas de implementação a validar pela Frente.
