# Estrutura anterior preservada

Esta pasta guarda a aplicação que estava na raiz de `a261f5d` antes da instalação da base PROSUL 0.1.0. Não é compilada nem publicada. Seus imports antigos não foram adaptados; serve para consulta e recuperação seletiva.

A aplicação ativa fica em `src/app/`, usa `src/proxy.ts` e `next.config.mjs`. Não mova `legacy/app/` para a raiz: isso faz o Next.js selecionar novamente a aplicação antiga.
