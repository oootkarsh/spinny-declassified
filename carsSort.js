const fs = require('fs');

// Utility: Normalize between 0 and 1
function normalize(value, min, max) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

// Score function with detailed logging
function calculateScore(car, context) {
  const data = car.data?.data || {};
  const id = car.id;
  const model = data.model || 'Unknown Model';

  // 1. Mileage
  const mileage = parseInt((data.mileage || '0').replace(/,/g, ''), 10);
  const mileageScore = 1 - normalize(mileage, context.minMileage, context.maxMileage);

  // 2. Price
  const price = parseInt((data.price || '0').replace(/,/g, ''), 10);
  const priceScore = 1 - normalize(price, context.minPrice, context.maxPrice);

  // 3. Age
  const makeYear = data.make_year || new Date().getFullYear();
  const age = new Date().getFullYear() - makeYear;
  const ageScore = 1 - normalize(age, context.minAge, context.maxAge);

  // 4. Freshly serviced
  const serviceNote = data.next_service_date_description || '';
  const freshServiceScore = serviceNote.includes('Freshly') ? 1 : 0;

  // 5. Imperfections
  const sectionData = data.inspection_report?.report?.sections || [];
  const bodyPanelSection = sectionData.find(s => s.data?.[0]?.subSection === "Body Panels");
  const imperfectionStatements = bodyPanelSection?.data?.[0]?.statement || [];
  const scratchCount = imperfectionStatements.find(s => s.includes("scratch")) ? parseInt(imperfectionStatements.find(s => s.includes("scratch")).split(" ")[0]) : 0;
  const dentCount = imperfectionStatements.find(s => s.includes("dent")) ? parseInt(imperfectionStatements.find(s => s.includes("dent")).split(" ")[0]) : 0;
  const imperfectionTotal = scratchCount + dentCount;
  const imperfectionScore = 1 - normalize(imperfectionTotal, context.minImperfections, context.maxImperfections);

  // 6. Add-on services
  const addons = data.price_breakdown_v2?.base_add_on_data_list || [];
  const addonScore = addons.length > 0 ? 1 : 0;

  // Final weighted score
  const finalScore = (
    mileageScore * 0.1 + 
    priceScore * 0.3 +
    ageScore * 0.1 +
    freshServiceScore * 0.15 +
    imperfectionScore * 0.25 +
    addonScore * 0.1
  );

  console.log(`Processed Car ID: ${id}, Model: ${model}, Score: ${finalScore.toFixed(3)}`);

  return finalScore;
}

// Main function
function rankCarsByReliabilityAndCost(filename) {
  console.log("Loading data...");
  const raw = fs.readFileSync(filename);
  const cars = JSON.parse(raw);

  console.log(`Total cars to process: ${cars.length}`);

  // Prepare context for normalization
  const mileages = cars.map(c => parseInt((c.data?.data?.mileage || '0').replace(/,/g, ''), 10));
  const prices = cars.map(c => parseInt((c.data?.data?.price || '0').replace(/,/g, ''), 10));
  const ages = cars.map(c => new Date().getFullYear() - (c.data?.data?.make_year || new Date().getFullYear()));
  const imperfections = cars.map(c => {
    const sectionData = c.data?.data?.inspection_report?.report?.sections || [];
    const bodyPanelSection = sectionData.find(s => s.data?.[0]?.subSection === "Body Panels");
    const statements = bodyPanelSection?.data?.[0]?.statement || [];
    const scratches = statements.find(s => s.includes("scratch")) ? parseInt(statements.find(s => s.includes("scratch")).split(" ")[0]) : 0;
    const dents = statements.find(s => s.includes("dent")) ? parseInt(statements.find(s => s.includes("dent")).split(" ")[0]) : 0;
    return scratches + dents;
  });

  const context = {
    minMileage: Math.min(...mileages),
    maxMileage: Math.max(...mileages),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minAge: Math.min(...ages),
    maxAge: Math.max(...ages),
    minImperfections: Math.min(...imperfections),
    maxImperfections: Math.max(...imperfections)
  };

  console.log("Scoring cars based on reliability and cost...");

  const scoredCars = cars.map(car => ({
    ...car,
    score: calculateScore(car, context)
  }));

  scoredCars.sort((a, b) => b.score - a.score);

  console.log("\n--- TOP SORTED CARS ---");
  scoredCars.forEach((car, index) => {
    const model = car.data?.data?.model || 'Unknown';
    const price = car.data?.data?.price;
    const mileage = car.data?.data?.mileage;
    const year = car.data?.data?.make_year;
    console.log(`${index + 1}. ID: ${car.id}, Model: ${model}, Year: ${year}, Price: ${price}, Mileage: ${mileage}, Score: ${car.score.toFixed(3)}`);
  });

  return scoredCars;
}

function saveSortedCarsToFile(sortedCars, outputFilename = 'sorted_cars.json') {
  const jsonData = JSON.stringify(sortedCars, null, 2); // pretty print with 2 spaces
  fs.writeFileSync(outputFilename, jsonData, 'utf-8');
  console.log(`\n✅ Sorted cars saved to ${outputFilename}`);
}

// Example usage
const sortedCars = rankCarsByReliabilityAndCost('car_price_data.json');

saveSortedCarsToFile(sortedCars, 'sorted_cars.json');