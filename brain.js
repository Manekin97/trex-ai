class Brain {
    constructor(inputsCount, hiddenLayersCount, outputsCount) {
        //tu trzeba stworzyć NN
        this.nnetwork = tf.sequential();

        this.nnetwork.add(tf.layers.dense({
            units: 1,
            inputShape: [1]
        }));

        for (let i = 0; i < hiddenLayersCount; i++) {
            this.nnetwork.add(tf.layers.dense({
                units: 1,
            }));
        }

        this.nnetwork.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }));

        this.nnetwork.compile({
            loss: 'meanSquaredError',
            optimizer: 'Adam'
        });
    }
}

// //define a container
// const model = tf.sequential();

// //add layer
// model.add(tf.layers.dense({
//     units: 1,   //  Positive integer, dimensionality of the output space.
//     inputShape: [1],  //  If specified, defines inputShape as [inputDim]. Optional
//     activation: 'softmax'   //  Activation function to use.
// }));

// //some parameteres
// model.compile({
//     loss: 'meanSquaredError',
//     optimizer: 'Adam'
// });

// // data
// const xs = tf.tensor2d([[1], [2], [3], [4], [5], [6], [7]], [7, 1]);
// const ys = tf.tensor2d([[1], [3], [5], [7], [9], [11], [13]], [7, 1]);

// // train
// model.fit(xs, ys, { epochs: 1000 });

// //predict
// const pred = model.predict(tf.tensor2d([[8]], [1, 1]));
// pred.print();