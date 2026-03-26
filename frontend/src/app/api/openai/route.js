import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productName } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // High-quality fallback for demo/dev if key is missing
      return NextResponse.json({
        content: `### 🌿 Organic Recipes for ${productName}\n\n` +
                 `1. **Daily Infusion**: Add a pinch of ${productName} to your warm water every morning to boost metabolism.\n` +
                 `2. **Heirloom Face Mask**: Mix ${productName} with raw honey for 10 mins for an instant glow.\n\n` +
                 `### ✨ Health Benefits\n` +
                 `- Rich in natural antioxidants.\n` +
                 `- Helps in digestion and skin rejuvenation.\n\n` +
                 `Would you like more advanced instructions or shop this product now?`
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Lisa AI, an organic expert for "Organic Arusuvai". Provide 2 creative recipes or skincare tips for the given organic product in a soothing, friendly tone.' },
          { role: 'user', content: `Generate benefits and recipes for: ${productName}` }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error) {
    return NextResponse.json({ error: 'AI Brain is resting. Try again.' }, { status: 500 });
  }
}
