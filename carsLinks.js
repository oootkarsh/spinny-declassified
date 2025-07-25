const fs = require('fs');

function generateSpinnyCarLinksFromIds(inputFile = 'car_ids.json', outputFile = 'car_links.json') {
  const baseURL = 'https://www.spinny.com/buy-used-cars/karnal/hyundai/elite-i20/sportz-plus-14-crdi-karnal-road-2020';

  console.log(`\n🔍 Reading car IDs from ${inputFile}...`);
  const raw = fs.readFileSync(inputFile, 'utf-8');
  const carIds = JSON.parse(raw);

  const links = carIds.map(id => `${baseURL}/${id}/`);

  fs.writeFileSync(outputFile, JSON.stringify(links, null, 2), 'utf-8');
  console.log(`✅ Generated ${links.length} links and saved to ${outputFile}`);
}

generateSpinnyCarLinksFromIds('car_ids.json', 'car_links.json');