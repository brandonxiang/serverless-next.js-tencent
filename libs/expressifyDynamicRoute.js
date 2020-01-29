module.exports = dynamicRoute => {
  return dynamicRoute.replace(/\[(?<param>.*?)]/g, ':$<param>');
};
