import * as path from 'path';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib'; 
import {aws_lambda as lambda} from 'aws-cdk-lib'; 
import { HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'

export class LeaphyCloudCompileStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'LeaphyCloudCompileWorkBucket', {
      versioned: false,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"]
        }
      ]
    });

    const handler = new lambda.DockerImageFunction(this, 'CompileFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..', 'src', 'compile-lambda')),
      timeout: Duration.seconds(90),
      memorySize: 4096
    });    

    bucket.grantReadWrite(handler);
    bucket.grantPut(handler);
    bucket.grantPutAcl(handler);
    
    const alias = new lambda.Alias(this, 'Alias', {
      aliasName: 'prod',
      version: handler.latestVersion,
    });
    
    // Create AutoScaling target
    const as = alias.addAutoScaling({ maxCapacity: 50 });
    
    // Configure Target Tracking
    as.scaleOnUtilization({
      utilizationTarget: 0.5,
    });

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
      integration: new HttpLambdaIntegration ("compileIntegration", handler)
    })
  }
}
