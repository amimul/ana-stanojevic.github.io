function get_expedition_id(data) {
  let id_str = (data[0].Info.indexOf('-') != -1) ?
    data[0].Info.split('-')[0] : data[0].Info;

  return id_str.replace(/[/ _]+/g, "");
}

function get_coord(d, coord) {
  const xy = {'x':0, 'y':1};

  lat = parseFloat(d.Latitude.replace(',','.').replace(' ',''));
  long = parseFloat(d.Longitude.replace(',','.').replace(' ',''));
  return projection([long, lat])[xy[coord]];
}

function Ocean(name, expeditions) {
  this.name = name;
  this.children = expeditions.map(data => new Expedition(data));
}

function Expedition(data) {
  this.name = get_expedition_id(data);
  this.children = data.map((d, i) => new ExPoint(d, i, this.name));

  this.total_wd1 = 0;
  this.total_wd2 = 0;
  this.total_wd3 = 0;
  this.total_wd4 = 0;

  for(var i in this.children) {
    this.total_wd1 += this.children[i].wd1;
    this.total_wd2 += this.children[i].wd2;
    this.total_wd3 += this.children[i].wd3;
    this.total_wd4 += this.children[i].wd4;
  }
}

function ExPoint(d, number, exp_id) {

  this.name = "st_point_"+number+"_"+exp_id;

  let cd_v1 = parseFloat(format_cdwd(d.cd1));
  let cd_v2 = parseFloat(format_cdwd(d.cd2));
  let cd_v3 = parseFloat(format_cdwd(d.cd3));
  let cd_v4 = parseFloat(format_cdwd(d.cd4));

  let wd_v1 = parseFloat(format_cdwd(d.wd1));
  let wd_v2 = parseFloat(format_cdwd(d.wd2));
  let wd_v3 = parseFloat(format_cdwd(d.wd3));
  let wd_v4 = parseFloat(format_cdwd(d.wd4));

  this.total_cd = (isNaN(cd_v1) ? 0 : cd_v1) +
    (isNaN(cd_v2) ? 0 : cd_v2) +
    (isNaN(cd_v3) ? 0 : cd_v3) +
    (isNaN(cd_v4) ? 0 : cd_v4);

  this.wd1 = (isNaN(wd_v1) ? 0 : wd_v1);
  this.wd2 = (isNaN(wd_v2) ? 0 : wd_v2);
  this.wd3 = (isNaN(wd_v3) ? 0 : wd_v3);
  this.wd4 = (isNaN(wd_v4) ? 0 : wd_v4);
  this.total_wd = this.wd1 + this.wd2 + this.wd3 + this.wd4;
  this.date = d.Date;
}

function format_cdwd(str) {
  return str.replace(/\s/g, '').replace(/\,/g, '.');
}

/* Computes averaged position of expedition group

Input: data, which contains x and y properties
Ouput: array of two elements [0] - x; [1] - y;
*/
function compute_ex_position(data) {
  let data_coords = data.map(d=>[get_coord(d, 'x'), get_coord(d, 'y')]);

  let total_x = 0, total_y = 0;
  for(var i in data_coords) {
    total_x += data_coords[i][0];
    total_y += data_coords[i][1];
  }

  let pos = [total_x/data_coords.length,
    total_y/data_coords.length];

  return pos;
}

function create_hierarchy(ocean_json) {
  return d3.hierarchy(ocean_json,
    function(d){
      return d.children;
    })
    .sum(function(d) {
      return d.total_cd;
    })
    .sort(function(d1, d2){
      return d2.total_cd - d1.total_cd;
    });
}

function append_circles(pack_layout) {
  return pack_layout.append("circle")
  .attr("r", function(d) { return d.r; })
  .attr("id", function(d) {
    return d.data.name;
  })
  .style("fill", function(d) {
    return color(d.depth);
  })
  .on("mouseover",function(d){
    if(!d.children) {
      let this_root = get_root(d);
      if(!(active_layout == null || active_layout === this_root)) {return;}

      const point_id = "ex"+d.data.name.substring(2, d.data.name.length);
      d3.select("circle#"+ point_id).attr("r", 5)
        .style("fill", "white")
        .style("stroke-width", "3");
    }
  })
  .on("mouseout", function(d) {
    if(!d.children) {
      const point_id = "ex"+d.data.name.substring(2, d.data.name.length);
      d3.select("circle#"+ point_id).attr("r", 3)
        .style("fill", "red")
        .style("stroke-width", "1");
    }
  });
}

function create_horizontal_bars(hierarchy_group_elements) {
  hierarchy_group_elements.each(function(d){
    if(!d.children) {
      let data = generate_bar_data(d);
      if(data == null) {return;}

      let this_node = d3.select(this);
      let _width = d.r*1.4142;

      let	x = d3.scaleLinear().rangeRound([0, _width]),
          y = d3.scaleBand().rangeRound([_width, 0]).padding(0.25);

      //define domains based on data
      x.domain([0, d3.max(data, function(d) { return d.num; })]);
      y.domain(data.map(function(d) { return d.category; }));

      this_node.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", -d.r*0.6)
        .attr("y", function(_d) {
          return y(_d.category)-d.r*0.8;
        })
        .attr("stroke-opacity", 0)
        .attr("height", y.bandwidth())
        .attr("width", function(d) { return x(d.num)*0.7; })
        .style("fill", "#2ca25f");

      // y axis labels
      this_node.selectAll("#bar_label")
        .data(data).enter()
        .append("text")
        .attr("id", "bar_label")
        .attr("stroke-opacity", 0)
        .attr("text-anchor", "end")
        .style("font-size", 1)
        .text(function(_d){ return _d.category; })
        .attr("x", -d.r*0.7)
        .attr("y", function(_d) { return y(_d.category)-d.r*0.8; })
        .style("fill","black");

      //bar values
      this_node.selectAll("#bar_value")
        .data(data).enter()
        .append("text")
        .attr("id", "bar_value")
        .attr("stroke-opacity", 0)
        .attr("text-anchor", "start")
        .style("font-size", 1)
        .text(function(_d){ return Math.round(_d.num).toFixed(2) + "%"; })
        .attr("x", -d.r*0.3)
        .attr("y", function(_d) { return y(_d.category)-d.r*0.8; })
        .style("fill","yellow")
        .style("font-weight","bold");

      let date_g = this_node.append("g").attr("id", "date");
      date_g.append("text")
        .style("font-size", 1)
        .text(data[0].date)
        .attr("stroke-opacity", 0)
        .style("fill","black")
        .attr("id", "date_text")
        .attr("text-anchor", "middle")
        .style("font-weight","bold");
    }
  });
}

function create_arc_text(diameter, position, ocean_name, map_svg) {

  // define arc path element
  let arc = d3.arc()
        .innerRadius(diameter/2)
        .outerRadius(diameter/2 + 2)
        .startAngle(-115 * (Math.PI/180)) //converting from degs to radians
        .endAngle(2) //just radians

  map_svg.append("path")
        .attr("d", arc)
        .attr("fill", "none")
        .attr("id", "arc_"+ocean_name)
        .attr("transform", "translate(" +
              position[0] + "," +
              position[1] + ")");

  map_svg.append("text")
     .style("text-anchor","moddle")
     .attr("id", "arc_text")
     .append("textPath")
     .attr("xlink:href", "#arc_"+ocean_name)
     .attr("startOffset", "20.%")
     .style("font-size", "30px")
     .style("fill", "gray")
     .style("font-weight", "bold")
     .style("font-family", "sans-serif")
     .text(ocean_name.charAt(0).toUpperCase() + ocean_name.slice(1));
}

function zoom_barcharts(g_elements, k) {
  g_elements.each(function(d){

    if(!d.children) {
      //TODO: generate data once

      let data = generate_bar_data(d);
      if(data == null) {return;}

      let this_node = d3.select(this);
      let _width = d.r*k*1.4142;

      let	x = d3.scaleLinear().rangeRound([0, _width]),
          y = d3.scaleBand().rangeRound([_width, 0]).padding(0.25);

      //define domains based on data
      x.domain([0, d3.max(data, function(d) { return d.num; })]);
      y.domain(data.map(function(d) { return d.category; }));

      this_node.selectAll(".bar")
        .attr("x", -d.r*k*0.17)
        .attr("y", function(_d) {
          return y(_d.category)-d.r*k*0.8;
        })
        .attr("height", y.bandwidth())
        .attr("width", function(d) { return x(d.num)*0.7; })
        .style("fill", "#2ca25f");

      this_node.selectAll("#bar_label")
        .attr("x", -d.r*k*0.25)
        .style("font-size", d.r*k*0.1+"px")
        .attr("y", function(_d) {
          return y(_d.category)-d.r*k*0.62;
        });

      this_node.selectAll("#bar_value")
        .attr("x", -d.r*k*0.15)
        .style("font-size", d.r*k*0.1+"px")
        .attr("y", function(_d) {
          return y(_d.category)-d.r*k*0.62;
        });

      this_node.select("#date_text")
        .style("font-size", d.r*k*0.1+"px")
        .attr("x", d.r*k*0.01)
        .attr("y", d.r*k*0.8);
      }
  });

}

// three levels hierarchy
function get_root(node) {
  return node.parent ?
    (node.parent.parent ?
      node.parent.parent : node.parent ) : node;
}

var active_layout = null;
var layouts = new Map();
function can_handle_interaction(root) {
  return active_layout == null || active_layout == root;
}

//factor should be between [0, 1]
function make_opaque(map_svg, factor) {
  return function(){
    for (var [_root, _g] of layouts) {
      if(_root !== active_layout) {
        _g.style("opacity", factor);
      }
    }
    map_svg.selectAll("text#arc_text").style("opacity", factor);
  }
}


/* Creates circle packing layout and feeds the map with it
Input:
  data - Ocean object (see pack_layout.js)
  position - coordinates on map to display
  ocean_name - string, circle packing layout label
  map_svg - container which appends circle packing layout

Output:
*/
function drawData(data, position, ocean_name, map_svg) {

  // prepare data for hierarchy
  let ocean_json_str = JSON.stringify(data);
  let ocean_json = JSON.parse(ocean_json_str);

  var packLayout = d3.pack()
    .size([diameter, diameter]).padding(3);

  let root = create_hierarchy(ocean_json);

  packLayout(root);

  var focus = root,
      nodes = root.descendants(),
      view;

  var g = map_svg.append("g").attr("id", "pack_layout")
    .attr("transform", "translate(" +
      position[0] + "," +
      position[1] + ")");

  layouts.set(root, g);

  //create group elements for hierarchy
  var node = g.selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("opacity", function(d){ return d.parent ? 1.0 : 0.2; })
    .each(function(d) { d.node = this; })
    .on("click", function(d) {
      let this_root = get_root(d);

      //check to not move to another layout
      if(active_layout !=null && this_root !== active_layout) {
        return;
      }

      if (focus !== d) {
        active_layout = this_root
        if (d===this_root) {
          zoom(d, make_opaque(map_svg, 1));
          active_layout=null;
        }
        else {
          zoom(d, make_opaque(map_svg, 0));
          d3.event.stopPropagation();
        }
      }
      else {
          zoom(this_root, make_opaque(map_svg, 1));
          active_layout = null;
      }
    })
    .on("mouseover", function(d) {
      if(!d.parent) {return;}

      let this_root = get_root(d);
      if(!(active_layout == null || active_layout === this_root)) {return;}

      d3.select(this).style("stroke", "black").style("stroke-width", "1.5");
      if(d.children) {
        highlight(map_svg, d.data.name);
      }
    })
    .on("mouseout", function(d) {
      if(!d.parent) {return;}

      d3.select(this).style("stroke", "none");
      if(d.children) {
        cancel_highlight(map_svg);
      }
    });

  //feed layout with circles
  var circle = append_circles(node);

  create_horizontal_bars(node);

  // initialize view by this call
  zoomTo([root.x, root.y, root.r * 2]);

  create_arc_text(diameter, position, ocean_name, map_svg);

  function zoom(d, callback) {
    var focus0 = focus;
    focus = d;
    if (d.parent==null) var i_zoom = d3.interpolateZoom(view, [focus.x, focus.y, focus.r *2]);
    else var i_zoom = d3.interpolateZoom(view, [focus.x-focus.r*1.2/2, focus.y-focus.r*1.2/2, focus.r * 1.2]);
    var transition = d3.transition()
        .duration(1000)
        .tween("zoom", function(d) {
          return function(t) {
            zoomTo(i_zoom(t), callback);
          };
        });
  }

  function zoomTo(v, callback = null) {
    var k = diameter / v[2];
    view = v;

    node.attr("transform", function(d) {
      return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });

    zoom_barcharts(node, k);
    circle.attr("r", function(d) { return d.r * k; });
    if(callback != null) {
      callback();
    }
  }
}

function drawAll(data_list, positions, ocean_order, map_svg) {
  for(var i in data_list) {
    drawData(data_list[i], positions[i], ocean_order[i], map_svg);
  }
}
