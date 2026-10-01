# CHULA v0.8 — IA real

Esta versão adiciona um backend Node/Express para conversar com a API da OpenAI sem colocar a chave no navegador.

## Rodar no computador
1. Instale Node.js LTS.
2. Abra um terminal nesta pasta.
3. Rode `npm install`.
4. Copie `.env.example` para `.env`.
5. Abra `.env` e coloque sua chave em `OPENAI_API_KEY`.
6. Rode `npm start`.
7. Abra `http://localhost:3000`.

## Importante
Nunca coloque a chave da API no `index.html` nem faça commit do `.env`. O backend usa a variável de ambiente `OPENAI_API_KEY`.

## GitHub Pages
GitHub Pages hospeda o frontend estático, mas não deve receber a chave da API. Para a IA funcionar online, o backend (`server.js`) precisa ser hospedado em um serviço de backend e o frontend apontado para ele. Não publique a chave no GitHub.
