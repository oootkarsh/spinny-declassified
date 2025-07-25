const fs = require('fs');

function extractCarIdsFromFile(inputFile = 'sorted_cars.json', outputFile = 'car_ids.json') {
  console.log(`\n🔍 Reading sorted cars from ${inputFile}...`);
  const raw = fs.readFileSync(inputFile, 'utf-8');
  const cars = JSON.parse(raw);

  const carIds = cars.map(car => car.id);

  fs.writeFileSync(outputFile, JSON.stringify(carIds, null, 2), 'utf-8');
  console.log(`✅ Extracted ${carIds.length} car IDs and saved to ${outputFile}`);
}

extractCarIdsFromFile('sorted_cars.json', 'car_ids.json');