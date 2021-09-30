const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const fsPromises = fs.promises;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

exports.handler = async function (event, context) {

    console.log(event);
    const sketch = event.body.sketch;
    if(!sketch){
        console.log('No Sketch in body!');
        return {
            'statusCode': 400
        }
    }
    const timestamp = Date.now();
    const basePath = `/tmp/${timestamp}/sketch`;
    const sketchPath = `${basePath}/sketch.ino`;
    const outPath = `${basePath}/out`;
    const hexPath = `${outPath}/sketch.ino.with_bootloader.hex`;

    await fsPromises.mkdir(basePath, { recursive: true });
    await fsPromises.writeFile(sketchPath, sketch);

    try {
        const { stdout, stderr } = await exec(`$PWD/bin/arduino-cli compile -b arduino:avr:uno --build-path ${outPath} ${basePath}`);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    }
    catch (err) {
        console.error(`Something went wrong during compilation: ${err}`);
    }

    const file = await fsPromises.readFile(hexPath);
    const bucket = 'leaphycloudcompilestack-leaphycloudcompileworkbuc-ppf9v1okfrl8';
    const key = `compiled/${timestamp}/sketch.hex`;

    const client = new S3Client({ region: 'eu-west-1' });
    const params = {
        ACL: 'public-read',
        Body: file,
        Bucket: bucket,
        Key: key
    }
    const command = new PutObjectCommand(params);
    await client.send(command);

    return {
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Request-Headers": "content-type"
        },
        'statusCode': 200,
        'body': { binaryLocation: `https://${bucket}.s3.eu-west-1.amazonaws.com/${key}` }

    }
}