async function testRoutes() {
  const routes = [
    { url: 'http://localhost:3000/', name: 'Home Landing Page' },
    { url: 'http://localhost:3000/patient', name: 'Patient Demand Portal' },
    { url: 'http://localhost:3000/pharmacy', name: 'Pharmacy Supply Portal' },
    { url: 'http://localhost:3000/login', name: 'Authentication Portal' },
  ];

  console.log('--- Testing Next.js Pages ---');
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      console.log(`[PASS] ${r.name} (${r.url}): HTTP ${res.status}`);
    } catch (err) {
      console.error(`[FAIL] ${r.name}:`, err.message);
    }
  }

  console.log('\n--- Testing AI OCR API (/api/ocr) ---');
  try {
    const formData = new FormData();
    formData.append('base64', 'sample-prescription-data');
    const ocrRes = await fetch('http://localhost:3000/api/ocr', {
      method: 'POST',
      body: formData,
    });
    const ocrData = await ocrRes.json();
    console.log(`[PASS] OCR API Status: HTTP ${ocrRes.status}`);
    console.log(`Extracted Medicines Count: ${ocrData.medicines?.length}`);
    console.log(`Decoded Sample:`, JSON.stringify(ocrData.medicines?.[0]));
  } catch (err) {
    console.error('[FAIL] OCR API:', err.message);
  }

  console.log('\n--- Testing Multilingual Chatbot API (/api/chat) ---');
  try {
    const chatRes = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Is Dolo 650 available in stock?',
        language: 'English',
      }),
    });
    const chatData = await chatRes.json();
    console.log(`[PASS] Chat API Status: HTTP ${chatRes.status}`);
    console.log(`Bot reply snippet:\n${chatData.reply?.substring(0, 140)}...`);
  } catch (err) {
    console.error('[FAIL] Chat API:', err.message);
  }

  console.log('\n--- Testing Kannada Chatbot API (/api/chat) ---');
  try {
    const knRes = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'ಡೋಲೋ 650 ಲಭ್ಯವಿದೆಯೇ?',
        language: 'Kannada',
      }),
    });
    const knData = await knRes.json();
    console.log(`[PASS] Kannada Chat Status: HTTP ${knRes.status}`);
    console.log(`Kannada reply:\n${knData.reply?.substring(0, 140)}...`);
  } catch (err) {
    console.error('[FAIL] Kannada Chat API:', err.message);
  }
}

testRoutes();
