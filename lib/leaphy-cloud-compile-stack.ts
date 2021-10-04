import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';

import {CorsHttpMethod, HttpApi, HttpMethod} from '@aws-cdk/aws-apigatewayv2';
import {LambdaProxyIntegration} from '@aws-cdk/aws-apigatewayv2-integrations';

import { DockerImageCode } from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/core';


export class LeaphyCloudCompileStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'LeaphyCloudCompileWorkBucket', {
      versioned: false
    });

    const handler = new lambda.DockerImageFunction(this, 'CompileFunction', {
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '..', 'src', 'compile-lambda')),
      timeout: Duration.seconds(30)
    });

    bucket.grantReadWrite(handler);
    bucket.grantPut(handler);
    bucket.grantPutAcl(handler);
    
    const api = new HttpApi(this, "compile-api", {
      apiName: "compile-service",
      description: "This service compiles sketches.",
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowOrigins: ['*']
      }
    });

    api.addRoutes({
      path: '/',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: handler
      })
    })
  }
}
