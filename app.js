function final(){
    var filePath="nobel_prize_data.json";
    part0(filePath);
    part1(filePath);
    part2(filePath);
    part3(filePath);
    part4(filePath);
    part5(filePath);
    part6(filePath);
}



var part0=function(filePath){
    d3.json(filePath).then(function(data){
        nobel_prize_data = data['data']
        //console.log(nobel_prize_data)
    });
}

var part1=function(filePath){
    d3.json(filePath).then(function(data){
        //number of male winners each year compared to the number of female winners each year
        //columns: Year, laureate gender
        //type of graph: Scatterplot (male winners on one axis and female winners on another)
        //interactivity: hover on a point to see which year that data is from
        
        nobel_prize_data = data['data']
        //console.log(nobel_prize_data)
        winners_by_year = d3.rollup(nobel_prize_data, v => v.length, d => d.year, d=>d.gender)
            
            var width = 500;
            var height = 500;
            //keep height and width the same so that x and y dimensions remain equal
            var margin = {top: 50, bottom: 15, left: 25, right: 100}
            padding = 50

            svg = d3.select("#p1_plot").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")

            //use the same scale for x axis and y axis so that trends and comparison are clear!
            xScale = d3.scaleLinear().domain([0, d3.max(winners_by_year, function(d){ return d[1].get("male")})])
            .range([padding, width-padding]);

            yScale = d3.scaleLinear().domain([0, d3.max(winners_by_year, function(d){ return d[1].get("male")})])
            .range([height-padding, padding])

            var Tooltip = d3.select("#p1_plot")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("position", "absolute")

            svg.selectAll('circle') 
                .data(winners_by_year)
                .enter()
                .append('circle')
                .attr('fill', 'purple')
                .attr("r", 5)
                .attr('cx', function(d) {return xScale(d[1].get("male"))}) //x=male
                .attr('cy', function(d) {//y=female
                    num_fem = d[1].get("female")
                    if (num_fem == undefined) {num_fem = 0}
                    return yScale(num_fem)
                }) 
                .on("mouseover", function (e, d) {
                    Tooltip.transition().duration(0).style("opacity", 0.9)})
                .on("mousemove", function (e, d) { 
                    year = d[0].toString()
                    num_male = d[1].get("male")
                    num_fem = d[1].get("female")
                    if (num_fem == undefined) {num_fem = 0}
                   return Tooltip.text(year + ": \n" + num_male + " male, " + num_fem.toString() + " female")
                   .style("top", (e.pageY) - margin.left).style("left",(e.pageX) - margin.right)
                })
                   
                .on("mouseout", function (e, d) {
                    Tooltip.transition().duration(0).style("opacity", 0)});
            
            const xAxis = d3.axisBottom().scale(xScale);
		    const yAxis = d3.axisLeft().scale(yScale);
            svg.append("g").call(xAxis).attr("class", "xAxis").attr("transform","translate(0,450)")
			svg.append("g").call(yAxis).attr("class", "yAxis").attr("transform","translate(50,0)")

            svg.selectAll('line')
                .data(winners_by_year)
                .enter()
                .append('line')
                .attr('stroke', 'purple')
                .attr('x1', xScale(0))
                .attr('y1', yScale(0))
                .attr('x2', xScale(0))
                .attr('y2', yScale(0))
                .transition()
                .duration(5000)
                .attr('x2', xScale(d3.max(winners_by_year, function(d){ return d[1].get("male")})))
                .attr('y2', yScale(d3.max(winners_by_year, function(d){ return d[1].get("male")})))
                //line showing what it would look like if there was an equal number of male and female winners

        //title
        svg.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", margin.top)
            .text("Male vs Female Nobel Prize Winners per Year")
            .style("text-anchor", "middle")
        
        svg.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", height - margin.bottom)
            .text("Male Winners")
            .style("text-anchor", "middle")
            .attr("font-size", 12)
        
        svg.append("text")
            .attr("x", -height/2)
            .attr("y", margin.left)
            .text("Female Winners")
            .style("text-anchor", "middle")
            .attr("transform", "rotate (-90)")
            .attr("font-size", 12)


        


    });
}

var part2=function(filePath){
    d3.json(filePath).then(function(data){
        //The number of winners every year
        //columns: Year, Share (the number of people of people that shared the particular award)
        //type of graph: Line chart (year on x axis, num winners on y axis)
        
        nobel_prize_data = data['data']

        winners_by_year = d3.rollup(nobel_prize_data, v => v.length, d => d.year)
        males_by_year = d3.rollup(nobel_prize_data.filter(function(d){ return d.gender == "male" }), v => v.length, d => d.year)
        females_by_year = d3.rollup(nobel_prize_data.filter(function(d){ return d.gender == "female" }), v => v.length, d => d.year)
        
        begin_year = d3.min(winners_by_year.keys())
        current_year = d3.max(winners_by_year.keys())
        //there are some years where no prizes were given; we have to account for that
        for (let year = begin_year; year <= current_year; year+=1){
            if (Array.from((males_by_year).keys()).includes(year) == false){males_by_year.set(year, 0)}
            if (Array.from((females_by_year).keys()).includes(year) == false){females_by_year.set(year, 0)}
            if (Array.from((winners_by_year).keys()).includes(year) == false){winners_by_year.set(year, 0)}
        }
        
            overall_winners = {"Overall": winners_by_year, "Male": males_by_year, "Female": females_by_year}
            current_setting = "Overall"

            var width = 1200;
            var height = 500;
            var margin = {top: 50, bottom: 15, left: 25, right: 50}
            padding = 50

            svg = d3.select("#p2_plot").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")

            xScale = d3.scaleLinear().domain([d3.min(overall_winners[current_setting].keys()), //min and max years 
                    d3.max(overall_winners[current_setting].keys())])
                    .range([padding, width-padding]);

            yScale = d3.scaleLinear().domain([0, //0 to max number of winners
                d3.max(overall_winners[current_setting].values())])
            .range([height-padding, padding])

            var Tooltip = d3.select("#p2_plot")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("position", "absolute")

            svg.selectAll('circle') 
                .data(overall_winners[current_setting])
                .enter()
                .append('circle')
                .attr('fill', 'purple')
                .attr("r", 3)
                .attr('cx', function(d) {return xScale(d[0])}) //x=year
                .attr('cy', function(d) {return yScale(d[1])}) //y=number of winners
                .on("mouseover", function (e, d) {
                    Tooltip.transition().duration(0).style("opacity", 0.9)})
                .on("mousemove", function (e, d) { 
                    winners = d[1]
                    win_text = " "
                    if (winners == 1) {win_text = winners.toString() + " winner"}
                    else { win_text = winners.toString() + " winners"}
                   return Tooltip.text(d[0].toString() + ": " + win_text)
                   .style("top", (e.pageY) - margin.left).style("left",(e.pageX) - margin.right)
                })
                   
                .on("mouseout", function (e, d) {
                    Tooltip.transition().duration(0).style("opacity", 0)});

            svg.selectAll('line') 
                .data(overall_winners[current_setting])
                .enter()
                .append('line')
                .attr('stroke', 'purple')
                .attr('x1', function(d) {return xScale(d[0])}) //year
                .attr('y1', function(d) {return yScale(d[1])}) //winner
                //.attr('x2', function(d) {return xScale(d[0])}) //year
                //.attr('y2', function(d) {return yScale(d[1])})
                //.transition()
                //.duration(5000)
                .attr('x2', function(d,i){
                    if(d[0] == begin_year){return xScale(d[0])} //if this is the first year, stay in place
                    else{return xScale(d[0]-1)} //year-1
                })
                .attr('y2', function(d,i) {
                    if (d[0] == begin_year){return yScale(d[1])} //if this is the first year, stay in place
                    else {return yScale(overall_winners[current_setting].get(d[0]-1))} //value for year-1
                }) 

            const xAxis = d3.axisBottom().scale(xScale).tickFormat(d => d.toString())
		    const yAxis = d3.axisLeft().scale(yScale).ticks(d3.max(overall_winners[current_setting].values()))
            svg.append("g").call(xAxis).attr("class", "xAxis").attr("transform","translate(0,450)")
			svg.append("g").call(yAxis).attr("class", "yAxis").attr("transform","translate(50,0)")

            var radio = d3.select('#radio_p2')
                .attr('name', 'setting').on("change", function (d) {
                    current_setting = d.target.value; 
                    c_data = overall_winners[current_setting]                    

                    //change yScale
                    yScale = d3.scaleLinear().domain([0, //0 to max number of winners
                            d3.max(overall_winners[current_setting].values())])
                            .range([height-padding, padding])
                    
                    const yAxis = d3.axisLeft().scale(yScale).ticks(d3.max(c_data.values())); 
                    svg.selectAll("g.yAxis")
                        .transition()
                        .call(yAxis)

                    //change position of circles and lines
                    svg.selectAll('circle')
                        .data(c_data).transition()
                        .attr("fill", function(d){
                            if (current_setting == "Male"){return "blue"}
                            if (current_setting == "Female"){return "red"}
                            if (current_setting == "Overall"){return "purple"}
                        })
                        .attr('cx', function(d) {return xScale(d[0])}) //x=year
                        .attr('cy', function(d) {return yScale(d[1])}) //y=number of winners
            
                    svg.selectAll('line')
                        .data(c_data).transition()
                        .attr("stroke", function(d){
                            if (current_setting == "Male"){return "blue"}
                            if (current_setting == "Female"){return "red"}
                            if (current_setting == "Overall"){return "purple"}
                        })
                        .attr('x1', function(d) {return xScale(d[0])}) //year
                        .attr('y1', function(d) {return yScale(d[1])}) //winner
                        .attr('x2', function(d,i){
                            if(d[0] == begin_year){return xScale(d[0])}
                            else{return xScale(d[0]-1)} //year-1
                            })
                        .attr('y2', function(d,i) {
                            if (d[0] == begin_year){return yScale(d[1])}
                            else {return yScale(c_data.get(d[0]-1))} //value for year-1
                        }) 

                })


            //title
        svg.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", margin.top)
            .text("Number of Nobel Prize Winners Over Time")
            .style("text-anchor", "middle")
        
        svg.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", height - margin.bottom)
            .text("Year")
            .style("text-anchor", "middle")
            .attr("font-size", 12)
        
        svg.append("text")
            .attr("x", -height/2)
            .attr("y", margin.left)
            .text("Number of Winners")
            .style("text-anchor", "middle")
            .attr("transform", "rotate (-90)")
            .attr("font-size", 12)

        
    });
}

var part3=function(filePath){
    d3.json(filePath).then(function(data){
        //winners per category per year?
        //columns: Year, Category, Share (the number of laureates sharing the prize)
        //type of graph: Stacked bar chart
        nobel_prize_data = data['data']
        categories = d3.group(nobel_prize_data, d=>d.category)
        total_winners = d3.rollup(nobel_prize_data, v=>v.length, d=>d.year)
        years = Array.from(total_winners.keys())
        keys = Array.from(categories.keys())
        winners_by_year = d3.rollup(nobel_prize_data, v => v.length, d => d.year, d=>d.category)
        winners_overall = Array.from(winners_by_year, ([year, category]) => ({ year: year, ...Object.fromEntries(category)}));
        //console.log(winners_overall)

        var series =  d3.stack().keys(keys)
        var stacked = series(winners_overall)
        //console.log(stacked)

        //var colors = d3.schemeSet1//.slice(1)
        //var colors = d3.schemePastel2
        var colors = d3.schemeAccent.slice()

        var width = 1200;
        var height = 500;
        var margin = {top: 50, bottom: 10, left: 10, right: 10}
        var padding = 50

        svg_p3 = d3.select("#p3_plot").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")

        var Tooltip = d3.select("#p3_plot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("position", "absolute")

        var xScale = d3.scaleBand()
            .domain(d3.range(years.length)) //notice how the domain is set
            .range([width-padding, padding])
            .paddingInner(0.3);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(Array.from(total_winners.values())) ]) //the most number of winners in any year
            .range([padding, height-padding]);

        var groups = svg_p3.selectAll(".gbars")
            .data(stacked).enter().append("g")
            .attr("class", "gbars")
            .attr("fill", function(d,i){
                return colors[i];})
        
        groups.selectAll("rect").data(d => d).enter().append("rect")
            .attr("x", (d, i) => xScale(i))
            .attr("y", function(d,i){ if (d[i] == NaN){return yScale(0)}
                else{return height - yScale(d[1])}
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d,i) {return yScale(d[1]) - yScale(d[0])})
            .on("mouseover", function (e, d) {
                Tooltip.transition().duration(0).style("opacity", 0.9)})
            .on("mousemove", function (e, d) {
               return Tooltip.text( d[1]-d[0] )
               .style("top", ((e.pageY) - margin.bottom)).style("left",(e.pageX) - margin.right)
            })
               
            .on("mouseout", function (e, d) {
                Tooltip.transition().duration(0).style("opacity", 0)});
            
            
            const xAxis = d3.axisBottom().scale(xScale).tickFormat(d => d.toString())
            tickLabels = years
            xAxis.ticks(tickLabels.length)
            xAxis.tickFormat(function(d,i) {
                year = tickLabels[i];
                if (year % 6 == 0){return tickLabels[i]}
                });

            var yAxisScale = d3.scaleLinear()
                .domain([0, d3.max(Array.from(total_winners.values()))]) //the most number of winners in any year
                .range([height-padding, padding]);

            yAxis = d3.axisLeft().scale(yAxisScale).ticks(d3.max(Array.from(total_winners.values())))
            svg_p3.append("g").call(xAxis).attr("class", "xAxis").attr("transform","translate(0,450)")
            svg_p3.append("g").call(yAxis).attr("class", "yAxis").attr("transform","translate(50,0)")

        //title
        svg_p3.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", margin.top)
            .text("Nobel Prize Winners per Category per Year")
            .style("text-anchor", "middle")
        
        svg_p3.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", height - margin.bottom)
            .text("Year")
            .style("text-anchor", "middle")
            .attr("font-size", 12)
        
        svg_p3.append("text")
            .attr("x", -height/2)
            .attr("y", margin.left)
            .text("Number of Winners")
            .style("text-anchor", "middle")
            .attr("transform", "rotate (-90)")
            .attr("font-size", 12)

        svg_p3.append("text")
            .attr("x", padding * 2)
            .attr("y", padding + margin.top)
            .text("Legend")
            .style("text-anchor", "left")
            .attr("font-size", 12)
        
        //legend
        console.log()
        svg_p3.selectAll("p")
            .data(Array.from(keys)).enter()
            .append("text")
            .attr("x", padding * 2)
            .attr("y", function(d,i){return padding + margin.top + 15*(i+1)})
            .attr("font-size", 10)
            .text(function(d){return (d)})
            .style("text-anchor", "left")

        svg_p3.selectAll("legend")
            .data(colors).enter().append("circle")
            .attr("cx", padding * 2 - margin.left)
            .attr("cy", function(d,i){return padding + margin.top + 15*(i+1) - 2})
            .attr("r", 5)
            .attr("fill", function(d,i){return colors[i]})
            .attr("opacity", function(d,i){
                if (i >= keys.length){return 0}
                else {return 1}
            })
            
        //animation: add one category at a time so that the viewer can process the comparison across years
    });
}

var part4=function(filePath){
    d3.json(filePath).then(function(data){
        //Where are Nobel Prize winners from?
        //columns: Laureates, Born Country
        //type of graph: Chloropleth map
        d3.json("laureate_data.json").then(function(data){
            laureate_data = data["laureates"]
            winners_per_country = d3.rollup(laureate_data, v => v.length, d => d.bornCountry)
            console.log()
            var width = 1000;
            var height = 500;
            var margin = {top: 50, bottom: 20, left: 10, right: 15}
            var padding = 50

            //var transform = d3.event.transform;

            svg_p4 = d3.select("#p4_plot").append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.zoom().on("zoom", function () {
                    svg_p4.attr("transform", d3.zoomTransform(this))
                 }))
                .append("g")

                const projection  = d3.geoNaturalEarth1().scale(150).translate([width / 2, height / 2])
                const pathgeo = d3.geoPath().projection(projection)
                
                //var colors = d3.scaleSequential().domain([0, 300]).interpolator(d3.interpolatePuRd)
                //var colors = d3.scaleSequential().domain([0,300]).interpolator(d3.interpolateViridis)
                //var colors = d3.scaleSequential().domain([0,300]).interpolator(d3.interpolateWarm)
                //var colors = d3.scaleSequential().domain([0,300]).interpolator(d3.interpolateRainbow)
                //var colors = d3.scaleSequential().domain([0,300]).interpolator(d3.interpolateRgb("lavender", "maroon"))
                var colors = d3.scaleSequential()
                            .domain([0, d3.max(winners_per_country.values())]) //the max number of winners in one country
                            .interpolator(d3.interpolateHslLong("lavender", "purple"))
                var Tooltip = d3.select("#p4_plot")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("position", "absolute")

                //world map
                d3.json("world.json").then(function (data) {
                    svg_p4.selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("d", pathgeo)
                        .attr("fill", function(d,i){
                            country = d.properties['name']
                            num_winners = winners_per_country.get(country)
                            if (num_winners == undefined){num_winners = 0}
                            //console.log(num_winners)
                            return colors(num_winners)
                        })
                        .attr("stroke", "white")
                        .attr("stroke-width", 0.3)
                        .on("mouseover", function (e, d) {
                            Tooltip.transition().duration(0).style("opacity", 0.9)})
                        .on("mousemove", function (e, d) { 
                            country = d.properties['name']
                            num_winners = winners_per_country.get(country)
                            if (num_winners == undefined){num_winners = 0}
                            win_text = " "
                            if (num_winners == 1){ win_text = num_winners.toString() + " winner"}
                            else {win_text = num_winners.toString() + " winners"}
                           return Tooltip.text(country.toString() + ": " + win_text)
                           .style("top", (e.pageY) - margin.bottom).style("left",(e.pageX) - margin.right)
                        })
                           
                        .on("mouseout", function (e, d) {
                            Tooltip.transition().duration(0).style("opacity", 0)});
            
            //title
            svg_p4.append("text")
                .attr("x", (width + margin.top)/2)
                .attr("y", margin.top/2)
                .text("Number of Nobel Prize Winners per Country")
                .style("text-anchor", "middle")

            svg_p4.append("text")
                .attr("x", padding * 3)
                .attr("y", padding + margin.top)
                .text("Legend")
                .style("text-anchor", "middle")
                .attr("font-size", 12)

            //legend
            ex = [0, 50, 100, 150, 200, 250, 300]
        svg_p4.selectAll("p")
            .data(ex).enter()
            .append("text")
            .attr("x", padding * 3)
            .attr("y", function(d,i){return padding + margin.top + 15*(i+1)})
            .attr("font-size", 10)
            .text(function(d){return (d)})
            .style("text-anchor", "left")

        svg_p4.selectAll("example")
            .data(ex).enter().append("circle")
            .attr("cx", padding * 3 - margin.left)
            .attr("cy", function(d,i){return padding + margin.top + 15*(i+1) - 2})
            .attr("r", 5)
            .attr("fill", function(d,i){return colors(d)})    
                
            //animation: click to zoom/pan
                
            })
        })
    });
}

var part5=function(filePath){
    d3.json(filePath).then(function(data){
        //How much variation has there been in the number of Nobel Prize winners over time?
        //columns: Year, Share
        //type of graph: Box Plot
        colors = ["purple", "blue", "red"]
        nobel_prize_data = data['data']
        winners_by_year = d3.rollup(nobel_prize_data, v => v.length, d => d.year)
        males_by_year = d3.rollup(nobel_prize_data.filter(function(d){ return d.gender == "male" }), v => v.length, d => d.year)
        females_by_year = d3.rollup(nobel_prize_data.filter(function(d){ return d.gender == "female" }), v => v.length, d => d.year)

        begin_year = d3.min(winners_by_year.keys())
        current_year = d3.max(winners_by_year.keys())
        //there are some years where no prizes were given; we have to account for that
        for (let year = begin_year; year <= current_year; year+=1){
            if (Array.from((males_by_year).keys()).includes(year) == false){males_by_year.set(year, 0)}
            if (Array.from((females_by_year).keys()).includes(year) == false){females_by_year.set(year, 0)}
            if (Array.from((winners_by_year).keys()).includes(year) == false){winners_by_year.set(year, 0)}
        }

        winners = Array.from(winners_by_year.values())
        male_winners = Array.from(males_by_year.values())
        female_winners = Array.from(females_by_year.values())
        
        var width = 600;
        var height = 500;
        var margin = {top: 30, bottom: 15, left: 10, right: 100}
        padding = 50

        rect_width = width/10
        load_time = 5000

        svg_p5 = d3.select("#p5_plot").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
        

        // Compute summary statistics used for the box:
        var data_sorted = winners.sort(d3.ascending)
        var q1 = d3.quantile(data_sorted, .25)
        var median = d3.quantile(data_sorted, .5)
        var q3 = d3.quantile(data_sorted, .75)
        var interQuantileRange = q3 - q1
        var min = d3.min(data_sorted)
        var max = d3.max(data_sorted)

        var yScale = d3.scaleLinear().domain([0, d3.max(data_sorted)])
            .range([height - padding, padding]);

        svg_p5
            .append("line")
            .attr("x1", width/4)
            .attr("x2", width/4)
            .attr("y1", yScale(min))
            .attr("y2", yScale(max))
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(0)
            .duration(load_time)
            .attr("opacity", 1)

        svg_p5
            .append("rect")
            .attr("x", width/4 - (rect_width / 2))
            .attr("y", yScale(q3) )
            .attr("height", (yScale(q1)-yScale(q3)) )
            .attr("width", rect_width)
            .attr("stroke", "black")
            .style("fill", colors[0])
            .attr("opacity", 0)
            .transition()
            .delay(0)
            .duration(load_time)
            .attr("opacity", 1)
            

        svg_p5
            .selectAll("overall")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", width/4 - (rect_width / 2))
            .attr("x2", width/4 + (rect_width / 2))
            .attr("y1", function(d){ return(yScale(d))} )
            .attr("y2", function(d){ return(yScale(d))} )
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(0)
            .duration(load_time)
            .attr("opacity", 1)

        var males_sorted = male_winners.sort(d3.ascending)
        var q1_males = d3.quantile(males_sorted, .25)
        var median_males = d3.quantile(males_sorted, .5)
        var q3_males = d3.quantile(males_sorted, .75)
        var min_males = d3.min(males_sorted)
        var max_males = d3.max(males_sorted)

        svg_p5
            .append("line")
            .attr("x1", width/2)
            .attr("x2", width/2)
            .attr("y1", yScale(min_males))
            .attr("y2", yScale(max_males))
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(load_time)
            .duration(load_time)
            .attr("opacity", 1)

        svg_p5
            .append("rect")
            .attr("x", width/2 - (rect_width / 2))
            .attr("y", yScale(q3_males) )
            .attr("height", (yScale(q1_males)-yScale(q3_males)) )
            .attr("width", rect_width)
            .attr("stroke", "black")
            .style("fill", colors[1])
            .attr("opacity", 0)
            .transition()
            .delay(load_time)
            .duration(load_time)
            .attr("opacity", 1)

        svg_p5
            .selectAll("males")
            .data([min_males, median_males, max_males])
            .enter()
            .append("line")
            .attr("x1", width/2 - (rect_width / 2))
            .attr("x2", width/2 + (rect_width / 2))
            .attr("y1", function(d){ return(yScale(d))} )
            .attr("y2", function(d){ return(yScale(d))} )
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(load_time)
            .duration(load_time)
            .attr("opacity", 1)
        
        
        var females_sorted = female_winners.sort(d3.ascending)
        var q1_females = d3.quantile(females_sorted, .25)
        var median_females = d3.quantile(females_sorted, .5)
        var q3_females = d3.quantile(females_sorted, .75)
        var min_females = d3.min(females_sorted)
        var max_females = d3.max(females_sorted)

        svg_p5
            .append("line")
            .attr("x1", 3 * width/4)
            .attr("x2", 3 * width/4)
            .attr("y1", yScale(min_females))
            .attr("y2", yScale(max_females))
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(2*load_time)
            .duration(load_time)
            .attr("opacity", 1)

        svg_p5
            .append("rect")
            .attr("x", 3 * width/4 - (rect_width / 2))
            .attr("y", yScale(q3_females) )
            .attr("height", (yScale(q1_females)-yScale(q3_females)) )
            .attr("width", rect_width)
            .attr("stroke", "black")
            .style("fill", colors[2])
            .attr("opacity", 0)
            .transition()
            .delay(2*load_time)
            .duration(load_time)
            .attr("opacity", 1)

        svg_p5
            .selectAll("females")
            .data([min_females, median_females, max_females])
            .enter()
            .append("line")
            .attr("x1", 3 * width/4 - (rect_width / 2))
            .attr("x2", 3 * width/4 + (rect_width / 2))
            .attr("y1", function(d){ return(yScale(d))} )
            .attr("y2", function(d){ return(yScale(d))} )
            .attr("stroke", "black")
            .attr("opacity", 0)
            .transition()
            .delay(2*load_time)
            .duration(load_time)
            .attr("opacity", 1)

        const yAxis = d3.axisLeft().scale(yScale).ticks(d3.max(data_sorted));
        svg_p5.append("g").call(yAxis).attr("class", "yAxis").attr("transform","translate(30,0)")

        //title
        svg_p5.append("text")
            .attr("x", (width+margin.top)/2)
            .attr("y", margin.top)
            .text("Number of Nobel Prize Winners per Year")
            .style("text-anchor", "middle")
        
        svg_p5.append("text")
            .attr("x", -height/2)
            .attr("y", margin.left)
            .text("Number of Winners")
            .style("text-anchor", "middle")
            .attr("transform", "rotate (-90)")
            .attr("font-size", 12)

        svg_p5.append("text")
            .attr("x", width - padding * 2)
            .attr("y", padding + margin.top)
            .text("Legend")
            .style("text-anchor", "middle")
            .attr("font-size", 12)
        
        //legend
        keys = ["Overall", "Male", "Female"]
        svg_p5.selectAll("p")
            .data(keys).enter()
            .append("text")
            .attr("x", width - padding * 2)
            .attr("y", function(d,i){return padding + margin.top + 15*(i+1)})
            .attr("font-size", 10)
            .text(function(d){return (d)})
            .style("text-anchor", "left")

        svg_p5.selectAll("legend")
            .data(colors).enter().append("circle")
            .attr("cx", width - padding * 2 - margin.left)
            .attr("cy", function(d,i){return padding + margin.top + 15*(i+1) - 2})
            .attr("r", 5)
            .attr("fill", function(d,i){return colors[i]})
        
        
        
        //console.log("part5")
    });
}

var part6=function(filePath){
    d3.json(filePath).then(function(data){
        
        // pictograph showing the number of overall winners per category
        nobel_prize_data = data['data']
        winners_by_category = d3.rollup(nobel_prize_data, v => v.length, d => d.category)
        categories = Array.from(winners_by_category.keys())
        winners = Array.from(winners_by_category.values())
        var colors = d3.schemeAccent.slice()

        var p6_width = 1200;
        var p6_height = 300;
        var p6_margin = {top: 30, bottom: 15, left: 8, right: 100}
        p6_padding = 60

        svg_p6 = d3.select("#p6_plot").append("svg")
            .attr("width", p6_width)
            .attr("height", p6_height)
            .append("g")

        x6Scale = d3.scaleLinear().domain([0, d3.max(winners)]) //the max number of winners in one category
            .range([p6_padding, p6_width - p6_padding]);

        y6Scale = d3.scaleLinear().domain([0, categories.length]) //number of categories
            .range([p6_height - p6_padding, p6_padding])

        const xAxis = d3.axisBottom().scale(x6Scale);
        svg_p6.append("g").call(xAxis).attr("class", "xAxis").attr("transform","translate(0,250)")
        
		//const yAxis = d3.axisLeft().scale(yScale);
        //yAxis.ticks(categories.length)
        //yAxis.tickFormat(function(d,i) {return categories[i]});
	    //svg_p6.append("g").call(yAxis).attr("class", "yAxis").attr("transform","translate(60,0)")
        

        svg_p6.selectAll("p")
            .data(categories).enter()
            .append("text")
            .attr("x", 15)
            .attr("y", function(d,i){return y6Scale(i) + 2})
            .attr("font-size", 10)
            .text(function(d){return (d)})
            .style("text-anchor", "left")

        var counter = d3.range(d3.max(winners_by_category.values()))
        svg_p6.selectAll('chem') 
                .data(counter)
                .enter()
                .append('circle')
                //.attr('fill', 'teal')
                .attr('fill', colors[0])
                .attr("r", 2)
                .attr('cx', function(d) {return x6Scale(d)}) 
                .attr('cy', function(d) {return y6Scale(0)}) //the category's place in keys
                .attr("opacity", function(d){
                if (d <= winners[0]){ return 1}
                else {return 0}
            })

        svg_p6.selectAll('econ') 
            .data(counter)
            .enter()
            .append('circle')
            //.attr('fill', 'green')
            .attr('fill', colors[1])
            .attr("r", 2)
            .attr('cx', function(d) {return x6Scale(d)}) 
            .attr('cy', function(d) {return y6Scale(1)}) //the category's place in keys
            .attr("opacity", function(d){
            if (d <= winners[1]){ return 1}
            else {return 0}
        })

        svg_p6.selectAll('lit') 
            .data(counter)
            .enter()
            .append('circle')
            //.attr('fill', 'pink')
            .attr('fill', colors[2])
            .attr("r", 2)
            .attr('cx', function(d) {return x6Scale(d)}) 
            .attr('cy', function(d) {return y6Scale(2)}) //the category's place in keys
            .attr("opacity", function(d){
                if (d <= winners[2]){ return 1}
                else {return 0}
            })
        
        svg_p6.selectAll('peace') 
            .data(counter)
            .enter()
            .append('circle')
            //.attr('fill', 'lavender')
            .attr('fill', colors[3])
            .attr("r", 2)
            .attr('cx', function(d) {return x6Scale(d)}) 
            .attr('cy', function(d) {return y6Scale(3)}) //the category's place in keys
            .attr("opacity", function(d){
            if (d <= winners[3]){ return 1}
            else {return 0}
        })

        svg_p6.selectAll('physics') 
            .data(counter)
            .enter()
            .append('circle')
            //.attr('fill', 'gray')
            .attr('fill', colors[4])
            .attr("r", 2)
            .attr('cx', function(d) {return x6Scale(d)}) 
            .attr('cy', function(d) {return y6Scale(4)}) //the category's place in keys
            .attr("opacity", function(d){
                if (d <= winners[4]){ return 1}
                else {return 0}
            })
        
        svg_p6.selectAll('med') 
            .data(counter)
            .enter()
            .append('circle')
            //.attr('fill', 'maroon')
            .attr('fill', colors[5])
            .attr("r", 2)
            .attr('cx', function(d) {return x6Scale(d)}) 
            .attr('cy', function(d) {return y6Scale(5)}) //the category's place in keys
            .attr("opacity", function(d){
            if (d <= winners[5]){ return 1}
            else {return 0}
        })

        //title
        svg_p6.append("text")
            .attr("x", (p6_width + p6_margin.top)/2)
            .attr("y", p6_margin.top)
            .text("Nobel Prize Winners per Category")
            .style("text-anchor", "middle")
        
        svg_p6.append("text")
            .attr("x", (p6_width + p6_margin.top)/2)
            .attr("y", p6_height - p6_margin.bottom )
            .text("Number of Winners")
            .style("text-anchor", "middle")
            .attr("font-size", 12)
            
        svg_p6.append("text")
            .attr("x", -p6_height/2)
            .attr("y", p6_margin.left)
            .text("Category")
            .style("text-anchor", "middle")
            .attr("transform", "rotate (-90)")
            .attr("font-size", 12)
        
        
    });
}
