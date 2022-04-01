var graphs = {};


graphs.drawHistogram = function(data,title,xAxisTitle,yAxisTitle,container){
    Highcharts.chart(container, {
        title: {
            text: title
        },
    
        xAxis: [{
            title: { text: xAxisTitle },
            alignTicks: false
        }],
    
        yAxis: [{
            title: { text: yAxisTitle },
        }],

        legend: {
            enabled: false
        },

        series: [{
            name: 'Histogram',
            type: 'histogram',
            xAxis: 0,
            yAxis: 0,
            baseSeries: 's1',
            zIndex: -1,
        }, {
            name: 'Data',
            type: 'scatter',
            data: data,
            id: 's1',
            marker: {
                radius: 0
            },
            visible:false,
            
        }]
    });
}

graphs.drawScatterplot = function(data,title,xAxisTitle,yAxisTitle,container){
    var maxX = -9e30;
    for(var i=0;i<data.length;i++){
        maxX = Math.max(maxX,data[i][0],data[i][1]);
    }
    Highcharts.chart(container, {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                enabled: true,
                text: xAxisTitle
            },
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: yAxisTitle
            }
        },
        series: [{
            data: data,
            marker: {
                radius: 1
            },
            name: "Predictions"
        },
        {
            data: [[0,0],[maxX,maxX]],
            marker: {
                radius: 1
            },
            color:"black",
            lineWidth:1,
            name: "Zero Error Line"
        }
    ]
    });
    
}