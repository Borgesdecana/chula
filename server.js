import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3000;
const client = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'cole_sua_chave_aqui'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/api/status', (_req, res) => {
  res.json({ ok: true, ai: Boolean(client), model: process.env.OPENAI_MODEL || 'gpt-5.6-luna' });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: 'IA não configurada. Crie um arquivo .env com OPENAI_API_KEY.' });
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-20) : [];
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      instructions: `Você é a CHULA, uma assistente pessoal digital brasileira. Seja natural, amigável, objetiva e útil. Você ajuda a organizar rotina, agenda, tarefas, hábitos, projetos, saúde e finanças. Não invente dados pessoais. Quando o usuário mencionar algo que pareça uma ação para a Agenda ou Tarefas, explique o que você entendeu e peça confirmação quando houver ambiguidade. Agenda = quando algo acontece; Tarefas = o que precisa ser feito; Rotina/Hábitos = atividades recorrentes que a pessoa quer acompanhar; Projetos = objetivos maiores. Nesta versão, você conversa e interpreta pedidos, mas ainda não possui ferramentas para salvar dados permanentemente. Nunca diga que executou uma ação real se ela não foi executada.`,
      input: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }))
    });
    res.json({ reply: response.output_text || 'Não consegui gerar uma resposta agora.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao falar com a IA.', detail: err?.message || 'unknown' });
  }
});

app.listen(port, () => console.log(`CHULA rodando em http://localhost:${port}`));
