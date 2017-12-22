/* ---------------------------------------------------------------
Asynchronously read data from all provided expedition_*.csv files;
Combine expeditions which belongs to the same ocean;

Input: files - array of csv files names
       callback - function which will handle all read data
Output: results - Map of oceans and corresponding expeditions
---------------------------------------------------------------*/
function multiCsv(files, callback) {
  let files_length = 0;
  for(var i in files) {
    files_length += files[i].length;
  }

  let results = new Map();
  let read_files = 0;

  for(var k in files) {
    for(var i in files[k]) {

      let file_name = files[k][i];
      let ocean = k;
      if(!results.get(ocean)) {
        results.set(ocean, []);
      }

      d3.text(file_name, function(error, raw) {
        if(error) { return; }
        let dsv = d3.dsvFormat(';');
        let data = dsv.parse(raw);
        results.get(ocean).push(data);
        read_files += 1;

        if(read_files === files_length) {
          callback(null, results);
        }
      });
    }
  }
};

function multiCsv_cb(err, results) {

    let map = d3.select("#map");

    let i = 1;
    results.forEach(function(data_list, ocean, mapObj) {
      data_list.forEach(function(data) {
        let expedition_id = get_expedition_id(data);
        let exists = typeof(expedition_data.get(expedition_id)) !== 'undefined';
        if(exists) {
          expedition_id = expedition_id + i;
          i += 1;
        }
        expedition_data.set(expedition_id, data);

        map.append("path")
           .datum(data)
           .attr("class", "line")
           .attr("id", expedition_id)
           .attr("d", line)
           .on('mouseout', function(d) {
             let this_path = d3.select(this);
             let e_id = this_path.attr("id");
             if(SELECTED_EXP_ID === e_id) {
                 cancel_highlight(map);
             }
             //this_path.style("cursor", "default");
           })
           .on('mouseover', function(d){
             let this_path = d3.select(this);
             let e_id = this_path.attr("id");
             highlight(map, e_id);

             //this_path.style("cursor", "pointer");
           });

        map.append("g")
          .selectAll("circle")
          .data(data).enter().append("circle")
          .attr("cx", function(d){
            return get_coord(d, 'x');
          })
          .attr("cy", function(d){
            return get_coord(d, 'y');
          })
          .attr("r", 3)
          .attr("id", function(d, i){
            return "ex_point_"+i+"_"+expedition_id;
          })
          .attr("class","circle")
          .on('mouseover', function(d) {
            let this_circle = d3.select(this);
            let e_id = this_circle.attr("id");

            if(!e_id.includes(SELECTED_EXP_ID)) {
              let terms = e_id.split('_');
              let curr_e_id = terms[terms.length-1];
              highlight(map, curr_e_id);
            }

            //this_circle.style("cursor", "pointer");
            this_circle.attr("r", 5).style("fill", "white");

            const point_id = this_circle.attr("id")
            const stat_id = "st"+point_id.substring(2, point_id.length);
            d3.select("circle#"+ stat_id)
              .style("stroke", "black")
              .style("stroke-width", "1.5");
          })
          .on('mouseout',function (d) {
            let this_circle = d3.select(this);
            let e_id = this_circle.attr("id");
            let terms = e_id.split('_');
            let curr_e_id = terms[terms.length-1];
            if(SELECTED_EXP_ID === curr_e_id) {
              cancel_highlight(map);
            }
            this_circle.style("cursor", "default").style("fill", "red");
            this_circle.attr("r", 3);

            const point_id = this_circle.attr("id");
            const stat_id = "st"+point_id.substring(2, point_id.length);
            d3.select("circle#"+ stat_id)
              .style("stroke", "none");
          });
      });
    });

    let data_list = create_oceans(results);

    let positions = calc_positions(results);

    let ocean_order = [];
    for (var [key, e_data_list] of results) {
      ocean_order.push(key);
    }

    //setup all circle packing layouts and display them
    drawAll(data_list, positions, ocean_order, map);
  }

var st_point_data = new Map();

function generate_bar_data(d) {

  if(st_point_data.has(d.data.name)) {
    return st_point_data.get(d.data.name);
  }

  const v1 = d.parent.data.total_wd1 !== 0 ? (d.data.wd1/d.parent.data.total_wd1)*100 : 0;
  const v2 = d.parent.data.total_wd2 !== 0 ? (d.data.wd2/d.parent.data.total_wd2)*100 : 0;
  const v3 = d.parent.data.total_wd3 !== 0 ? (d.data.wd3/d.parent.data.total_wd3)*100 : 0;
  const v4 = d.parent.data.total_wd4 !== 0 ? (d.data.wd4/d.parent.data.total_wd4)*100 : 0;

  if(v1===0 && v2===0 && v3===0 && v3===0) {
    return null;
  }

  st_point_data.set(d.data.name,  [
      {
        "category": ".335-.999 mm",
        "num": d.data.total_wd !== 0 ? (d.data.wd1/d.data.total_wd)*100 : 0,
        "date": d.data.date
      },
      {
        "category":"1.00-4.75 mm",
        "num": d.data.total_wd !== 0 ? (d.data.wd2/d.data.total_wd)*100 : 0,
        "date": d.data.date
      },
      {
        "category":"4.75-200 mm",
        "num": d.data.total_wd !== 0 ? (d.data.wd3/d.data.total_wd)*100 : 0,
        "date": d.data.date
      },
      {
        "category":">200 mm",
        "num": d.data.total_wd !== 0 ? (d.data.wd4/d.data.total_wd)*100 : 0,
        "date": d.data.date
      }]);

      return st_point_data.get(d.data.name);
   }

var SELECTED_EXP_ID = null;
var expedition_data = new Map();

const diameter = 250;
var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

function highlight(map, exp_id) {
  if(exp_id === SELECTED_EXP_ID) {
    return;
  }

  SELECTED_EXP_ID = exp_id;
  let paths = map.select("path#" + SELECTED_EXP_ID)
     .style("stroke", "white")
     .style("stroke-width","2");

  const N = expedition_data.get(exp_id).length;
  for(var i = 0; i < N; ++i) {
    map.select("circle#ex_point_" + i+"_" + SELECTED_EXP_ID)
       .style("stroke-width","2");
     }
  }

  function cancel_highlight(map) {
    if(SELECTED_EXP_ID == null) {
      return;
    }

    map.selectAll("path#" + SELECTED_EXP_ID)
       .style("stroke", "yellow").style("stroke-width", "1.5");

    const N = expedition_data.get(SELECTED_EXP_ID).length;
    for(var i = 0; i < N; ++i) {
      map.select("circle#ex_point_" + i +"_" + SELECTED_EXP_ID)
         .style("stroke-width","1");
    }

    SELECTED_EXP_ID = null;
  }

  function create_oceans(results) {
    let data_list = [];
    for (var [key, e_data_list] of results) {
      data_list.push(new Ocean(key, e_data_list));
    }
    return data_list;
  }

  function calc_positions(results) {
    let positions = [];
    for (var [key, e_data_list] of results) {

      const ex_positions = e_data_list.map(data => compute_ex_position(data));

      let x_pos = 0, y_pos = 0;
      for(var i_pos in ex_positions) {
        x_pos += ex_positions[i_pos][0];
        y_pos += ex_positions[i_pos][1];
      }

      //empirical position adjustment
      if(key === "atlantic") {
        y_pos -= 500;
        x_pos -= 550;
      }

      if(key === "indian") {
        y_pos -= 1000;
        x_pos -= 4500;
      }

      if(key === "pacific") {
        y_pos += 500;
        x_pos -= 5000;
      }

      if(key === "mediterranean") {
        y_pos += 220;
        x_pos += 200;
      }

      positions.push([x_pos/ex_positions.length, y_pos/ex_positions.length]);
    }
    return positions;
  }
