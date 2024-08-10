function cleanInput(input) {
    // This regex replaces anything that is not a digit or period with an empty string
    return input.replace(/[^0-9.]/g, '');
}

document.getElementById('taxForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const wakeCountyTaxRate = {
        oldRate: 0.6570,
        newRate: 0.5135,
        revenueNeutralRate: 0.4633,
        budgetLink: "https://www.wake.gov/departments-government/budget-management-services/wake-board-adopts-208-billion-budget-fiscal-year-2025"
    };

    const townTaxRates = {
        "Unincorporated Wake County": { oldRate: 0.6570, newRate: 0.5135, revenueNeutralRate: 0.4633, budgetLink: "" },
        "Apex": { oldRate: 0.44, newRate: 0.34, revenueNeutralRate: 0.302, budgetLink: "https://apexnc.org/153/Budget" },
        "Cary": { oldRate: 0.345, newRate: 0.325, revenueNeutralRate: 0.244, budgetLink: "https://www.carync.gov/services-publications/plans-publications-reports/budget" },
        "Fuquay Varina": { oldRate: 0.455, newRate: 0.358, revenueNeutralRate: 0.318, budgetLink: "https://www.fuquay-varina.org/200/Budget-Information" },
        "Garner": { oldRate: 0.6270, newRate: 0.52, revenueNeutralRate: 0.435, budgetLink: "https://www.garnernc.gov/departments/budget" },
        "Holly Springs": { oldRate: 0.4216, newRate: 0.3435, revenueNeutralRate: 0.295, budgetLink: "https://www.hollyspringsnc.gov/174/Budget-and-Financial-Reports" },
        "Knightdale": { oldRate: 0.475, newRate: 0.44, revenueNeutralRate: 0.300, budgetLink: "https://www.knightdalenc.gov/finance/budget" },
        "Morrisville": { oldRate: 0.39, newRate: 0.35, revenueNeutralRate: 0.300, budgetLink: "https://www.morrisvillenc.gov/government/departments-services/budget" },
        "Raleigh": { oldRate: 0.4330, newRate: 0.3550, revenueNeutralRate: 0.317, budgetLink: "https://raleighnc.gov/grants-funding-and-relief/services/current-city-budget" },
        "Rolesville": { oldRate: 0.46, newRate: 0.40, revenueNeutralRate: 0.323, budgetLink: "https://www.rolesvillenc.gov/finance/financial-documents" },
        "Wake Forest": { oldRate: 0.505, newRate: 0.42, revenueNeutralRate: 0.346, budgetLink: "https://www.wakeforestnc.gov/budget-management/budget" },
        "Wendell": { oldRate: 0.47, newRate: 0.42, revenueNeutralRate: 0.290, budgetLink: "https://townofwendellnc.gov/departments/finance/budget,_fees,_and_reports.php" },
        "Zebulon": { oldRate: 0.575, newRate: 0.577, revenueNeutralRate: 0.454, budgetLink: "https://www.townofzebulon.org/finance/fee-schedules-and-budgets" }
    };

    // Calculate tax rate changes for each town
    const townRateChanges = [];
    for (const [town, data] of Object.entries(townTaxRates)) {
        const rateChange = data.newRate - data.revenueNeutralRate;
        townRateChanges.push({ town, rateChange });
    }

    // Sort towns by rate change to classify them
    townRateChanges.sort((a, b) => a.rateChange - b.rateChange);

    const lowestIncreases = townRateChanges.slice(0, Math.ceil(townRateChanges.length / 3));
    const highestIncreases = townRateChanges.slice(-Math.ceil(townRateChanges.length / 3));

    const getTownCategory = (town) => {
        if (lowestIncreases.some(t => t.town === town)) return 'lowest';
        if (highestIncreases.some(t => t.town === town)) return 'highest';
        return 'average';
    };

    function classifyTaxRate(town) {
        const rates = Object.values(townTaxRates).map(info => info.newRate);
        const averageRate = rates.reduce((acc, curr) => acc + curr, 0) / rates.length;
        const sortedRates = [...rates].sort((a, b) => a - b);
        const lowest = sortedRates[0];
        const highest = sortedRates[sortedRates.length - 1];
        
        // Determine thresholds for "one of the lowest" and "one of the highest"
        const lowerThreshold = sortedRates[Math.floor(sortedRates.length / 3)];
        const upperThreshold = sortedRates[Math.ceil(2 * sortedRates.length / 3)];
        
        const townRate = townTaxRates[town].newRate;
    
        if (townRate === lowest) {
            return "the lowest tax rate";
        } else if (townRate === highest) {
            return "the highest tax rate";
        } else if (townRate <= lowerThreshold) {
            return "one of the lowest tax rates";
        } else if (townRate >= upperThreshold) {
            return "one of the highest tax rates";
        } else {
            return "an average tax rate";
        }
    }
    
    // Example Usage
    console.log(classifyTaxRate("Raleigh"));  // Output classification based on Raleigh's tax rate
    
    
    // Clean input
    var prevValuationField = document.getElementById('prevValuation');
    prevValuationField.value = cleanInput(prevValuationField.value);
    var newValuationField = document.getElementById('newValuation');
    newValuationField.value = cleanInput(newValuationField.value);

    // Retrieve the input values
    const prevValuation = parseFloat(document.getElementById('prevValuation').value);
    const newValuation = parseFloat(document.getElementById('newValuation').value);
    const town = document.getElementById('town').value;

    const townTaxRate = townTaxRates[town];
    const rateChange = (townTaxRates[town].newRate - townTaxRates[town].revenueNeutralRate).toFixed(2);

    // Calculate the old tax bill
    const oldCountyTax = ((prevValuation / 100) * wakeCountyTaxRate.oldRate) + 20;
    const oldTownTax = town === "Unincorporated Wake County" ? 0 : ((prevValuation / 100) * townTaxRate.oldRate);
    const oldTaxBill = oldCountyTax + oldTownTax;

    // Calculate the new tax bill
    const newCountyTax = ((newValuation / 100) * wakeCountyTaxRate.newRate) + 20;
    const newTownTax = town === "Unincorporated Wake County" ? 0 : ((newValuation / 100) * townTaxRate.newRate);
    const newTaxBill = newCountyTax + newTownTax;

    // Calculate the revenue-neutral tax bill
    const revenueNeutralCountyTax = ((newValuation / 100) * wakeCountyTaxRate.revenueNeutralRate) + 20;
    const revenueNeutralTownTax = town === "Unincorporated Wake County" ? 0 : ((newValuation / 100) * townTaxRate.revenueNeutralRate);
    const revenueNeutralTaxBill = revenueNeutralCountyTax + revenueNeutralTownTax;

    // Calculate changes
    const revaluationChange = revenueNeutralTaxBill - oldTaxBill;
    const countyTaxChange = newCountyTax - revenueNeutralCountyTax;
    const townTaxChange = newTownTax - revenueNeutralTownTax;

    // Calculate the total change and percentage for the new tax bill
    const totalChange = newTaxBill - oldTaxBill;
    const newTaxPercentageChange = ((newTaxBill - oldTaxBill) / oldTaxBill) * 100;

    // Display results
    document.getElementById('oldTaxBill').innerText = `$${oldTaxBill.toFixed(2)}`;
    document.getElementById('newTaxBill').innerText = `New Tax Bill: $${newTaxBill.toFixed(2)} (${newTaxPercentageChange.toFixed(2)}% change)`;
    document.getElementById('revaluationChange').innerText =  `${revaluationChange > 0 ? '+' : ''}$${revaluationChange.toFixed(2)}`;
    document.getElementById('countyTaxChange').innerText = `${countyTaxChange > 0 ? '+' : ''}$${countyTaxChange.toFixed(2)}`;
    
    // Show or hide the town tax change based on the selected town
    if (town === "Unincorporated Wake County") {
        document.getElementById('townTaxChangeContainer').style.display = 'none';
    } else {
        document.getElementById('townTaxChangeContainer').style.display = 'block';
        document.getElementById('townTaxChange').innerText = `${townTaxChange > 0 ? '+' : ''}$${townTaxChange.toFixed(2)}`;
    }

    // Contextual explanations with budget links
    let revaluationContext = `This is the portion of your new tax bill which is attributable solely to the change in your property's value. Your property ${revaluationChange > 0 ? 'went up in value more than average, resulting in an increase' : 'went up in value less than average, resulting in a decrease'} to your tax bill.\n\n`;
    revaluationContext += `It's important to understand that this change in of itself didn't result in any additional revenue for the county or town, but rather a redistribution of the tax burden based on the change in property values.\n\n`;
    revaluationContext += `This was not the result of any policy decision, but rather the result of a state mandated property revaluation process.\n\n`

    let countyContext = `The County Commissioners in June 2024 passed a new budget which increased the tax rate by approximately 5 cents on top of the revenue neutral rate. The county tax change accounts for ${((countyTaxChange / totalChange) * 100).toFixed(2)}% of the change in your tax bill.`;

    const townCategory = getTownCategory(town);
    let townContext = `${town} passed a new budget in June 2024 which raised your tax bill by $${townTaxChange.toFixed(2)}, accounting for ${((townTaxChange / totalChange) * 100).toFixed(2)}% of the total change from last year.`;
    
    if (townCategory === 'lowest') {
        townContext += ` ${town} had one of the lowest tax increases in the county at ${rateChange} per $100 accessed value.`;
    } else if (townCategory === 'highest') {
        townContext += ` ${town} had one of the highest tax increases in the county at ${rateChange} per $100 accessed value.`;
    } else {
        townContext += ` ${town}'s tax increase was about average compared to other towns in the county at ${rateChange} per $100 accessed value.`;
    }

    townContext += ` ${town} currently has ${classifyTaxRate(town)} compared to the rest of the county.`;

    // Set the explanations with context
    document.getElementById('revaluationChangeExplanation').innerText = revaluationContext;
    document.getElementById('revaluationChangeExplanation').innerHTML = revaluationContext;
    document.getElementById('countyTaxChangeExplanation').innerText = countyContext;
    
    if (town !== "Unincorporated Wake County") {
        document.getElementById('townTaxChangeExplanation').innerText = townContext;
    }

    // Add budget links if available
    if (wakeCountyTaxRate.budgetLink) {
        document.getElementById('countyTaxChangeExplanation').innerHTML += `<p>For more details, you can review the county's budget <a href="${wakeCountyTaxRate.budgetLink}" target="_blank">here</a>.</p>`;
    }
    if (town !== "Unincorporated Wake County" && townTaxRate.budgetLink) {
        document.getElementById('townTaxChangeExplanation').innerHTML += `<p>For more details, you can review ${town}'s budget <a href="${townTaxRate.budgetLink}" target="_blank">here</a>.</p>`;
    }

    let chartStatus = Chart.getChart('taxChart');
    if (chartStatus != undefined)
        chartStatus.destroy();
    let chartStatusPie = Chart.getChart('taxCompositionChart');
    if (chartStatusPie != undefined)
        chartStatusPie.destroy();
    // Rendering the chart

    const ctx = document.getElementById('taxChart').getContext('2d');
    const taxChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2023 Tax Bill', '2024 Tax Bill'],
            datasets: [{
                label: 'Tax Amount ($)',
                data: [oldTaxBill, newTaxBill],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
	    animations: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const revaluationChangeCapped = revaluationChange > 0 ? revaluationChange : 0;

    // Assuming variables like oldTaxBill, revaluationChange, countyTaxChange, and townTaxChange are already defined and calculated
    const ctxPie = document.getElementById('taxCompositionChart').getContext('2d');
    const taxCompositionChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Old Tax Bill', 'Revaluation Change', 'County Tax Change', 'Town Tax Change'],
            datasets: [{
                label: 'Tax Composition',
                data: [oldTaxBill, revaluationChangeCapped, countyTaxChange, townTaxChange],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            animations: false,
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            onClick: function(evt, element) {
                if (element.length > 0) {
                    const index = element[0].index;
                    const label = this.data.labels[index];
                    const elementId = getSectionIdFromLabel(label);
                    toggleExplanation(elementId);
                }
            }
        }
    });
    document.getElementById('results').style.display = 'block';
});

function getSectionIdFromLabel(label) {
    switch (label) {
        case 'Old Tax Bill':
            return 'oldTaxBillExplanation';  // Adjust if the actual IDs differ
        case 'Revaluation Change':
            return 'revaluationChange';
        case 'County Tax Change':
            return 'countyTaxChange';
        case 'Town Tax Change':
            return 'townTaxChange';
        default:
            return '';  // Return an empty string or a default ID if needed
    }
}

function toggleExplanation(elementId) {
    const explanationElement = document.getElementById(elementId + "Explanation");
    const iconElement = document.getElementById(elementId + "Icon");

    const isExpanded = explanationElement.style.display === 'block';

    explanationElement.style.display = isExpanded ? 'none' : 'block';
    if (isExpanded) {
        iconElement.classList.add('collapsed');  // Rotate chevron to right
    } else {
        iconElement.classList.remove('collapsed');  // Rotate chevron down
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Hide all explanation elements
    document.querySelectorAll('.explanation').forEach(el => el.style.display = 'none');
    
    // Set all icons to the right-facing chevron by adding the 'collapsed' class
    document.querySelectorAll('.icon').forEach(icon => {
        icon.classList.add('collapsed'); // Ensure the 'collapsed' class rotates the chevron
        icon.innerText = '▼'; // Set the text to a down chevron
    });
});

