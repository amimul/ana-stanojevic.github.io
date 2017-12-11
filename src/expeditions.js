var expeditions = {
    csv : {
      generate_file_list : function(N, file_path_template) {
        return [...Array(N).keys()].map(i => file_path_template + i + ".csv");
      }
    }, //csv
    geometry : {
      line : d3.line().curve(d3.curveLinear)
               .x(function(d) {
                  long = parseFloat(d.Longitude.replace(',','.').replace(' ',''));
                  lat = parseFloat(d.Latitude.replace(',','.').replace(' ',''));
                  return projection([long, lat])[0];
               })
               .y(function(d) {
                  long = parseFloat(d.Longitude.replace(',','.').replace(' ',''));
                  lat = parseFloat(d.Latitude.replace(',','.').replace(' ',''));
                  return projection([long, lat])[1];
                })


    }//geometry
};
