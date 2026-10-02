
import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/api/status', (_req, res) => {
  res.json({
    ok: true,
    ai: Boolean(apiKey),
    model
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(503).json({
        error: 'IA não configurada. Adicione GEMINI_API_KEY no Render.'
      });
    }

    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages.slice(-20)
      : [];

    const contents = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '') }]
      }))
      .filter(m => m.parts[0].text.trim());

    if (!contents.length) {
      return res.status(400).json({ error: 'Envie uma mensagem para a CHULA.' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `Você é a CHULA, uma assistente pessoal digital brasileira.
Seja natural, amigável, objetiva e útil.
Você ajuda a organizar rotina, agenda, tarefas, hábitos, projetos, saúde e finanças.
Não invente dados pessoais.
Agenda = quando algo acontece; Tarefas = o que precisa ser feito;
Rotina/Hábitos = atividades recorrentes; Projetos = objetivos maiores.
Nesta versão, você conversa e interpreta pedidos, mas não salva dados permanentemente.
Nunca diga que executou uma ação real se ela não foi executada.`
            }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Gemini:', data);
      return res.status(502).json({
        error: 'O Gemini não conseguiu responder.',
        detail: data.error?.message || 'Erro na API do Gemini.'
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    res.json({
      reply: reply || 'Não consegui gerar uma resposta agora.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erro ao falar com a IA.',
      detail: err?.message || 'Erro desconhecido.'
    });
  }
});

app.listen(port, () => {
  console.log(`CHULA rodando na porta ${port}`);
});
