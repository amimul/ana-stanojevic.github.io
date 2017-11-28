 function add_radiobuttons(){
   let allButtons= svg.append("g").attr("id","allButtons") 
     let labels= ['Overview','Expeditions','Spreading'];  //here maybe some more creative way
     let defaultColor= "#7777BB"
     let hoverColor= "#0000ff"
     let pressedColor= "#000077"

     let buttonGroups= allButtons.selectAll("g.button")
                                      .data(labels)
                                      .enter()
                                      .append("g")
                                      .attr("class","button")
                                      .style("cursor","pointer")
                                      .on("click",function(d,i) {
                                          d3.select(this.parentNode).selectAll("rect").attr("fill",defaultColor)
                                          d3.select(this).select("rect").attr("fill",pressedColor)

                                      })
                                      .on("mouseover", function() {
                                          if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                              d3.select(this)
                                                  .select("rect")
                                                  .attr("fill",hoverColor);
                                          }
                                      })
                                      .on("mouseout", function() {
                                          if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                              d3.select(this)
                                                  .select("rect")
                                                  .attr("fill",defaultColor);
                                          }
                                      })

    var bWidth= 100; //button width
    var bHeight= 25; //button height
    var bSpace= 10; //space between buttons
    var x0= 20; //x offset
    var y0= window.innerHeight*0.80+5; //y offset
    buttonGroups.append("a").attr("xlink:href", function(d){return 'map_'+d+'.html'})
                .append("rect")
                .attr("class","buttonRect")
                .attr("width",bWidth)
                .attr("height",bHeight)
                .attr("x",x0)
                .attr("y",function(d,i) {return y0+(bHeight+bSpace)*i;})
                .attr("rx",5) //rx and ry give the buttons rounded corners
                .attr("ry",5)
                .attr("fill",defaultColor)

    buttonGroups.append("text")
                .attr("class","buttonText")
                .attr("font-family","FontAwesome")
                .attr("x",x0 + bWidth/2)
                .attr("y",function(d,i) { return y0+ (bHeight+bSpace)*i + bHeight/2; })
                .attr("text-anchor","middle")
                .attr("dominant-baseline","central")
                .attr("fill","white")
                .text(function(d) {return d;})
}