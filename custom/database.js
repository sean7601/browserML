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
            //get the number of unique values
            var uniqueValues = database.data.map(function(o){return o[field]}).filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
            });

            description = "First: " + database.summaryStats[field].first + ", Last: " + database.summaryStats[field].last + ", Uniques: " + uniqueValues.length;
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
    for(var i = 0; i < database.headers.length; i++){
        var field = database.headers[i];
        if($("#" + i + "-depVal").is(":checked")){
            depVal = field;
        }
        if($("#" + i + "-indVal").is(":checked")){
            indVals.push(field);
        }
    }

    //check if depVal is also an indVal
    if(indVals.indexOf(depVal) != -1){
        alert("Dependent variable cannot be an independent variable");
    }
    
    return {depVal: depVal, indVals: indVals};
}