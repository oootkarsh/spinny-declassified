const fs = require('fs');
const https = require('https');

const BASE_URL = "https://api.spinny.com/v3/api/listing/v3/";
const QUERY = "?city=delhi-ncr&product_type=cars&category=used&show_max_on_assured=true&custom_budget_sort=true&prioritize_filter_listing=true&high_intent_required=true&active_banner=true&is_max_certified=0";

async function fetchPage(page) {
  const url = `${BASE_URL}${QUERY}&page=${page}`;
  console.log(`📡 Fetching page ${page}...`);

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(`❌ Failed to parse JSON from page ${page}: ${err}`);
        }
      });
    }).on('error', err => {
      reject(`❌ Error fetching page ${page}: ${err.message}`);
    });
  });
}

function extractAvailableCarIds(data) {
  const ids = new Set();

  const filterAvailable = car =>
    car.id !== undefined && car.inventory_status !== "sold";

  if (Array.isArray(data.high_intent)) {
    data.high_intent.filter(filterAvailable).forEach(car => ids.add(car.id));
  }

  if (Array.isArray(data.results)) {
    data.results.filter(filterAvailable).forEach(car => ids.add(car.id));
  }

  return ids;
}

async function getAllCarIds() {
  let page = 1;
  const allIds = new Set();

  while (true) {
    try {
      const data = await fetchPage(page);
      const currentIds = extractAvailableCarIds(data);

      if (currentIds.size === 0) {
        console.log(`📭 No available cars found on page ${page}. Stopping.`);
        break;
      }

      console.log(`✅ Page ${page}: ${currentIds.size} available cars`);
      currentIds.forEach(id => allIds.add(id));
      page++;

    } catch (error) {
      console.error(`❌ Error on page ${page}: ${error}`);
      break;
    }
  }

  const finalIds = Array.from(allIds);
  fs.writeFileSync('car_ids.json', JSON.stringify(finalIds, null, 2));
  console.log(`🎉 Saved ${finalIds.length} unique AVAILABLE car IDs to car_ids.json`);
}

getAllCarIds();