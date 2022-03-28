var extraStats = {};
extraStats.StudT = function(t,n) {
    var PiD2 = Math.PI / 2;
    t=Math.abs(t); var w=t/Math.sqrt(n); var th=Math.atan(w)
    if(n==1) { return 1-th/PiD2 }
    var sth=Math.sin(th); var cth=Math.cos(th)
    if((n%2)==1){
        return 1-(th+sth*cth*extraStats.StatCom(cth*cth,2,n-3,-1))/PiD2 
    }
    else{
        return 1-sth*extraStats.StatCom(cth*cth,1,n-3,-1) 
    }
}

extraStats.StatCom = function(q,i,j,b) {
    var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2 }
    return z
}

extraStats.stdev = function(values,mean){

  
        var sqrError = 0;
    
        for (var i = 0; i < values.length; i++) {
          var x = values[i] - mean;
          sqrError += x * x;
        }
    
        
        return sqrError / (values.length);
        
    
}
        
extraStats.rSquared = function(data,model){
    var mean = 0;
    for(var y of data.y){
        mean += parseFloat(y);
    }
    mean = mean / data.y.length
    var denominator = 0;
    for(var y of data.y){
        var squaredError = Math.pow(parseFloat(y)-mean,2)
        denominator += squaredError;
    }
    var numerator = 0;
    for(var i=0;i<data.x.length;i++){
        var xData = data.x[i];
        var yData = data.y[i];
        
        var predictY = parseFloat(model.predict(xData));
        squaredError = Math.pow(parseFloat(predictY)-yData,2)
        numerator += squaredError
    }
    return 1 - numerator/denominator
}

extraStats.formatDataArrayOfObjects = function(data,xProps,yProps){
    var formattedData = {x:[],y:[]};
    for(var i=0;i<data.length;i++){
        formattedData.x.push(new Array);
        for(var ii=0;ii<xProps.length;ii++){
            var prop = xProps[ii];
            formattedData.x[i].push(data[i][prop]);
        }
        
        formattedData.y.push(new Array);
        for(var ii=0;ii<yProps.length;ii++){
            formattedData.y[i].push(data[i][yProps[ii]]);
        }
    }
    return formattedData
}