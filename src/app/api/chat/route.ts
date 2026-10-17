import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { dataService } from '@/lib/supabase/data-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'English', history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch real stock from database for grounding
    const currentStock = await dataService.getAllInventoryForChat();

    // Format current inventory into structured context
    const inventoryContext = currentStock
      .map(
        (item) =>
          `• Medicine: "${item.medicine_name}" (Generic: ${item.generic_name || 'N/A'}) | Pharmacy: "${item.pharmacy_name}" (${item.address}) | Stock: ${item.quantity > 0 ? `${item.quantity} available` : 'OUT OF STOCK'} | Price: ₹${item.price}`
      )
      .join('\n');

    const systemPrompt = `You are MediBot, an empathetic, certified clinical pharmacist assistant for MediTrack.
The patient is communicating in the chosen language: ${language.toUpperCase()}.
YOUR RESPONSE MUST BE WRITTEN ENTIRELY IN ${language.toUpperCase()} (e.g., if Kannada use Kannada script ಕನ್ನಡ, if Hindi use Devanagari हिंदी, if English use English).

CRITICAL GROUNDING INSTRUCTIONS:
1. Always base all medicine availability, stock counts, pharmacy names, and prices strictly on the following REAL-TIME INVENTORY DATABASE:
---
${inventoryContext}
---
2. If the user asks whether a medicine is available, check every pharmacy in the data above.
3. If it is in stock, specify:
   - Pharmacy Name and location
   - Exact price (₹ INR)
   - Stock count available
4. If it is out of stock at one store but available at another nearby store, proactively recommend the in-stock pharmacy!
5. Mention doctor prescription requirements if asking about antibiotics (like Augmentin, Azithromycin) or prescription drugs.
6. Keep answers concise, helpful, kind, and easy to read with bullet points.`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const isMockKey = !apiKey || apiKey.includes('placeholder') || apiKey === 'mock-gemini-key-placeholder';

    if (!isMockKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Build conversation messages
        const contents = [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
        });

        const reply = response.text || 'I checked the stock for you.';
        return NextResponse.json({
          reply,
          language,
          inventoryContextUsed: true,
          source: 'gemini-live',
        });
      } catch (geminiError) {
        console.warn('Gemini chat error, fallback to multilingual responder:', geminiError);
      }
    }

    // High quality intelligent simulated replies based on real inventory when Gemini key is demo/mock
    const userQueryLower = message.toLowerCase();
    
    // Check matched items from real inventory
    const matchedItems = currentStock.filter(
      (item) =>
        userQueryLower.includes(item.medicine_name.toLowerCase()) ||
        (item.generic_name && userQueryLower.includes(item.generic_name.toLowerCase()))
    );

    let simulatedReply = '';

    if (language.toLowerCase() === 'kannada') {
      if (matchedItems.length > 0) {
        const inStock = matchedItems.filter((i) => i.quantity > 0);
        if (inStock.length > 0) {
          const item = inStock[0];
          simulatedReply = `ನಮಸ್ಕಾರ! ಹೌದು, **${item.medicine_name}** ಪ್ರಸ್ತುತ ಲಭ್ಯವಿದೆ.\n\n📍 **ಫಾರ್ಮಸಿ:** ${item.pharmacy_name} (${item.address})\n📦 **ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್:** ${item.quantity} ಯೂನಿಟ್‌ಗಳು\n💰 **ಬೆಲೆ:** ₹${item.price}\n\nದಯವಿಟ್ಟು ನಿಮ್ಮ ವೈದ್ಯರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ತರಲು ಮರೆಯಬೇಡಿ. ನಿಮಗೆ ಬೇರೆ ಯಾವುದೇ ಔಷಧಿಯ ಮಾಹಿತಿ ಬೇಕೇ?`;
        } else {
          simulatedReply = `ಕ್ಷಮಿಸಿ, ನೀವು ಕೇಳಿದ ಔಷಧಿ ಪ್ರಸ್ತುತ ಎಲ್ಲಾ ಫಾರ್ಮಸಿಗಳಲ್ಲಿ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು 1-2 ಗಂಟೆಗಳ ನಂತರ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಹತ್ತಿರದ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
        }
      } else {
        simulatedReply = `ನಮಸ್ಕಾರ! ನಾನು ಮೆಡಿಬಾಟ್. ಬೆಂಗಳೂರಿನ ಎಲ್ಲಾ ಫಾರ್ಮಸಿಗಳಲ್ಲಿ ನೈಜ-ಸಮಯದ ಔಷಧಿ ಲಭ್ಯತೆ ತಿಳಿಯಲು ನೀವು ಔಷಧಿ ಹೆಸರು ಕೇಳಬಹುದು (ಉದಾ: Dolo 650, Augmentin, Pan 40).`;
      }
    } else if (language.toLowerCase() === 'hindi') {
      if (matchedItems.length > 0) {
        const inStock = matchedItems.filter((i) => i.quantity > 0);
        if (inStock.length > 0) {
          const item = inStock[0];
          simulatedReply = `नमस्ते! जी हां, **${item.medicine_name}** वर्तमान में उपलब्ध है।\n\n📍 **फार्मेसी:** ${item.pharmacy_name} (${item.address})\n📦 **स्टॉक:** ${item.quantity} यूनिट्स उपलब्ध\n💰 **मूल्य:** ₹${item.price}\n\nकृपया डॉक्टर का पर्चा (Prescription) साथ लाएं। क्या आपको किसी अन्य दवा की जानकारी चाहिए?`;
        } else {
          simulatedReply = `माफ कीजिए, यह दवा अभी निकटतम फार्मेसी में आउट ऑफ स्टॉक है। हम जल्द ही रीस्टॉक अपडेट करेंगे।`;
        }
      } else {
        simulatedReply = `नमस्ते! मैं मेडीबॉट (MediBot) हूँ। आप मुझसे किसी भी दवा की उपलब्धता, मूल्य या निकटतम मेडिकल स्टोर के बारे में हिंदी में पूछ सकते हैं। (उदाहरण: Dolo 650, Augmentin, Pan 40 उपलब्ध है क्या?)`;
      }
    } else {
      // English default
      if (matchedItems.length > 0) {
        const inStock = matchedItems.filter((i) => i.quantity > 0);
        const outStock = matchedItems.filter((i) => i.quantity === 0);

        if (inStock.length > 0) {
          const lines = inStock.map(
            (i) => `• **${i.pharmacy_name}** (${i.address}): **${i.quantity} units** in stock at ₹${i.price}`
          );
          simulatedReply = `Yes! **${matchedItems[0].medicine_name}** is available in real-time:\n\n${lines.join(
            '\n'
          )}\n\n💡 *Tip: Remember to show a valid doctor's prescription when collecting antibiotics or scheduled drugs.*`;
        } else if (outStock.length > 0) {
          simulatedReply = `Currently, **${matchedItems[0].medicine_name}** is out of stock at ${outStock[0].pharmacy_name}. Please check back shortly or explore generic substitutes like ${outStock[0].generic_name || 'paracetamol'}.`;
        }
      } else {
        simulatedReply = `Hello! I am MediBot, your real-time pharmacy assistant. I can check live stock for medicines across verified Bangalore pharmacies (e.g., Dolo 650, Augmentin 625 Duo, Azithral 500, Pan 40, Glycomet 500). How can I assist you today?`;
      }
    }

    return NextResponse.json({
      reply: simulatedReply,
      language,
      inventoryContextUsed: true,
      source: isMockKey ? 'demo-multilingual-ai' : 'gemini-fallback',
      notice: isMockKey ? 'Running with simulated Gemini engine (Provide GEMINI_API_KEY in .env.local for full live model)' : undefined,
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const message = error instanceof Error ? error.message : 'Chat server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
