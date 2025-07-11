const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

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
  let browser
 
  const { url, priceSelector, storeName } = storeConfig;
  
  try {
    browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    await page.goto(url, {waitUntil:'networkidle2'})
    await page.waitForSelector(priceSelector)

    const price = extractPrice(await page.$eval(priceSelector,el => el.textContent))
    console.log(price)
    if (!price) {
      console.log(storeName, "NO PRICE!!!🔴")
      return { storeName, url, price: null, error: 'Price not found.' };
    }
    console.log('\n\n--------------------------------------------\n\n')
    return { storeName, url, price };

  } catch (error) {
    console.error(`Error parsing ${url}:`, error.message);
    return { storeName, url, price: null, error: error.message };
  } finally{
    await browser.close()
  }
}

module.exports = { parsePrice };