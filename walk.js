

var NUMBER_ACRES = 10000
var NUMBER_SEEDS = 20
var NUM_YEARS = 10
var NUM_SEASONS = 4
var NUM_EXP_PER_SEASON = 50


/**
 * Our current solution always runs experiment every single year for the entirety
 * of the 10 year period. One downside of this is that for half of our crops for
 * any given season, we might potentially be losing revenue because they are completely
 * random.
 *
 * One way around this is to keep track of ALL experiments ran for every single season.
 * Then run these experiments for only 5 years. After 5 years, take the top performing
 * 200 experiments across all data points, and repeat those every single year to maximize
 * profit.
 *
 * So you can have a scenario where you have 250 past experiments for every single season,
 * and the top performing 200 experiments might mostly come from one particular season.
 * That's totally fine since we are only constrained by 200 experiments per year, and not
 * abide by any seasonal rules.
 */


function maximize_revenue() {
    // Represents the last ran experiments on the given season
    // [
    //      0 -> [ {"seedA", "acre1", "1000"}, {"seedB", "acre2", "500"} ... ],
    //      1 -> [ {"seedA", "acre12", "1000"}, {"seedB", "acre2", "500"} ... ],
    //      2 -> [ {"seedA", "acre31", "1000"}, {"seedB", "acre2", "500"} ... ],
    //      3 -> [ {"seedA", "acre1", "1000"}, {"seedB", "acre2", "500"} ... ],
    // ]
    var picks = array(NUM_SEASONS)

    // Iterate through all 10 years
    for (i -> NUM_YEARS) {
        // For each year, go through all 4 seasons
        for (j -> NUM_SEASONS) {
            // IF we don't have a previous pick for the current season
            // simply generate a random list of seeds / acres to experiment on
            if (!picks[j]) {
                // No prior data for season j
                // Generate an array of 50 seeds / acres combination
                picks[j] = randomize_seeds(num_tests_per_season)
            } else {
                // We have prior data for season j
                // Run optimization where we keep top performing 50% of the
                // seed / acre combination, and replace the bottom 50% with
                // random seed / acre combination
                picks[j] = optimize_seeds(picks[j])
            }
        }
    }
}

function randomize_seeds() {
    // Generate 50 random numbers where each number is between 0 and NUMBER_ACRES
    var random_acres = generateRandomList(NUMBER_ACRES);
    // Generate 50 random numbers where each number is between 0 and NUMBER_SEEDS,
    // BUT we allow for duplicates
    var random_seeds = generateRandomList(NUMBER_SEEDS, allow_duplicates = true);

    // Combine the data from above into an array of picks
    var result = []
    for (i -> NUM_EXP_PER_SEASON) {
        // Figure out how much money we made from each seed / acre pick
        result[i] = new Pick(
            random_seeds[i],
            random_acres[i],
            calculate_yield(...)
        );
    }
    return result;
}

function optimize_seeds(original_picks) {
    // Sort the picks based on price_sold
    sort(original_picks, compare_pick);

    var top_performing_cutoff = NUM_EXP_PER_SEASON / 2;

    // Find the top performing 50% of the picks, and put their acres
    // into an array so we know that we can't use those acres
    var used_acres = []
    for (i -> top_performing_cutoff) {
        used_acres[i] = original_picks[i].acre;
    }

    // Go through the bottom performing 50%, replace them with a new
    // random seed / acre combination
    for (i = top_performing_cutoff -> NUM_EXP_PER_SEASON) {

        // Generate a random acre that is NOT USED
        acre = generateRandomNumber(NUMBER_ACRES, used_acres)

        // Generate a random pick
        random_acres[i] = new Pick(
            generateRandomNumber(NUMBER_SEEDS, null),
            acre,
            calculate_yield(...)
        );

        // Put our used acre into used_acres so we don't overlap with acres
        used_acres.push(acre)
    }

    // After the top loop is finished, we should have the top performing 25
    // of the seed/acre, and a random 25 seed/acre combinations in the picks

    return original_picks;
}

// this will sort the high price_sold picks to the front of the list
function compare_pick(pick1, pick2) {
    if (pick1.price_sold > pick2.price_sold) {
        return -1;
    } else if (pick1.price_sold == pick2.price_sold) {
        return 0;
    } else {
        return 1;
    }
}

// maximum is not inclusive
function generateRandomList(maximum, allow_duplicates = false) {
    var result = [];
    for (i -> NUM_EXP_PER_SEASON) {
        if (allow_duplicates) {
            result[i] = generateRandomNumber(maximum, null);
        } else {
            result[i] = generateRandomNumber(maximum, result);
        }
    }
    return result;
}

function generateRandomNumber(maximum, list_of_used_numbers) {
    var random = Math.random(0, maximum);
    while (list_of_used_numbers.contains(random)) {
        random++;
        if (random >= maximum) {
            random = 0;
        }
    }
    return random;
}

class Pick {
    var seed;   // 0 - 19
    var acre;   // 0 - 9999
    var price_sold;
}
