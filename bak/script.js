document.getElementById('taxForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const wakeCountyTaxRate = {
        oldRate: 0.6570,
        newRate: 0.5135,
        revenueNeutralRate: 0.4633,
        budgetLink: "https://www.wakegov.com/departments-government/finance/annual-budget"
    };

    const townTaxRates = {
        "Unincorporated Wake County": { oldRate: 0, newRate: 0, revenueNeutralRate: 0, budgetLink: "" },
        "Apex": { oldRate: 0.44, newRate: 0.34, revenueNeutralRate: 0.302, budgetLink: "https://apexnc.org/153/Budget" },
        "Cary": { oldRate: 0.345, newRate: 0.325, revenueNeutralRate: 0.244, budgetLink: "" },
        "Fuquay Varina": { oldRate: 0.455, newRate: 0.358, revenueNeutralRate: 0.318, budgetLink: "" },
        "Garner": { oldRate: 0.6270, newRate: 0.52, revenueNeutralRate: 0.435, budgetLink: "" },
        "Holly Springs": { oldRate: 0.4216, newRate: 0.3435, revenueNeutralRate: 0.295, budgetLink: "" },
        "Knightdale": { oldRate: 0.475, newRate: 0.44, revenueNeutralRate: 0.300, budgetLink: "" },
        "Morrisville": { oldRate: 0.39, newRate: 0.35, revenueNeutralRate: 0.300, budgetLink: "" },
        "Raleigh": { oldRate: 0.4330, newRate: 0.3550, revenueNeutralRate: 0.317, budgetLink: "" },
        "Rolesville": { oldRate: 0.46, newRate: 0.40, revenueNeutralRate: 0.323, budgetLink: "" },
        "Wake Forest": { oldRate: 0.505, newRate: 0.42, revenueNeutralRate: 0.346, budgetLink: "" },
        "Wendell": { oldRate: 0.47, newRate: 0.42, revenueNeutralRate: 0.290, budgetLink: "" },
        "Zebulon": { oldRate: 0.575, newRate: 0.577, revenueNeutralRate: 0.454, budgetLink: "" }
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

    // Retrieve the input values
    const prevValuation = parseFloat(document.getElementById('prevValuation').value);
    const newValuation = parseFloat(document.getElementById('newValuation').value);
    const town = document.getElementById('town').value;

    const townTaxRate = townTaxRates[town];
    
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
    document.getElementById('revaluationChange').innerText = `$${revaluationChange.toFixed(2)}`;
    document.getElementById('countyTaxChange').innerText = `$${countyTaxChange.toFixed(2)}`;

    // Show or hide the town tax change based on the selected town
    if (town === "Unincorporated Wake County") {
        document.getElementById('townTaxChangeContainer').style.display = 'none';
    } else {
        document.getElementById('townTaxChangeContainer').style.display = 'block';
        document.getElementById('townTaxChange').innerText = `$${townTaxChange.toFixed(2)}`;
    }

    // Contextual explanations with budget links
    let revaluationContext = `The revaluation change for your property in ${town} is $${revaluationChange.toFixed(2)}. Your property ${revaluationChange > 0 ? 'went up in value more than average, resulting in an increase' : 'went up in value less than average, resulting in a decrease'} in your property tax bill.`;

    let countyContext = `The county tax change for ${town} is $${countyTaxChange.toFixed(2)}, accounting for ${((countyTaxChange / totalChange) * 100).toFixed(2)}% of the total change in your tax bill.`;

    const townCategory = getTownCategory(town);
    let townContext = `The town tax change for ${town} is $${townTaxChange.toFixed(2)}, accounting for ${((townTaxChange / totalChange) * 100).toFixed(2)}% of the total change in your tax bill.`;
    
    if (townCategory === 'lowest') {
        townContext += ` ${town} had one of the lowest tax increases in the county.`;
    } else if (townCategory === 'highest') {
        townContext += ` ${town} had one of the highest tax increases in the county.`;
    } else {
        townContext += ` ${town}'s tax increase was about average compared to other towns in the county.`;
    }

    // Set the explanations with context
    document.getElementById('revaluationChangeExplanation').innerText = revaluationContext;
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

    document.getElementById('results').style.display = 'block';
});

function toggleExplanation(elementId) {
    const explanationElement = document.getElementById(elementId + "Explanation");
    const iconElement = document.getElementById(elementId + "Icon");

    if (explanationElement.style.display === 'block') {
        explanationElement.style.display = 'none';
        iconElement.innerText = '+';
    } else {
        explanationElement.style.display = 'block';
        iconElement.innerText = '-';
    }
}

// Initialize explanations as collapsed
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.explanation').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.icon').forEach(el => el.innerText = '+');
});

