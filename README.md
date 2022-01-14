# leaphy-cloud-compile
Resources for running sketch compilation workloads in the cloud

## Prerequisites

To use this project you need the following:

- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured
- [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) installed globally: `npm install -g aws-cdk`
- The AWS account you are targetting should be [bootstrapped](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)

## CDK
This project uses CDK for defining AWS resources. 

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Useful CDK commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
