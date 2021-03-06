const util = require('util');
const exec = util.promisify(require('child_process').exec);
const execSync = require('child_process').execSync;
const fs = require('fs');
const fsPromises = fs.promises;
const fse = require('fs-extra');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

console.log("Initializing");

// Creates a Arduino CLI config pointing to a place accessible by the lambda code
execSync("$PWD/bin/arduino-cli config init --dest-dir /tmp --overwrite");
execSync("$PWD/bin/arduino-cli config set directories.data /tmp/Arduino --config-file /tmp/arduino-cli.yaml");
execSync("$PWD/bin/arduino-cli config set directories.downloads /tmp/Arduino/staging --config-file /tmp/arduino-cli.yaml");
execSync("$PWD/bin/arduino-cli config set directories.user /tmp/sketch --config-file /tmp/arduino-cli.yaml");

exports.handler = async function (event, context) {

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

    if (!fs.existsSync(basePath)) {
        // Copies the preinstalled cores and libraries to where the Arduino CLI can use them
        console.log("Starting copy of files");

        const copyCores = fse.copy('/var/task/Arduino', '/tmp/Arduino', {
            filter: (src, dst) => {
                if(src === '/var/task/Arduino/packages'){
                    return false; // Don't copy the biggest dir, symlink instead
                }
                return true;
            } 
        });
        const copyLibs = fse.copy('/var/task/sketch', '/tmp/sketch');
        await Promise.all([copyCores, copyLibs]);

        fs.symlink('/var/task/Arduino/packages', '/tmp/Arduino/packages', (err) => {
            if(err){
                console.log(err);
                throw err;
            }
        });

        console.log("Finished copy of files");
    }

    await fsPromises.writeFile(sketchPath, sketch);

    try {
        const { stdout, stderr } = await exec(`$PWD/bin/arduino-cli compile -b arduino:avr:uno --output-dir ${outPath} --config-file /tmp/arduino-cli.yaml ${basePath}`);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    }
    catch (err) {
        console.error(`Something went wrong during compilation: ${err}`);
    }


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

    try {
        await client.send(command);
    } catch (err) {
        console.log(err);
    }

    const response = {
        'statusCode': 200,
        'body': JSON.stringify({ binaryLocation: `https://${bucket}.s3.eu-west-1.amazonaws.com/${key}` })
    }
    return response;
}