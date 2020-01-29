"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pathToRegexp = require('path-to-regexp');
exports.expressifyDynamicRoute = function (dynamicRoute) {
    return dynamicRoute.replace(/\[(?<param>.*?)]/g, ':$<param>');
};
exports.isDynamicRoute = function (route) {
    // Identify /[param]/ in route string
    return /\/\[[^\/]+?\](?=\/|$)/.test(route);
};
exports.pathToRegexStr = function (path) {
    return pathToRegexp(path)
        .toString()
        .replace(/\/(.*)\/\i/, '$1');
};
exports.isHtmlPage = function (p) { return p.endsWith('.html'); };
exports.randomName = function () {
    var len = 6;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var result = '';
    for (var i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
};
