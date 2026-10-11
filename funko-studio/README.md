# Toy Studio (nome provisório)

App web em que o cliente envia até 4 fotos e recebe um boneco colecionável de vinil em 3 vistas
(frente, lateral e traseira) numa única imagem. Limite de 15 tentativas por cliente.

Stack: Next.js 14 (App Router) + TypeScript, sem banco de dados.

## Rodar local
```bash
cp .env.example .env.local   # preencha OPENAI_API_KEY quando tiver
npm install
npm run dev                  # http://localhost:3000
```
Sem `OPENAI_API_KEY` o app roda em **modo demo** (devolve uma imagem de exemplo, conta tentativas normalmente).

## Deploy na Vercel (grátis)
1. Import do repositório → **Root Directory = `funko-studio`** (se a pasta virar repo próprio, deixe em branco).
2. Variáveis de ambiente: `OPENAI_API_KEY`, `QUOTA_SECRET` (texto aleatório longo), opcionais `OPENAI_IMAGE_MODEL`, `MAX_ATTEMPTS`, `IMAGE_QUALITY`.
3. Deploy. A rota de geração usa `maxDuration = 120`; no plano Hobby a Vercel pode limitar a ~60 s. Se estourar, use `IMAGE_QUALITY=low`.

## Onde mexer
- `lib/prompt.ts`: regras do estilo do boneco e do layout 3 vistas (enviadas à IA junto com as fotos).
- `app/api/generate/route.ts`: chamada à OpenAI (`/v1/images/edits`, fotos como referência) e contagem de tentativas.
- `lib/quota.ts`: contador em cookie assinado (HMAC).
- `components/Studio.tsx` + `app/globals.css`: interface.

## Pendências
- Informar a chave da OpenAI e confirmar o nome do modelo de imagem (hoje `gpt-image-1`, configurável em `OPENAI_IMAGE_MODEL`).
- O limite de 15 vive num cookie: quem limpa os cookies zera. Para bloqueio forte, ligar a login/e-mail + banco (Vercel KV/Supabase).
- Definir nome do projeto, domínio e logo.
