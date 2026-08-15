import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Only allow secure POST traffic
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // 2. Vercel automatically reads this variable on its servers
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key is completely missing on Vercel settings.' });
    }

    // 3. Run the AI generation safely away from the browser
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 4. Send the text answer back to your front-end App
    return res.status(200).json({ text });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
