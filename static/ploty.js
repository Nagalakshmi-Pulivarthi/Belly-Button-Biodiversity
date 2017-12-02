 
function PopulateNames(){
    url="/names";
    Plotly.d3.json(url, function(error, response)
     {
         console.log("PopulateNames:Got Response")
        var select = document.getElementById('selDataset')
        for(var i=0;i<response.length;i++)
        {
        var option = document.createElement('option');
        option.value = response[i];
        option.text=response[i];
        select.appendChild(option)
        }
        Initialize();
    });
    console.log("PopulateNames:End")
}
PopulateNames();

function Initialize()
{
    document.getElementById("selDataset").selectedIndex = 0;
    optionChanged(document.getElementById("selDataset").value);
}

function optionChanged(dropdown_value)
{
    DrawCharts(dropdown_value);
    DisplayMetadata(dropdown_value);
}

function DisplayMetadata(dropdown_value)
{
    var metadataUrl = "/metadata/"+dropdown_value;
            Plotly.d3.json(metadataUrl,function(error2,response2){
                     //   console.log(response2);
               var metadataSpanEle = document.getElementById("metadataSpan");
               metadataSpanEle.innerHTML = "AGE: "+ response2.AGE;
               metadataSpanEle.innerHTML += "</br>BBTYPE: "+ response2.BBTYPE;
               metadataSpanEle.innerHTML += "<br/>ETHNICITY: "+ response2.ETHNICITY;
               metadataSpanEle.innerHTML += "<br/>GENDER: "+ response2.GENDER;
               metadataSpanEle.innerHTML += "<br/>LOCATION: "+ response2.LOCATION;
               metadataSpanEle.innerHTML += "<br/>SAMPLEID: "+ response2.SAMPLEID;
            });
}
function DrawCharts(dropdown_value)
{
    var sample_url="/samples/"+dropdown_value;
    var otu_id_array = new Array();
    var sample_value_array = new Array();
    Plotly.d3.json(sample_url, function(error, response){  
        for(var i=0;i<response.length;i++)
        {
            //console.log(response[0]["otu_id"]);
            otu_id_array=response[0]["otu_id"]
            sample_value_array=response[0]["sample_values"]
        }
        var  otu_disc_url="/otu";
        Plotly.d3.json(otu_disc_url,function(error1,response1){
            //console.log(response1);
            var otu_data=response1;
            var hovertext_array = new Array();
            for(var i=0;i<otu_id_array.length;i++)
                hovertext_array[i]=otu_data[otu_id_array[i]-1];

            DrawPieChart(sample_value_array,otu_id_array,hovertext_array);
            DrawBubbleChart(sample_value_array,otu_id_array,hovertext_array)
        }); 
    }); 
}
function DrawPieChart(sample_value_array,otu_id_array,hovertext_array)
{
    var sample_value_array = sample_value_array.slice(0,9);
    var otu_id_array = otu_id_array.slice(0,9);
    var hovertext_array = hovertext_array.slice(0,9);

    var pie_divElement = document.getElementById("pie_div");
    if (pie_divElement.innerHTML == "") {
        var data = [{
            values: sample_value_array,
            labels: otu_id_array,
            hovertext: hovertext_array,
            type: "pie"
        }];
        var layout = {
            widht: 500,
            height: 500,
            title:"Pie-chart"
        };
        Plotly.newPlot(pie_divElement, data, layout);
    }
    else {
        Plotly.restyle(pie_divElement, "values", [sample_value_array]);
        Plotly.restyle(pie_divElement, "labels", [otu_id_array]);
        Plotly.restyle(pie_divElement, "hovertext", [hovertext_array]);
    }
}
function DrawBubbleChart(sample_value_array,otu_id_array,hovertext_array)
{
    var bubble_divElement = document.getElementById("bubble_div");
    if (bubble_divElement.innerHTML == "") {

        var colors =['rgb(93, 164, 214)','rgb(255, 144, 14)', 'rgb(44, 160, 101)', 'rgb(255, 65, 54)']
        var sampleColors =[];
        for (var index = 0; index < otu_id_array.length; index++) {
            sampleColors[index] = otu_id_array[index]/255;
        }
        var data = [{
            y: sample_value_array,
            x: otu_id_array,
            text: hovertext_array,
            type:'scatter',
            mode: 'markers',
            marker: {
                color: sampleColors,
                opacity: .8,// [1, 0.8, 0.6, 0.4],
                size:sample_value_array// [40, 60, 80, 100]
            },
            
        }];
        var layout = {
            title: 'Bubble Chart',
            hovermode:'closest',
            showlegend: false,
            height: 600,
            width: 1200,
            xaxis:{showline :false,title:"Otu_Id"},
            yaxis:{showline :false,title:"Sample_values"}
        };
        Plotly.newPlot(bubble_divElement, data, layout);
    }
    else {
        Plotly.restyle(bubble_divElement, "y", [sample_value_array]);
        Plotly.restyle(bubble_divElement, "x", [otu_id_array]);
        Plotly.restyle(bubble_divElement, "hovertext", [hovertext_array]);

        Plotly.restyle(bubble_divElement, "marker.size", [sample_value_array]);
        Plotly.restyle(bubble_divElement, "marker.color", [otu_id_array]);
    }
}

