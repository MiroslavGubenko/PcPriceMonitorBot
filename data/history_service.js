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
    priceHistory[key] = { [currentDate]: newHistory };
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
