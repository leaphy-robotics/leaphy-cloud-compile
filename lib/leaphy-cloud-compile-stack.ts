import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import { DockerImageCode } from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/aws-cloudwatch/node_modules/@aws-cdk/core';

export class LeaphyCloudCompileStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'LeaphyCloudCompileWorkBucket', {
      versioned: false
    });

    new lambda.DockerImageFunction(this, 'CompileFunction', {
      code: DockerImageCode.fromImageAsset(path.join(__dirname, '..', 'src', 'compile-lambda')),
      timeout: Duration.seconds(30),
    });
  }
}
