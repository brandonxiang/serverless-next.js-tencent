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
