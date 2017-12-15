function generate_files(N, file_path_template) {
  const map_ocean = { '0': 'atlantic', '1': 'atlantic',
                  '2': 'atlantic', '3': 'pacific',
                  '4': 'pacific', '5': 'pacific',
                  '6': 'indian', '7': 'mediterranean',
                  '8': 'indian', '9': 'pacific',
                  '10': 'atlantic', '11': 'indian',
                  '12': 'indian', '13': 'indian',
                  '14': 'indian', '15': 'indian',
                  '16': 'indian', '17': 'mediterranean',
                  '18': 'atlantic', '19': 'indian',
                  '20': 'indian', '21': 'atlantic',
                  '22': 'pacific', '23': 'pacific',
                  '24': 'pacific', '25': 'pacific',
                  '26': 'pacific', '27': 'pacific',
                  '28': 'pacific', '29': 'pacific'
  };

  var files = new Map();
  for(let i of [...Array(N).keys()]) {
    const ocean = map_ocean[i];
    if(!files[ocean]) {
      files[ocean] = [];
    }

    files[ocean].push(file_path_template + i + ".csv");
  }
  return files;
}

var expeditions = {
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
