class Brain {
    constructor(inputsCount, hiddenLayersCount, outputsCount) {
        this.nnetwork = new neataptic.architect.Perceptron(7, 10, 2);
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
        $.getJSON(path).then(function (file) {
            this.nnetwork = neataptic.Network.fromJSON(file);
        });
    }
}