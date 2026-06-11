const { getBrowser } = require('../browserPool');

// Универсальная функция для извлечения числа из строки
function extractPrice(text) {
  if (!text) return null;
  // Заменяем пробелы, запятые и символы валют, оставляем только цифры
  const cleanedText = text.replace(/\s|&nbsp;/g, '').replace(/\D/g, '');
  const match = cleanedText.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Парсит страницу товара для получения цены.
 * @param {object} storeConfig - Упрощённая конфигурация магазина.
 * @returns {Promise<object>}
 */
async function parsePrice(storeConfig) {
  let browser;
  let context;

  const { url, priceSelector, storeName } = storeConfig;

  if (!url || !priceSelector) {
    return {
      storeName,
      url,
      price: null,
      error: 'Missing url or priceSelector.',
    };
  }

  try {
    browser = await getBrowser();

    // Создаём контекст с заданным user agent
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    console.log('FROM PLAYWRIGHT : ', url);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector(priceSelector, { timeout: 60000 });

    const rawText = await page.textContent(priceSelector);
    const price = extractPrice(rawText ? rawText.trim() : null);

    console.log(price);
    if (!price) {
      console.log(storeName, 'NO PRICE!!!🔴');
      return { storeName, url, price: null, error: 'Price not found.' };
    }

    console.log('\n\n--------------------------------------------\n\n');
    return { storeName, url, price };
  } catch (error) {
    console.error(`Error parsing ${url}:`, error.message);
    return { storeName, url, price: null, error: error.message };
  } finally {
    try {
      if (context) await context.close();
    } catch (e) {
      console.error('Error closing context:', e && e.message ? e.message : e);
    }
  }
}

module.exports = { parsePrice };
