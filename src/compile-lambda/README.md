# Compile Lambda
This is the lambda that compiles sketches using the Arduino CLI. It's in the form of a docker container.

## Building locally
`docker run compile -it`

## Testing locally
Run the container like so:
`docker run -p 9000:8080  compile:latest`

Then push an event:
`curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'`

This uses the [AWS Lambda Runtime Interface Emulator (RIE)](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html)

## Pushing to AWS ECR and Deploying
This lambda is part of the leaphy-cloud-compile AWS CloudFormation stack, managed by CDK. To deploy this lambda, deploy the stack. 
Doing this will also push the image to ECR. 