"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@serverless/core");
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var helpers_1 = require("./helpers");
var join = path_1.default.join;
var DefaultOption = {
    nextConfigDir: './'
};
var NextjsComponent = /** @class */ (function (_super) {
    __extends(NextjsComponent, _super);
    function NextjsComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NextjsComponent.prototype.default = function (inputs) {
        if (inputs === void 0) { inputs = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _inputs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _inputs = __assign(__assign({}, DefaultOption), inputs);
                        return [4 /*yield*/, this.build(_inputs)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.deploy(_inputs)];
                }
            });
        });
    };
    NextjsComponent.prototype.readPagesManifest = function (nextConfigPath) {
        return __awaiter(this, void 0, void 0, function () {
            var pagePath, hasServerlessPageManifest, pagesManifest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pagePath = join(nextConfigPath, '.next/serverless/pages-manifest.json');
                        hasServerlessPageManifest = fs_extra_1.default.existsSync(pagePath);
                        if (!hasServerlessPageManifest) {
                            return [2 /*return*/, Promise.reject("pages-manifest not found. Check if `next.config.js` target is set to 'serverless'")];
                        }
                        return [4 /*yield*/, fs_extra_1.default.readJSON(pagePath)];
                    case 1:
                        pagesManifest = _a.sent();
                        return [2 /*return*/, pagesManifest];
                }
            });
        });
    };
    NextjsComponent.prototype.prepareBuildManifests = function (inputs) {
        return __awaiter(this, void 0, void 0, function () {
            var nextConfigPath, pagesManifest, defaultBuildManifest, ssrPages, htmlPages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextConfigPath = inputs.nextConfigDir
                            ? path_1.default.resolve(inputs.nextConfigDir)
                            : process.cwd();
                        return [4 /*yield*/, this.readPagesManifest(nextConfigPath)];
                    case 1:
                        pagesManifest = _a.sent();
                        defaultBuildManifest = {
                            pages: {
                                ssr: {
                                    dynamic: {},
                                    nonDynamic: {}
                                },
                                html: {
                                    dynamic: {},
                                    nonDynamic: {}
                                }
                            },
                            publicFiles: {},
                            cloudFrontOrigins: {}
                        };
                        ssrPages = defaultBuildManifest.pages.ssr;
                        htmlPages = defaultBuildManifest.pages.html;
                        Object.keys(pagesManifest).forEach(function (route) {
                            var pageFile = pagesManifest[route];
                            var dynamicRoute = helpers_1.isDynamicRoute(route);
                            var expressRoute = dynamicRoute ? helpers_1.expressifyDynamicRoute(route) : '';
                            if (helpers_1.isHtmlPage(pageFile)) {
                                if (dynamicRoute) {
                                    htmlPages.dynamic[expressRoute] = {
                                        file: pageFile,
                                        regex: helpers_1.pathToRegexStr(expressRoute)
                                    };
                                }
                                else {
                                    htmlPages.nonDynamic[route] = pageFile;
                                }
                            }
                            else {
                                if (dynamicRoute) {
                                    ssrPages.dynamic[expressRoute] = {
                                        file: pageFile,
                                        regex: helpers_1.pathToRegexStr(expressRoute)
                                    };
                                }
                                else {
                                    ssrPages.nonDynamic[route] = pageFile;
                                }
                            }
                        });
                        return [4 /*yield*/, this.buildHandler(nextConfigPath, defaultBuildManifest)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, defaultBuildManifest];
                }
            });
        });
    };
    NextjsComponent.prototype.buildHandler = function (nextConfigPath, defaultBuildManifest) {
        return __awaiter(this, void 0, void 0, function () {
            var manifestJson, entryHandler, utilHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manifestJson = join(nextConfigPath, '.next/serverless/manifest.json');
                        entryHandler = join(nextConfigPath, '.next/serverless/index.js');
                        utilHandler = join(nextConfigPath, '.next/serverless/utils.js');
                        return [4 /*yield*/, Promise.all([
                                fs_extra_1.default.writeJson(manifestJson, defaultBuildManifest),
                                fs_extra_1.default.copy('template/default-scf-handler.js', entryHandler),
                                fs_extra_1.default.copy('template/utils.js', utilHandler)
                            ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    NextjsComponent.prototype.build = function (inputs) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultBuildManifest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prepareBuildManifests(inputs)];
                    case 1:
                        defaultBuildManifest = _a.sent();
                        console.log(JSON.stringify(defaultBuildManifest));
                        return [2 /*return*/];
                }
            });
        });
    };
    NextjsComponent.prototype.deploy = function (inputs) {
        return __awaiter(this, void 0, void 0, function () {
            var tencentCloudFunction, tencentApiGateway, tencentCloudFunctionOutputs, apigwParam, tencentApiGatewayOutputs, outputs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inputs.exclude = ['.git/**', '.gitignore', '.serverless', '.DS_Store'];
                        inputs.runtime = 'Nodejs8.9';
                        inputs.name = inputs.name || 'SsrComponent_' + helpers_1.randomName();
                        inputs.codeUri = join(process.cwd(), inputs.nextConfigDir, '.next/serverless');
                        return [4 /*yield*/, this.load('@serverless/tencent-scf')];
                    case 1:
                        tencentCloudFunction = _a.sent();
                        return [4 /*yield*/, this.load('@serverless/tencent-apigateway')];
                    case 2:
                        tencentApiGateway = _a.sent();
                        if (inputs.functionConf) {
                            inputs.timeout = inputs.functionConf.timeout
                                ? inputs.functionConf.timeout
                                : 3;
                            inputs.memorySize = inputs.functionConf.memorySize
                                ? inputs.functionConf.memorySize
                                : 128;
                            if (inputs.functionConf.environment) {
                                inputs.environment = inputs.functionConf.environment;
                            }
                            if (inputs.functionConf.vpcConfig) {
                                inputs.vpcConfig = inputs.functionConf.vpcConfig;
                            }
                        }
                        console.log(inputs);
                        return [4 /*yield*/, tencentCloudFunction(inputs)];
                    case 3:
                        tencentCloudFunctionOutputs = _a.sent();
                        console.log(3333333333333);
                        apigwParam = {
                            serviceName: inputs.serviceName,
                            description: 'Serverless Framework tencent-express Component',
                            serviceId: inputs.serviceId,
                            region: inputs.region,
                            protocols: inputs.apigatewayConf && inputs.apigatewayConf.protocols
                                ? inputs.apigatewayConf.protocols
                                : ['http'],
                            environment: inputs.apigatewayConf && inputs.apigatewayConf.environment
                                ? inputs.apigatewayConf.environment
                                : 'release',
                            endpoints: [
                                {
                                    path: '/',
                                    method: 'ANY',
                                    function: {
                                        isIntegratedResponse: true,
                                        functionName: tencentCloudFunctionOutputs.Name
                                    }
                                }
                            ]
                        };
                        return [4 /*yield*/, tencentApiGateway(apigwParam)];
                    case 4:
                        tencentApiGatewayOutputs = _a.sent();
                        outputs = {
                            region: inputs.region || 'ap-guangzhou',
                            functionName: inputs.name,
                            apiGatewayServiceId: tencentApiGatewayOutputs.serviceId,
                            url: this.getDefaultProtocol(tencentApiGatewayOutputs.protocols) + "://" + tencentApiGatewayOutputs.subDomain + "/" + tencentApiGatewayOutputs.environment + "/"
                        };
                        return [2 /*return*/, outputs];
                }
            });
        });
    };
    NextjsComponent.prototype.getDefaultProtocol = function (protocols) {
        return protocols;
    };
    return NextjsComponent;
}(core_1.Component));
// new NextjsComponent().build({
//   name: 'webh5',
//   handler: 'index.main_handler',
//   nextConfigDir: 'test/fixtures/app-with-custom-domain'
// });
// new NextjsComponent().deploy({
//   name: 'mySsr',
//   handler: 'index.main_handler',
//   runtime: 'Nodejs8.9',
//   codeUri: './code',
//   nextConfigDir: 'example',
//   region: 'ap-shanghai'
// });
exports.default = NextjsComponent;
