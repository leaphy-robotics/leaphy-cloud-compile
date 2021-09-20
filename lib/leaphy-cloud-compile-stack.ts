import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from "@aws-cdk/aws-apigateway";

import { DockerImageCode, IFunction } from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/aws-cloudwatch/node_modules/@aws-cdk/core';


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
    
    const api = new apigateway.RestApi(this, "compile-api", {
      restApiName: "Compile Service",
      description: "This service compiles sketches."
    });

    const postCompileIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", postCompileIntegration); // Should become POST
  }
}
