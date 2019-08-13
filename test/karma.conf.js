module.exports = function( config ) {
  config.set( {
    basePath: "..",
    frameworks: [ "qunit" ],
    files: [
      { pattern: "./node_modules/jquery/dist/jquery.js" },
      { pattern: "jquery.mousewheel.js" },
      { pattern: "test/unit.js" }
    ],
    exclude: [],
    preprocessors: {},
    reporters: [ "progress" ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN, //LOG_INFO
    autoWatch: false,
    singleRun: true,
    browsers: [ "Chrome", "Firefox" ],
    concurrency: 5
  } );
};
