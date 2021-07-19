# Compile Lambda
This is the lambda that compiles sketches using the Arduino CLI. It's in the form of a docker container

## Building
`docker run compile -it`

## Testing locally
`docker run -p 9000:8080  compile:latest`

This uses the [AWS Lambda Runtime Interface Emulator (RIE)](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html)

## Pushing to AWS ECR
TODO

## Deploying
This lambda is part of the leaphy-cloud-compile AWS CloudFormation stack, managed by CDK. To deploy this lambda, deploy the stack.