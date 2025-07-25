const fs = require('fs');

function extractMinimalCarInfo(inputFile = 'sorted_cars.json', outputFile = 'minimal_cars.json') {
  console.log(`\n📦 Reading cars from ${inputFile}...`);
  const raw = fs.readFileSync(inputFile, 'utf-8');
  const cars = JSON.parse(raw);

  const minimalCars = cars.map(car => {
    const data = car.data?.data || {};
    return {
      id: car.id,
      model: data.model || 'Unknown',
      price: data.price || 'N/A',
      year: data.make_year || 'Unknown',
      mileage: data.mileage || 'N/A'
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(minimalCars, null, 2), 'utf-8');
  console.log(`✅ Extracted ${minimalCars.length} minimal records to ${outputFile}`);
}

extractMinimalCarInfo('sorted_cars.json', 'minimal_cars.json');