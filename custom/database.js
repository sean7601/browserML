var database = {};


database.drawSummary = function(){
    var html = `
        <table class="table table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>Dependent Variable</th>
                    <th>Independent Variable <button class='btn btn-small btn-primary' onclick="database.selectAllInd()">All</button></th>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Missing Rows</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
    `;
    for(var i = 0; i < database.headers.length; i++){
        var field = database.headers[i];
        var type = database.types[field].type;
        var missing = database.types[field].missing;
        
        var description = ""
        if(type == "mixed"){
            for(var type in database.types[field].types){
                if(type == "type" || type == "missing"){
                    continue;
                }
                if(database.types[field].types[type] > 0){
                    description += type + ", "
                }
            }
        }
        else if(type == "number"){
            description = "Min: " + database.summaryStats[field].min.toFixed(3) + " - Max: " + database.summaryStats[field].max.toFixed(3);
        }
        else if(type == "string"){
            

            description = "First: " + database.summaryStats[field].first + ", Last: " + database.summaryStats[field].last + ", Uniques: " + database.summaryStats[field].numUniques;
        }
        else{
            description = "";
        }
        html += `
            <tr>
                <td><input onclick="database.setDep()" id="${i}-depVal" type="radio" name='depVal'></input></td>
                <td><input id="${i}-indVal" type="checkbox"></input></td>
                <td>${field}</td>
                <td>${type}</td>
                <td>${missing}</td>
                <td>${description}</td>
            </tr>
        `;
    }
    html += `
            </tbody>
        </table>
    `

    html += `

        <button class="btn btn-primary" onclick="linearRegression.enter()">Linear Regression</button>
        <button class="btn btn-primary" onclick="simpleNN.enter()">Neural Network</button> 

    `

    $("#dataArea").html(html);

}

database.setDep = function(){
    for(var i=0;i<database.headers.length;i++){
        if($("#" + i + "-depVal").is(":checked")){
            $('#' + i + "-indVal").prop('checked', false);
        }
    }
}

database.selectAllInd = function(){
    for(var i=0;i<database.headers.length;i++){
        if(!$("#" + i + "-depVal").is(":checked")){
            $('#' + i + "-indVal").prop('checked', true);
        }
        else{
            $('#' + i + "-indVal").prop('checked', false);
        }   
    }
}

database.getUiVariables = function(){
    var depVal = null;
    var indVals = [];
    var catIndVals = [];
    for(var i = 0; i < database.headers.length; i++){
        var field = database.headers[i];
        var type = database.types[field].type;
        if($("#" + i + "-depVal").is(":checked")){
            if(type == "number"){
                depVal = field;
            }
        }
        if($("#" + i + "-indVal").is(":checked")){
            if(type == "number"){
                indVals.push(field);
            }
            else if(type == "string"){
                catIndVals.push(field);
            }
        }
    }

    //check if depVal is also an indVal
    if(indVals.indexOf(depVal) != -1 || catIndVals.indexOf(depVal) != -1){
        alert("Dependent variable cannot be an independent variable");
    }
    if(depVal == null){
        alert("Must select a numerical dependent variable");
    }
    
    return {depVal: depVal, indVals: indVals, catIndVals: catIndVals};
}


database.getInputOutputObjectDatabase = function(omitLastCategory, normalizeZeroOne){
    var variables = database.getUiVariables();
    if(normalizeZeroOne){
        var maxVals = [];
        for(var i = 0; i < variables.indVals.length; i++){
            var max = Math.abs(database.summaryStats[variables.indVals[i]].max)
            var min = Math.abs(database.summaryStats[variables.indVals[i]].min)
            maxVals.push(Math.max(max,min));
        }

        var maxDep = Math.abs(database.summaryStats[variables.depVal].max);
        var minDep = Math.abs(database.summaryStats[variables.depVal].min);
        maxDep = Math.max(maxDep,minDep);
    }

    var data = [];
    for(var i = 0; i < database.data.length; i++){
        var row = database.data[i];
        var xRow = [];
        var yRow = [];
        for(var j = 0; j < variables.indVals.length; j++){
            if(normalizeZeroOne){
                xRow.push(row[variables.indVals[j]] / maxVals[j]);
            }
            else{
                xRow.push(row[variables.indVals[j]]);
            }
        }
        for(var j = 0; j < variables.catIndVals.length; j++){
            var uniques = database.summaryStats[variables.catIndVals[j]].uniques;
            var val = row[variables.catIndVals[j]];
            var numCats = uniques.length;
            if(omitLastCategory){
                numCats -= 1;
            }
            for(var k = 0; k < numCats; k++){
                if(val == uniques[k]){
                    xRow.push(1);
                }
                else{
                    xRow.push(0);
                }
            }
        }

        if(normalizeZeroOne){
            yRow.push(row[variables.depVal] / maxDep);
        }
        else{
            yRow.push(row[variables.depVal]);
        }

        var completeRow = {input:xRow,output:yRow};
        data.push(completeRow);
    }

    //remove rows with nulls
    var cleanData = [];
    for(var i = 0; i < data.length; i++){
        if(data[i].input.indexOf(null) == -1 && data[i].output.indexOf(null) == -1){
            cleanData.push(data[i]);
        }
    }


    if(normalizeZeroOne){
        return {data:cleanData, variables: variables, maxVals: maxVals, maxDep: maxDep, lastRow: {input: xRow, output: yRow}};    
    }
    else{
        return {data:cleanData, variables: variables, lastRow: {input: xRow, output: yRow}};
    }

}


database.drawPredictUI = function(variables,startValues,maxVals){
    console.log(maxVals)
    console.log(maxVals == true)
    var html = `
        <h3>Predict With Model</h3>
        <div class="row">
    `
    for(var i=0;i<variables.indVals.length;i++){
        html += `
            <div class="col">
                <div class="form-group">
                    <label>${variables.indVals[i]}</label>`
                    if(maxVals != null){
                        html += `<input type="number" class="form-control" id="${i}-predictVal" value="${startValues[i] * maxVals[i]}">`
                    }
                    else{
                        html += `<input type="number" class="form-control" id="${i}-predictVal" value="${startValues[i]}">`
                    }
                    
                html += `</div>
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
        <div class="row">
    `

    for(var i=0;i<variables.catIndVals.length;i++){
        var uniques = database.summaryStats[variables.catIndVals[i]].uniques;
        html += `
            <div class="col">
                <div class="form-group">
                    <label>${variables.catIndVals[i]}</label>
                    <select class="form-control" id="${i}-catPredictVal" value="${startValues[i]}">`
                    for(var j=0;j<uniques.length;j++){
                        html += `<option value="${uniques[j]}">${uniques[j]}</option>`
                    }
                    html += `</select>
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

    return html
}

database.getValuesFromPredictUI = function(variables,maxVals,omitLastCategory){
    var values = [];
    console.log(variables)
    for(var i=0;i<variables.indVals.length;i++){
        if(maxVals != null){
            values.push(parseFloat($("#"+i+"-predictVal").val()) / maxVals[i]);
        }
        else{
            values.push(parseFloat($("#"+i+"-predictVal").val()));
        }
    }   
    for(var i=0;i<variables.catIndVals.length;i++){
        var val = $("#"+i+"-catPredictVal").val();
        var uniques = database.summaryStats[variables.catIndVals[i]].uniques;
        var catCount = uniques.length;
        if(omitLastCategory){
            catCount--
        }
        console.log(catCount)
        for(var j=0;j<catCount;j++){
            if(val == uniques[j]){
                values.push(1);
            }
            else{
                values.push(0);
            }
        }
    }

    return values
}