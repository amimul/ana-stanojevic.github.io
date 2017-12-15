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
}

function format_cdwd(str) {
  return str.replace(/\s/g, '').replace(/\,/g, '.');
}

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

function hovered(hover) {
  return function(d) {
    d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
  };
}
