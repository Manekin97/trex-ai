class Brain {
    constructor(inputs, hiddenLayers, outputs) {
        this.nnetwork = new neataptic.architect.Perceptron(inputs, ...hiddenLayers, outputs);
    }

    Save(filename) {
        console.log(best);
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

function MakeADecision(tRex) {
    let input = [];
    let output = [];

    let closestObstacle = tRex.getClosestObstacle();

    if (AI_config.NORMALIZE_DATA) {
        input = [
            closestObstacle.dist / game.dimensions.WIDTH,   //  Dystans do najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" ? closestObstacle.obstacle.typeConfig.height / 200 : 0,    //  Wysokość najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" ? (closestObstacle.obstacle.typeConfig.width * closestObstacle.obstacle.size) / 200 : 0, //  Szerokość najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" && closestObstacle.obstacle.typeConfig.type == 'PTERODACTYL' ? closestObstacle.obstacle.typeConfig.yPos / 100 : 0,   //  Pozycja Y Pterodaktyla
            game.currentSpeed / game.config.MAX_SPEED,  //  Prędkość T-rexa
            tRex.yPos / game.dimensions.HEIGHT,   //  Pozycja Y T-rexa
            tRex.getDistanceBetweenObstacles(closestObstacle.obstacle) / game.dimensions.WIDTH    //  Odległość między przeszkodami
        ];
    }
    else {
        input = [
            closestObstacle.dist,   //  Dystans do najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" ? closestObstacle.obstacle.typeConfig.height : 0,    //  Wysokość najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" ? (closestObstacle.obstacle.typeConfig.width * closestObstacle.obstacle.size) : 0,   //  Szerokość najbliższej przeszkody
            typeof closestObstacle.obstacle.typeConfig !== "undefined" && closestObstacle.obstacle.typeConfig.type == 'PTERODACTYL' ? closestObstacle.obstacle.typeConfig.yPos : 0,   //  Pozycja Y Pterodaktyla
            game.currentSpeed,  //  Prędkość T-rexa
            tRex.yPos,    //  Pozycja Y T-rexa
            tRex.getDistanceBetweenObstacles(closestObstacle.obstacle)    //  Odległość między przeszkodami
        ];
    }

    output = tRex.brain.nnetwork.noTraceActivate(input);

    //skok
    if (output[0] < 0.5) {
        if (!tRex.jumping && !tRex.ducking) {
            tRex.startJump(game.currentSpeed);
        }
    }
    // duck
    else if (output[1] < 0.5) {
        if (tRex.jumping) {
            tRex.setSpeedDrop();
        } else if (!tRex.jumping && !tRex.ducking) {
            tRex.setDuck(true);
        }
    }
}

function GetConnectionsAvg(connections) {
    let sum = 0;

    connections.forEach(connection => {
        sum += Math.abs(connection.weight);
    });

    return sum / connections.length;
}

function DrawChart(tRex) {
    let chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        title: {
            text: "Znaczenie inputów"
        },
        axisY: {
            title: "Waga"
        },
        data: [{
            type: "pie",
            labelFontSize: 10,
            showInLegend: false,
            dataPoints: [
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[0].connections.out), label: "Dystans do przeszkody" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[1].connections.out), label: "Wysokość przeszkody" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[2].connections.out), label: "Szerokość przeszkody" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[3].connections.out), label: "Pozycja Y T-Rexa Pterodaktyla" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[4].connections.out), label: "Prędkość T-Rexa" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[5].connections.out), label: "Pozycja Y T-Rexa" },
                { y: GetConnectionsAvg(tRex.brain.nnetwork.nodes[6].connections.out), label: "Odległośc między przeszkodami" },
            ]
        }
        ]
    });

    chart.render();
}