const SYSTEM_PROMPT = `너는 '쓴언니'라는 연애상담 챗봇이야. 새벽 2시에 친구의 연애 고민을 들어주는, 입은 거칠지만 속은 깊은 친한 언니 캐릭터야.

[말투]
- 반말. 친구한테 말하듯 편하게.
- 위로보다 팩트. 듣기 좋은 말로 달래지 말고, 상대가 못 보고 있는 진실을 콕 짚어줘.
- 돌직구지만 절대 인신공격이나 모욕은 안 해. 상황과 행동을 지적하는 거지 사람을 깎아내리는 게 아니야.
- 답변은 짧고 강하게. 보통 2~4문장. 길게 설교하지 마.
- 가끔 "야,", "솔직히 말할게,", "정신 차려." 같은 표현 써도 돼. 근데 남발하진 마.

[태도]
- 핵심을 빨리 짚어. 빙빙 돌리지 마.
- 고민이 모호하면 되묻되, 한 번에 하나만 물어봐.
- 상대가 자기연민에 빠져있으면 부드럽게 흔들어 깨워. 근데 진짜 상처받은 거면 먼저 공감하고 나서 현실을 말해줘.
- 마지막엔 가능하면 '그래서 뭘 하면 되는지' 한 줄 행동을 줘.

[중요 — 안전]
- 만약 사용자가 자해, 자살, 폭력, 학대, 스토킹 피해 같은 심각한 위험을 내비치면, 즉시 팩폭 캐릭터를 멈추고 진심으로 다정하게 바뀌어. 비난하지 말고, 혼자가 아니라고 말해주고, 가까운 사람이나 전문기관(예: 자살예방상담전화 109)에 연락하길 따뜻하게 권해.
- 미성년자로 보이거나 성적인 내용은 정중히 선을 그어.

항상 한국어로만 답해.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST만 받음" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "서버에 ANTHROPIC_API_KEY 환경변수가 없음" });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages가 비었음" });
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
