import { Component } from '@serverless/core';
export interface InputOptionType {
    exclude: string[];
    runtime: string;
    name: string;
    codeUri: string;
    code: string;
    timeout: number;
    memorySize: number;
    environment: string;
    vpcConfig: string;
    functionConf: {
        timeout: number;
        memorySize: number;
        environment: string;
        vpcConfig: string;
    };
    serviceName: string;
    serviceId: string;
    region: string;
    apigatewayConf?: {
        protocols: string;
        environment: string;
    };
}
export interface InputType extends Partial<InputOptionType> {
    nextConfigDir: string;
}
export interface InputDefaultType extends Partial<InputOptionType> {
    nextConfigDir?: string;
}
export interface Manifest {
    pages: {
        ssr: {
            dynamic: {
                [key: string]: {
                    file: string;
                    regex: string;
                };
            };
            nonDynamic: {
                [key: string]: string;
            };
        };
        html: {
            dynamic: {
                [key: string]: {
                    file: string;
                    regex: string;
                };
            };
            nonDynamic: {
                [key: string]: string;
            };
        };
    };
    publicFiles: any;
    cloudFrontOrigins: any;
}
declare class NextjsComponent extends Component {
    default(inputs?: InputDefaultType): Promise<{
        region: string;
        functionName: string;
        apiGatewayServiceId: any;
        url: string;
    }>;
    readPagesManifest(nextConfigPath: string): Promise<any>;
    prepareBuildManifests(inputs: InputType): Promise<Manifest>;
    buildHandler(nextConfigPath: string, defaultBuildManifest: Manifest): Promise<[void, void, void]>;
    build(inputs: InputType): Promise<void>;
    deploy(inputs: InputType): Promise<{
        region: string;
        functionName: string;
        apiGatewayServiceId: any;
        url: string;
    }>;
    getDefaultProtocol(protocols: string): string;
}
export default NextjsComponent;
