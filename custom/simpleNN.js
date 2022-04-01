var simpleNN = {};

simpleNN.enter = function(){
  /*
  activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
    binaryThresh: 0.5,
  inputSize: 20,
  inputRange: 20,
  hiddenLayers: [20, 20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  */
    var html = `
        <h3>Simple Neural Network</h3>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Binary Threshold</label>
                    <input class="form-control" id="binaryThresh" value=.5 type=number></input>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Activation</label>
                    <select class="form-control" id="activation">
                        <option value="relu">ReLU</option>
                        <option value="leaky-relu">Leaky ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="tanh">Tanh</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Hidden Layers</label>
                    <input class="form-control" id="hiddenLayers" value="3" type=text></input>
                    <small>ex. 3,9,3</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Iterations</label>
                    <input class="form-control" id="iterations" value=1000 type=number></input>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Learning Rate</label>
                    <input class="form-control" id="learningRate" value=.01 type=number></input>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Decay Rate</label>
                    <input class="form-control" id="decayRate" value=.999 type=number></input>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Training Set Size (%)</label>
                    <input class="form-control" id="trainingSetSize" value=90 type=number></input>
                </div>
            </div>
        </div>

        <button class="btn btn-primary mt-3 mb-3" onclick="simpleNN.run()">Train</button>
        
    `
    
    openModal(html)
}

simpleNN.getConfig = function(){
    var config = {
        activation: $("#activation").val(),
        binaryThresh: parseFloat($("#binaryThresh").val()),
        hiddenLayers: $("#hiddenLayers").val().split(",").map(function(x){return parseInt(x)}),
        learningRate: parseFloat($("#learningRate").val()),
        decayRate: parseFloat($("#decayRate").val()),
        iterations: parseInt($("#iterations").val())
    }

    return config;
}

simpleNN.run = function(){
    //interact with UI
    var config = simpleNN.getConfig();
    $("#modelArea").html("")
    $("#graphArea1").html("")
    $("#graphArea2").html("")
    $("#predictArea").html("")

    //get data
    var db = database.getInputOutputObjectDatabase(false,true)
    simpleNN.variables = db.variables
    var data = db.data;
    var maxVals = db.maxVals;
    var maxDep = db.maxDep;
    var xRow = db.lastRow.input

    // split into training and testing datasets
    var shuffled = data.sort(() => 0.5 - Math.random());
    var training_set_size = parseFloat($("#trainingSetSize").val()) / 100;
    var training_data = shuffled.slice(0, Math.floor(shuffled.length * training_set_size));
    var test_data = shuffled.slice(Math.floor(shuffled.length * training_set_size));
    console.log(test_data)

    // create a simple feed forward neural network with backpropagation
    simpleNN.model = new brain.NeuralNetwork(config);
  
    // train the neural network
    simpleNN.model.train(training_data);

    // test the neural network
    var avgError = 0;
    var maxError = 0;
    var errors = [];
    var scatterData = [];
    for(var i = 0; i < test_data.length; i++){
        var output = simpleNN.model.run(test_data[i].input)[0];
        var error = Math.abs(output - test_data[i].output);
        errors.push(error*maxDep);
        scatterData.push([output*maxDep,test_data[i].output*maxDep]);
        avgError += error;
        maxError = Math.max(maxError,error);
    }
    avgError /= test_data.length;
    simpleNN.avgError = avgError * maxDep;
    simpleNN.maxError = maxError * maxDep;

    // display the results
    console.log("Average Error: " + avgError * maxDep);
    console.log("Max Error: " + maxError * maxDep);
    console.log(xRow)
    simpleNN.display(xRow)
    console.log(errors,scatterData)
    graphs.drawHistogram(errors,"Prediction Errors","Error","Prevalence",'graphArea1')
    graphs.drawScatterplot(scatterData,"Predictions","Prediction","Actual",'graphArea2')

    closeModal();
}


simpleNN.display = function(startValues){
    var variables = simpleNN.variables;

    var maxVals = [];
    for(var i = 0; i < variables.indVals.length; i++){
        var max = Math.abs(database.summaryStats[variables.indVals[i]].max)
        var min = Math.abs(database.summaryStats[variables.indVals[i]].min)
        maxVals.push(Math.max(max,min));
    }


    var html = ``

    html += "<button onclick='simpleNN.download()' class='btn btn-success mt-3'>Download Model</button>"

    html += `
    <div>
        Average Error: ${simpleNN.avgError.toFixed(3)}</br>
        Max Error: ${simpleNN.maxError.toFixed(3)}
    </div>`
    $("#modelArea").html(html)

    html = database.drawPredictUI(variables,startValues,maxVals)

    html += `
        <button class="btn btn-primary mt-3 mb-3" onclick="simpleNN.predict()">Predict</button>
        <div id="predictionOutputArea"></div>
    `

    $("#predictArea").html(html)

    
}


simpleNN.predict = function(){
    var variables = simpleNN.variables;
    var maxVals = [];
    for(var i = 0; i < variables.indVals.length; i++){
        var max = Math.abs(database.summaryStats[variables.indVals[i]].max)
        var min = Math.abs(database.summaryStats[variables.indVals[i]].min)
        maxVals.push(Math.max(max,min));
    }

    //max depval
    var maxDep = Math.abs(database.summaryStats[variables.depVal].max);
    var minDep = Math.abs(database.summaryStats[variables.depVal].min);
    maxDep = Math.max(maxDep,minDep);

    var values = database.getValuesFromPredictUI(simpleNN.variables,maxVals)
    var prediction = simpleNN.model.run(values);
    console.log(values,maxVals,prediction,maxDep)
    prediction = prediction[0] * maxDep;
    $("#predictionOutputArea").html(prediction.toFixed(2));
}