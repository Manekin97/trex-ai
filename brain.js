class Brain {
    constructor(inputs, hiddenLayers, outputs) {
        // this.nnetwork = new neataptic.architect.Perceptron(inputs, 10, outputs);
        hiddenLayers.unshift(inputs);
        hiddenLayers.push(outputs);

        function construct(constructor, args) {
            function Foo() {
                return constructor.apply(this, args);
            }
            Foo.prototype = constructor.prototype;
            return new Foo();
        }

        this.nnetwork = construct(neataptic.architect.Perceptron, hiddenLayers);
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

function NormalizeFitness(tRexes) {
    let sum = 0;

    tRexes.forEach(tRex => {
        sum += tRex.fitness;
    });

    tRexes.forEach(tRex => {
        tRex.fitness /= sum;
    });
}