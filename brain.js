class Brain {
    constructor(inputs, hiddenLayers, outputs) {
        // this.nnetwork = new neataptic.architect.Perceptron(inputs, 10, outputs);
        this.nnetwork = new neataptic.architect.Perceptron(inputs, ...hiddenLayers, outputs);
    }

    Save(filename) {
        let network = JSON.stringify(this.nnetwork.toJSON());
        let element = document.createElement('a');
        element.setAttribute('href', URL.createObjectURL(new Blob([network], { type: "application/json" })));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    Open(path) {
        this.nnetwork = neataptic.Network.fromJSON($.ajax({
            url: path,
            dataType: 'json',
            async: false,
            success: function (data) { }
        }).responseJSON);
    }
}

function SaveBest(filename) {
    if (best) {
        best.Save(filename);
    }
    else {
        alert("Najlepszy T-Rex jeszcze nie istnieje.");
    }
}

function NormalizeFitness() {
    let sum = 0;

    game.deadTrexes.forEach(tRex => {
        sum += tRex.fitness;
    });

    game.deadTrexes.forEach(tRex => {
        tRex.fitness /= sum;
    });
}

function SelectParent(tRexes) {
    let ret;
    let index = 0;
    let rnd = Math.random();

    while (rnd > 0) {
        rnd -= tRexes[index].fitness;
        index++;
    }

    return $.extend(true, ret, tRexes[--index]);
}

function Mutate(tRex) {
    let rnd = Math.random();

    if (rnd < AI_config.MUTATION_RATE) {
        tRex.brain.nnetwork.mutate(neataptic.methods.mutation.MOD_WEIGHT);
    }
}

function CrossOver(tRex) {
    let parentA = SelectParent(game.deadTrexes);
    let parentB = SelectParent(game.deadTrexes);

    tRex.brain.nnetwork = neataptic.Network.crossOver(parentA.brain.nnetwork, parentB.brain.nnetwork);
    Mutate(tRex);
}

function Breed(tRex) {
    CrossOver(tRex);
    Mutate(tRex);
}

function FindNBest(n) {
    let ret = [];
    let data = [];

    if (game.deadTrexes.length > 0) {
        for (let i = 0; i < game.deadTrexes.length; i++) {
            data.push(game.deadTrexes[i]);
        }

        data.sort(function (a, b) {
            return (a.fitness < b.fitness) ? -1 : (a.fitness > b.fitness) ? 1 : 0;
        });

        for (let i = data.length - n; i < data.length; i++) {
            ret.push(data[i]);
        }
    }

    return ret;
}

function CreateNewPopulation() {
    game.tRexes = [];
    let saved = [];

    if (AI_config.ELITISM && AI_config.ELITISM_SIZE < AI_config.POPULATION_SIZE) {
        saved = FindNBest(AI_config.ELITISM_SIZE);
        for (let i = 0; i < saved.length; i++) {
            game.tRexes.push(saved[i]);
        }
    }

    for (let i = 0; i < AI_config.POPULATION_SIZE - saved.length; i++) {
        let tRex = new Trex(game.canvas, game.spriteDef.TREX);
        tRex.brain = new Brain(AI_config.INPUTS, AI_config.HIDDEN_LAYERS, AI_config.OUTPUTS);
        game.tRexes.push(tRex);
    }

    NormalizeFitness();

    let max = -1;
    for (let i = 0; i < game.deadTrexes.length; i++) {
        if (game.deadTrexes[i].fitness > max) {
            max = game.deadTrexes[i].fitness;
            best = game.deadTrexes[i];
        }
    }
    console.log(best)
    best = FindNBest(1)[0];
    console.log(best)    

    for (let i = saved.length; i < AI_config.POPULATION_SIZE; i++) {
        Breed(game.tRexes[i]);
    }

    game.deadTrexes = [];
    generation++;
}