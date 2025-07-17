function generatePriceReport(data, daysBack = 7, currencySymbol = 'грн.') {
  //console.log('Data =>', data);
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - daysBack);

  function formatDate(d) {
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  const startStr = formatDate(fromDate);
  const todayStr = formatDate(today);

  const lines = [
    `🛒 *Изменения цен за последние ${daysBack} дней (${startStr} – ${todayStr})*\n`,
  ];

  for (const [item, entries] of Object.entries(data)) {
    const pricesInPeriod = [];

    for (const rec of entries) {
      const date = Object.keys(rec)[0];
      if (date >= startStr && date <= todayStr) {
        const shops = rec[date];
        shops.forEach((sh) => {
          const [shop, price] = Object.entries(sh)[0];
          pricesInPeriod.push({ date, shop, price });
        });
      }
    }

    if (pricesInPeriod.length === 0) continue;

    let minRec = pricesInPeriod[0];
    pricesInPeriod.forEach((r) => {
      if (r.price < minRec.price) minRec = r;
    });

    const todayRecs = pricesInPeriod.filter((r) => r.date === todayStr);
    if (todayRecs.length === 0) continue;

    let todayMin = todayRecs[0];
    todayRecs.forEach((r) => {
      if (r.price < todayMin.price) todayMin = r;
    });

    const diffPrice = todayMin.price - minRec.price;
    let trend = '';
    if (diffPrice < 0) trend = '📉';
    else if (diffPrice > 0) trend = '📈';
    else trend = '➖';

    const line = `${trend} *${item}*\n${minRec.price} ${currencySymbol} (${
      minRec.shop
    }) → ${todayMin.price} ${currencySymbol} (${todayMin.shop}) = _${
      diffPrice > 0 ? '+' : ''
    }${diffPrice} ${currencySymbol}_\n`;
    // console.log('Line is ', line);
    lines.push(line);
  }
  //console.log('Current history report', lines);
  return lines.join('\n');
}

module.exports = { generatePriceReport };
