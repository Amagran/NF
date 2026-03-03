// Proxy seguro para a API da Anthropic
// Sua API key fica nas variáveis de ambiente do Vercel (ninguém vê)

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Permite chamadas do seu site (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Pega a API key das variáveis de ambiente (seguro!)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API Key não configurada no servidor" });
  }

  try {
    // Repassa a chamada para a Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: req.body.messages || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro no proxy:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
