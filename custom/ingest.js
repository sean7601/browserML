var ingest = {};



ingest.csv = function(id){
    var config = {complete: ingest.store,header:true,dynamicTyping:true};
	var file = document.getElementById(id).files[0];
    Papa.parse(file, config)

}

ingest.store = function(results){
    database.data = results.data;
    database.headers = results.meta.fields;
    database.types = ingest.getDataTypes(database.data,database.headers);
    database.summaryStats = ingest.getSummaryStats(database.data,database.types);
    console.log(database)

    database.drawSummary();

}

ingest.getSummaryStats = function(data,types){
    //numbers get min/max
    //strings get first/last

    var summaryStats = {};
    for(var type in types){
        if(types[type].type == "number"){
            var stats = {};
            stats.min = Math.min.apply(Math,data.map(function(o){return o[type]}));
            stats.max = Math.max.apply(Math,data.map(function(o){return o[type]}));
            summaryStats[type] = stats;
        }
        else if(types[type].type == "string"){
            var stats = {};
            stats.first = data[0][type];
            stats.last = data[data.length-1][type];
            summaryStats[type] = stats;
        }
        else{
            summaryStats[type] = null;
        }
    }

    return summaryStats;
}

ingest.getDataTypes = function(data,headers){
    //date, string, number, boolean
    var types = {};
    for(var i = 0; i < headers.length; i++){
        var type = ingest.getType(data,headers[i]);
        types[headers[i]] = type;
    }

    return types
}

ingest.getType = function(data,header){
    var types = {string: 0, number: 0, boolean: 0, date: 0, missing: 0, type:null};
    for(var i = 0; i < data.length; i++){
        if(data[i][header] == null){
            types.missing += 1;
        }
        else if(typeof data[i][header] == "number"){
            types.number += 1;
        }
        else if(typeof data[i][header] == "boolean"){
            types.boolean += 1;
        }
        else if(typeof data[i][header] == "string"){
            if(!isNaN(parseFloat(data[i][header].replaceAll(",","")))){
                data[i][header] = parseFloat(data[i][header].replaceAll(",",""));
                types.number += 1;
            }
            else if(!isNaN(Date.parse(data[i][header]))){
                data[i][header] = new Date(data[i][header]).getTime();
                types.date += 1;
            }
            else{
                types.string += 1;
            }
        }
    }

    for(var type in types){
        if(type == "missing"){
            continue;
        }
        if(types[type] > 0){
            if(types.type == null || types[type] == type){
                types.type = type;
            }
            else{
                types.type = "mixed";
            }
        }
    }

    return types;
}

function displayHTMLTable(results){
    console.log(results)
}