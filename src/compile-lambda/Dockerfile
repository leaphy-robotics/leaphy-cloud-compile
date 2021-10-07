FROM public.ecr.aws/lambda/nodejs:14

# Install prerequisites for arduino-cli install script
RUN yum update -y 
RUN yum -y install tar
RUN yum -y install gzip

# Set HOME env var for Arduino CLI
ENV HOME=/var/task

# Install the Arduino CLI
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Create arduino cli config
RUN $PWD/bin/arduino-cli config init --dest-dir /var/task --overwrite
RUN $PWD/bin/arduino-cli config set directories.data /var/task/Arduino --config-file /var/task/arduino-cli.yaml
RUN $PWD/bin/arduino-cli config set directories.downloads /var/task/Arduino/staging --config-file /var/task/arduino-cli.yaml
RUN $PWD/bin/arduino-cli config set directories.user /var/task/sketch --config-file /var/task/arduino-cli.yaml
# Add additional urls to board manager, not needed for now
#RUN $PWD/bin/arduino-cli config add board_manager.additional_urls http://arduino.esp8266.com/stable/package_esp8266com_index.json --config-file /tmp/arduino-cli.yaml

# Update the Arduino CLI index
RUN $PWD/bin/arduino-cli core update-index --config-file /var/task/arduino-cli.yaml
RUN $PWD/bin/arduino-cli lib update-index --config-file /var/task/arduino-cli.yaml

# Install the cores
RUN $PWD/bin/arduino-cli core install arduino:avr --config-file /var/task/arduino-cli.yaml
#RUN $PWD/bin/arduino-cli core install esp8266:esp8266 --config-file /var/task/arduino-cli.yaml # Not needed for now

# Install the needed leaphy libraries
RUN $PWD/bin/arduino-cli lib install "Leaphy Original Extension" --config-file /var/task/arduino-cli.yaml
RUN $PWD/bin/arduino-cli lib install "Leaphy Extra Extension" --config-file /var/task/arduino-cli.yaml
RUN $PWD/bin/arduino-cli lib install "Servo" --config-file /var/task/arduino-cli.yaml

# Copy lambda handler source
COPY package.json package-lock.json /var/task/

# Install NPM dependencies for function
RUN npm install

COPY app.js /var/task/

# Set the CMD to the handler 
CMD [ "app.handler" ]  