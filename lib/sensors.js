/**
 * Telemetry sensors, by asset category
 *
 * Sensors have properties mapped to the HighCharts API:
 * http://api.highcharts.com/highcharts#plotOptions.areaspline
 * http://api.highcharts.com/highcharts#plotOptions.spline
 */

module.exports = {
  js: {
    size: {
      name: "Size",
      yAxis: 0,
      type: "areaspline",
      fillOpacity: 0.1
    },
    gzippedSize: {
      name: "Size (gzipped)",
      yAxis: 0,
      type: "areaspline",
      fillOpacity: 0.1
    }
  },

  css: {
    size: {
      name: "Size",
      yAxis: 0,
      type: "areaspline",
      fillOpacity: 0.1
    },
    gzippedSize: {
      name: "Size (gzipped)",
      yAxis: 0,
      type: "areaspline",
      fillOpacity: 0.1
    },
    dataUriSize: {
      name: "Data URI Size",
      yAxis: 0,
      type: "areaspline",
      fillOpacity: 0.1
    },
    rules: {
      name: "Rules",
      yAxis: 1,
      type: "spline"
    },
    selectors: {
      name: "Selectors",
      yAxis: 1,
      type: "spline"
    }
  }
};
