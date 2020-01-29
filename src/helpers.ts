const pathToRegexp = require('path-to-regexp');

export const expressifyDynamicRoute = (dynamicRoute: string) => {
  return dynamicRoute.replace(/\[(?<param>.*?)]/g, ':$<param>');
};

export const isDynamicRoute = (route: string) => {
  // Identify /[param]/ in route string
  return /\/\[[^\/]+?\](?=\/|$)/.test(route);
};

export const pathToRegexStr = (path: string) =>
  pathToRegexp(path)
    .toString()
    .replace(/\/(.*)\/\i/, '$1');

export const isHtmlPage = (p: string) => p.endsWith('.html');

export const randomName = () => {
  const len = 6;
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
};
