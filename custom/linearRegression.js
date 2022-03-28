var linearRegression = {};

linearRegression.enter = function(){
    $("#modelArea").html("")
    $("#graphArea1").html("")
    $("#graphArea2").html("")
    $("#predictArea").html("")
    
    //create checkbox for intercept and button to run
    var html = `
     
        <div class="form-group">
            <label>Use Intercept</label> </br>
            <input  type="checkbox" id="intercept" checked>
        </div>
        <button onclick="linearRegression.run()" class="btn btn-primary mt-3">Run</button>
    `
    openModal(html)
}

linearRegression.run = function(){
    closeModal()
    $("#modelArea").html("")
    $("#graphArea1").html("")
    $("#graphArea2").html("")
    $("#predictArea").html("")
    
    var variables = database.getUiVariables();
    linearRegression.variables = variables;

    var x = [];
    var y = [];
    for(var i = 0; i < database.data.length; i++){
        var row = database.data[i];
        var xRow = [];
        var yRow = [];
        for(var j = 0; j < variables.indVals.length; j++){
            xRow.push(row[variables.indVals[j]]);
        }
        yRow.push(row[variables.depVal]);

        x.push(xRow);
        y.push(yRow);
    }

    var intercept = $("#intercept").is(":checked");

    linearRegression.model = new ML.MultivariateLinearRegression(x, y, {intercept:intercept});
    linearRegression.display(xRow)
}

linearRegression.display = function(startValues){
    var variables = linearRegression.variables;
    var model = linearRegression.model;

    var html = `
    <h3>Linear Regression Output</h3>
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
    if(model.intercept){
        var index = variables.indVals.length;
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

    html += "<button onclick='linearRegression.download()' class='btn btn-success'>Download Model</button>"

    $("#modelArea").html(html)

    var html = `
        <h3>Predict With Model</h3>
        <div class="row">
    `
    for(var i=0;i<variables.indVals.length;i++){
        html += `
            <div class="col">
                <div class="form-group">
                    <label>${variables.indVals[i]}</label>
                    <input type="number" class="form-control" id="${i}-predictVal" value="${startValues[i]}">
                </div>
            </div>
        `;

        if(i > 0 && (i+1)%3 == 0 || i == variables.indVals.length-1){
            html += "</div>"//close row
        }
        if((i+1)%3 == 0 && i < variables.indVals.length-1 && i > 0){
            html += "<div class='row'>"//start new row
        }
    }



    html += `
        <button class="btn btn-primary" onclick="linearRegression.predict()">Predict</button>
        <div id="predictionOutputArea"></div>
    `

    $("#predictArea").html(html)

}

linearRegression.download = function(){
    var result = JSON.stringify({variables:linearRegression.variables,model:linearRegression.model,types:database.types,summaryStats:database.summaryStats})
    //download json file
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
    element.setAttribute('download', "model.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

linearRegression.predict = function(){
    var values = [];
    for(var i=0;i<linearRegression.variables.indVals.length;i++){
        values.push(parseFloat($("#"+i+"-predictVal").val()));
    }   
    var prediction = linearRegression.model.predict(values);
    console.log(prediction,values)
    $("#predictionOutputArea").html(prediction[0].toFixed(2));
}