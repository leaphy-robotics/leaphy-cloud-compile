# Compile Lambda
This is the lambda that compiles sketches using the Arduino CLI. It's in the form of a docker container.

## Building locally
`docker build -t compile . --progress=plain`

## Testing locally
Run the container like so:
`docker run -e "AWS_ACCESS_KEY_ID=XXX" -e "AWS_SECRET_ACCESS_KEY=YYY" -p 9000:8080  --name compiler compile:latest`

Then push an event:
`curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"sketch": "void setup() { } void loop() { }"}'`

This uses the [AWS Lambda Runtime Interface Emulator (RIE)](https://docs.aws.amazon.com/lambda/latest/dg/images-test.html)

## Stopping the process
The process can't be stopped using CTRL-C. You have to do:
`docker stop compiler && docker rm compiler`

To test this from another application we need to use a local pass-through CORS proxy such as [this one](https://github.com/garmeeh/local-cors-proxy).

`lcp --proxyUrl http://localhost:9000` 

Then simply replace the proxied part of your url with: http://localhost:8010/proxy

This is to prevent this error:

>No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disable

## Pushing to AWS ECR and Deploying
This lambda is part of the leaphy-cloud-compile AWS CloudFormation stack, managed by CDK. To deploy this lambda, deploy the stack. 
Doing this will also push the image to ECR. 