var map = {
  projection : function(i_center, i_scale, i_translate) {
    return d3.geoEquirectangular()
             .center(i_center) // set centre to further North as we are cropping more off bottom of map
             .scale(i_scale) // scale to fit group width
             .translate(i_translate); // ensure centred in group
  },
  path : function(i_projection) {
    return d3.geoPath().projection(i_projection);
  }
};
