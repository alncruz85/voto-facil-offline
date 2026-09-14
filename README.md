# Urna Fácil

Crie um aplicativo mobile-first de simulação de votação e “colinha” eleitoral em português (Brasil). Deve funcionar totalmente offline no navegador, com dados persistidos localmente como JSON (use armazenamento local apropriado) e sem exigir conta. Implemente: CRUD completo de listas de candidatos com apelido; candidatos com nome, código de votação numérico e cargo; formulário simples de cadastro/edição; exportação de uma lista em JSON por QR Code e importação por leitor/scanner de QR Code, com alternativa de colar JSON caso câmera não esteja disponível; uma tela de urna eletrônica com teclado numérico, botões Corrigir e Confirmar e fluxo por cargos em ordem oficial, mostrando candidato encontrado, voto em branco/nulo quando aplicável e confirmação final. Priorize UX de celular, alto contraste, tipografia legível, foco de teclado, labels/ARIA e feedback acessível a leitores de tela. Crie uma interface visualmente clara e confiável. Inclua dados de exemplo discretos para demonstrar o fluxo, mas permita remover tudo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ff28d513-200f-4208-b468-27fce5b87ca8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
