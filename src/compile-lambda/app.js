const util = require('util');
const exec = util.promisify(require('child_process').exec);
const execSync = require('child_process').execSync;
const fs = require('fs');
const fsPromises = fs.promises;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

console.log("Initializing");
execSync("$PWD/bin/arduino-cli config init --dest-dir /tmp --overwrite");
execSync("$PWD/bin/arduino-cli config set directories.data /tmp/Arduino --config-file /tmp/arduino-cli.yaml");
execSync("$PWD/bin/arduino-cli config set directories.downloads /tmp/Arduino/staging --config-file /tmp/arduino-cli.yaml");
execSync("$PWD/bin/arduino-cli config set directories.user /tmp/sketch --config-file /tmp/arduino-cli.yaml");

execSync("$PWD/bin/arduino-cli core update-index --config-file /tmp/arduino-cli.yaml");
execSync("$PWD/bin/arduino-cli lib update-index --config-file /tmp/arduino-cli.yaml");

execSync("$PWD/bin/arduino-cli core install arduino:avr --config-file /tmp/arduino-cli.yaml");

execSync('$PWD/bin/arduino-cli lib install "Leaphy Original Extension" --config-file /tmp/arduino-cli.yaml');
execSync('$PWD/bin/arduino-cli lib install "Leaphy Extra Extension" --config-file /tmp/arduino-cli.yaml');
execSync('$PWD/bin/arduino-cli lib install "Servo" --config-file /tmp/arduino-cli.yaml');

exports.handler = async function (event, context) {

    console.log(event);
    const sketch = JSON.parse(event.body).sketch;
    if (!sketch) {
        console.log('No Sketch in body!');
        return {
            'statusCode': 400
        }
    }
    const timestamp = Date.now();

    const basePath = `/tmp/sketch`;
    const sketchPath = `${basePath}/sketch.ino`;
    const outPath = `${basePath}/out`;
    const hexPath = `${outPath}/sketch.ino.hex`;

    console.log(await fsPromises.readdir('/tmp'));

    await fsPromises.mkdir(basePath, { recursive: true });
    await fsPromises.writeFile(sketchPath, sketch);

    console.log(await fsPromises.readdir('/tmp'));
    console.log(await fsPromises.readdir('/tmp/sketch'));

    try {
        const { stdout, stderr } = await exec(`$PWD/bin/arduino-cli compile -b arduino:avr:uno --output-dir ${outPath} --config-file /tmp/arduino-cli.yaml ${basePath}`);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    }
    catch (err) {
        console.error(`Something went wrong during compilation: ${err}`);
    }

    console.log(await fsPromises.readdir('/tmp'));
    console.log(await fsPromises.readdir('/tmp/sketch'));
    console.log(await fsPromises.readdir('/tmp/sketch/out'));

    const file = await fsPromises.readFile(hexPath);
    const bucket = 'leaphycloudcompilestack-leaphycloudcompileworkbuc-ilrdazq41crs';
    const key = `compiled/${timestamp}/sketch.hex`;

    const client = new S3Client({ region: 'eu-west-1' });
    const params = {
        ACL: 'public-read',
        Body: file,
        Bucket: bucket,
        Key: key
    }
    const command = new PutObjectCommand(params);

    try{
        await client.send(command);
    } catch (err){
        console.log(err);
    }

    const response = {
        // 'headers': {
        //     "Content-Type": "application/json",
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
        //     "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD"
        // },
        'statusCode': 200,
        'body': JSON.stringify({ binaryLocation: `https://${bucket}.s3.eu-west-1.amazonaws.com/${key}` })
    }
    return response;
}