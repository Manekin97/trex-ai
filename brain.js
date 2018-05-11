class Brain {
    constructor(inputsCount, hiddenLayersCount, outputsCount) {
        this.nnetwork = tf.sequential();

        const hiddenLayer = tf.layers.dense({
            units: hiddenLayersCount,
            inputShape: [inputsCount],
            activation: 'sigmoid'
        });

        const outputLayer = tf.layers.dense({
            units: outputsCount,
            activation: 'sigmoid'
        });

        this.nnetwork.add(hiddenLayer);
        this.nnetwork.add(outputLayer);

        this.nnetwork.compile({
            loss: 'meanSquaredError',
            optimizer: 'Adam'
        });

        // this.nnetwork.add(tf.layers.dense({
        //     units: hiddenLayersCount,
        //     inputShape: [inputsCount],
        //     activation: 'sigmoid'
        // }));

        // for (let i = 0; i < hiddenLayersCount; i++) {
        //     this.nnetwork.add(tf.layers.dense({
        //         units: inputsCount
        //     }));
        // }
        // onst LEARNING_RATE = lr || 0.5;
        // const optimizer = tf.train.sgd(LEARNING_RATE);

        // this.nnetwork.add(tf.layers.dense({
        //     units: outputsCount,
        //     activation: 'sigmoid'
        // }));

        // this.nnetwork.compile({
        //     loss: 'meanSquaredError',
        //     optimizer: 'Adam'
        // });
    }
}