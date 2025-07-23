const { Telegraf } = require('telegraf');
const { parsePrice } = require('./parsers/baseParser');
const { historyService } = require('./data/history_service');
const { generatePriceReport } = require('./data/history_reporter');
const components = require('./config/components.json');
const settings = require('./config/settings.json');
const historyManager = historyService();
//require('dotenv').config(); // for local dev. Create .env file and add BOT_TOKEN and CHAT_ID
// Загрузка секретов из переменных окружения
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error(
    'Error: BOT_TOKEN and CHAT_ID must be set in environment variables.'
  );
  process.exit(1);
}
const currentDate = new Date().toLocaleDateString('ru-RU');
const bot = new Telegraf(BOT_TOKEN);

async function main() {
  console.log('Starting price monitoring...');
  await historyManager.loadCurrentHistory();
  let bestPricesReport = `⭐ Лучшие сегодня \n`;
  let report = `${settings.telegram.reportTitle}\n\n ${currentDate} \n\n`;

  for (const component of components) {
    report += `*${component.name}*\n`;

    const prices = [];

    for (const url of component.urls) {
      const { hostname } = new URL(url);
      const storeName = hostname.replace(/^www\./, '');

      console.log('CURRENT store :=> ', storeName);
      const result = await parsePrice({
        url,
        priceSelector: settings.priceSelectors[storeName],
        storeName,
      });

      if (result.price) {
        prices.push({ [storeName]: result.price });

        report += `  - [${storeName}](${url}): *${result.price} ${settings.currencySymbol}*\n`;
      } else {
        report += `  - [${storeName}](${url}): _не удалось получить цену_\n`;
      }
    }

    // 3. Анализ и определение лучшей цены
    if (prices.length > 0) {
      let bestShop = null;
      let bestPrice = Infinity;
      let allPrices = [];

      for (const entry of prices) {
        const [shop, price] = Object.entries(entry)[0];
        allPrices.push(price);

        if (price < bestPrice) {
          bestPrice = price;
          bestShop = shop;
        }
      }
      const allEqual = allPrices.every((p) => p === allPrices[0]);
      bestPricesReport += `*${component.name}* \n`;
      if (allEqual) {
        report += ` *Все цены одинаковые: ${bestPrice} ${settings.currencySymbol}*\n\n`;
        bestPricesReport += ` *Все цены одинаковые: ${bestPrice} ${settings.currencySymbol}*\n\n`;
      } else {
        report += ` ✨ *Лучшее предложение: ${bestShop} — ${bestPrice} ${settings.currencySymbol}*\n\n`;
        bestPricesReport += `${bestShop} — ${bestPrice} ${settings.currencySymbol}\n\n`;
      }

      if (allPrices.length > 0) {
        const isFountDesiredCost = allPrices.some(
          (price) => price <= component.desiredCost
        );
        if (isFountDesiredCost) {
          report += `  _‼️ Срочно брать (желаемая цена: ${component.desiredCost})._\n\n`;
        }
      }
    } else {
      report += `  _Нет доступных предложений._\n\n`;
    }

    historyManager.addNewHistory(component.name, prices);
  }
  await historyManager.saveHistory();
  // console.log(report);
  try {
    await bot.telegram.sendMessage(CHAT_ID, report, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
    await bot.telegram.sendMessage(CHAT_ID, bestPricesReport, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
    console.log('Report sent successfully!');
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }

  if (new Date().getDay() === settings.historyReportDay) {
    const priceHistoryReport = generatePriceReport(
      historyManager.getPriceHistory()
    );
    try {
      await bot.telegram.sendMessage(CHAT_ID, priceHistoryReport, {
        parse_mode: 'Markdown',
        link_preview_options: {
          is_disabled: true,
        },
      });
      console.log('History Report sent successfully!');
    } catch (error) {
      console.error(
        'HISTORY_REPORT |  Failed to send Telegram message:',
        error
      );
    }
  }
}

main();
