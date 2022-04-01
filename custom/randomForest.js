var randomForest = {};

randomForest.enter = function(){
    $("#modelArea").html("")
    $("#graphArea1").html("")
    $("#graphArea2").html("")
    $("#predictArea").html("")
    
    /*
    const options = {
  maxFeatures: 2,
  replacement: false,
  nEstimators: 200
};
*/
    //create checkbox for intercept and button to run
    var html = `
     
        <div class="form-group">
            <label>Replacement</label> </br>
            <input  type="checkbox" id="replacement" checked>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label>Max Features</label> </br>
                    <input  type="number" id="maxFeatures" value=5>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label>Number of Estimators</label> </br>
                    <input  type="number" id="nEstimators" value=25>
                </div>
            </div>
        </div>
        <button onclick="randomForest.run()" class="btn btn-primary mt-3">Run</button>
    `
    openModal(html)
}

randomForest.run = function(){
    var options = {
        maxFeatures: parseInt($("#maxFeatures").val()),
        replacement: $("#replacement").is(":checked"),
        nEstimators: Math.min(12,parseInt($("#nEstimators").val()))
    }
    closeModal()
    $("#modelArea").html("")
    $("#graphArea1").html("")
    $("#graphArea2").html("")
    $("#predictArea").html("")
    

    //get data
    var db = database.getInputOutputObjectDatabase(true)
    randomForest.variables = db.variables
    variables = db.variables
    var data = db.data;
    var xRow = db.lastRow.input

    var x = [];
    var y = [];
    for(var i = 0; i < data.length; i++){
        var xRow = [];
        for(var ii=0;ii<data[i].input.length;ii++){
            xRow.push(data[i].input[ii])
        }
        x.push(xRow)
        y.push(data[i].output)
    }

    var intercept = $("#intercept").is(":checked");

    console.log(x,y)
    randomForest.model = new ML.RandomForestRegression(options);
    randomForest.model.train(x, y)
    console.log(randomForest.model.predict(xRow))
    //randomForest.display(xRow)
}

randomForest.display = function(startValues){
    var variables = randomForest.variables;
    var model = randomForest.model;

    var html = `
    <h3>Random Forest Output</h3>
        <div>
            R2: ${model.rSquared.toFixed(2)}</br>
            StdErr: ${model.stdError.toFixed(2)}</br>
        </div>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Variable</th>
                    <th>Coefficient</th>
                    <th>Standard Error</th>
                    <th>t-statistic</th>
                    <th>p-value</th>
                </tr>
            </thead>
            <tbody>
    `;
    for(var i=0;i<variables.indVals.length;i++){
        html += `
            <tr>
                <td>${variables.indVals[i]}</td>
                <td>${model.weights[i][0].toFixed(2)}</td>
                <td>${model.stdErrors[i].toFixed(2)}</td>
                <td>${model.tStats[i].toFixed(2)}</td>
                <td>${model.pValues[i].toFixed(2)}</td>
            </tr>
        `;
    } 
    var index = variables.indVals.length-1;
    for(var i=0;i<variables.catIndVals.length;i++){
        var uniques = database.summaryStats[variables.catIndVals[i]].uniques
        for(var ii=0;ii<uniques.length-1;ii++){
            index++
            html += `
                <tr>
                    <td>${uniques[ii]}</td>
                    <td>${model.weights[index][0].toFixed(2)}</td>
                    <td>${model.stdErrors[index].toFixed(2)}</td>
                    <td>${model.tStats[index].toFixed(2)}</td>
                    <td>${model.pValues[index].toFixed(2)}</td>
                </tr>
            `;
        }
    }
    if(model.intercept){
        index++;
        html += `
            <tr>
                <td>Intercept</td>
                <td>${model.weights[index][0].toFixed(2)}</td>
                <td>${model.stdErrors[index].toFixed(2)}</td>
                <td>${model.tStats[index].toFixed(2)}</td>
                <td>${model.pValues[index].toFixed(2)}</td>
            </tr>
        `;
    }

    html += "<button onclick='randomForest.download()' class='btn btn-success'>Download Model</button>"

    $("#modelArea").html(html)

    console.log(variables,startValues)
    html = database.drawPredictUI(variables,startValues)

    html += `
        <button class="btn btn-primary" onclick="randomForest.predict()">Predict</button>
        <div id="predictionOutputArea"></div>
    `

    $("#predictArea").html(html)

}

randomForest.download = function(){
    var result = JSON.stringify({variables:randomForest.variables,model:randomForest.model,types:database.types,summaryStats:database.summaryStats})
    //download json file
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
    element.setAttribute('download', "model.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

randomForest.predict = function(){
    var values = database.getValuesFromPredictUI(randomForest.variables,false,true)
    console.log(values)
    var prediction = randomForest.model.predict(values);
    console.log(prediction,values)
    $("#predictionOutputArea").html(prediction[0].toFixed(2));
}