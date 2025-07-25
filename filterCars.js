const fs = require('fs');

function parsePrice(priceString) {
  return parseInt(priceString.replace(/,/g, ''));
}

function filterCarsByBudget(inputPath, outputPath, maxBudget) {
  // Read and parse the input file
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const cars = JSON.parse(rawData);

  // Filter cars within the given budget
  const filteredCars = cars.filter(car => parsePrice(car.price) <= maxBudget);

  // Write the filtered cars to a new file
  fs.writeFileSync(outputPath, JSON.stringify(filteredCars, null, 2), 'utf-8');

  console.log(`Filtered ${filteredCars.length} cars under ₹${maxBudget.toLocaleString()} saved to ${outputPath}`);
}

// Example usage: filter cars under 5.5 lakhs
filterCarsByBudget('minimal_cars.json', 'filtered_cars.json', 700000);