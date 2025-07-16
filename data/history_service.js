const fs = require('fs/promises');
const path = require('path');
const priceHistoryPath = path.join(__dirname, 'price_history.json');

function historyService() {
  let priceHistory = {};

  async function loadCurrentHistory() {
    console.log('Load history');
    try {
      const data = await fs.readFile(priceHistoryPath, 'utf8');
      priceHistory = JSON.parse(data);
    } catch (error) {
      console.log('Price history not found, creating new one.');
    }
    return priceHistory;
  }

  function addNewHistory(key, newHistory) {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    if (!priceHistory[key]) {
      priceHistory[key] = [];
    }

    const entryIndex = priceHistory[key].findIndex(
      (entry) => Object.keys(entry)[0] === currentDate
    );

    if (entryIndex !== -1) {
      console.log(`Updating price for ${key} on ${currentDate}`);
      priceHistory[key][entryIndex][currentDate] = newHistory;
    } else {
      console.log(`Adding new price for ${key} on ${currentDate}`);
      priceHistory[key].push({ [currentDate]: newHistory });
    }
  }

  async function saveHistory() {
    try {
      await fs.writeFile(
        priceHistoryPath,
        JSON.stringify(priceHistory, null, 2)
      );
    } catch (e) {
      console.warn('History is not saved. => ', e);
    }
  }
  return { priceHistory, loadCurrentHistory, addNewHistory, saveHistory };
}

module.exports = { historyService };
