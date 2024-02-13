# How to deploy Minecarft Bedrock Server on AWS (with UI to control)

### Intialization

1. Create an EC2 instance.
2. Most important part would be select `Machine Image`. For this project I selected Ubuntu 22.04 LTS - 64bit (x86).
3. Instance type - t2.micro. As it was sufficient for upto 4 players. (Select as per your own need)
4. Create a key pair and save it. We will be using this to login via terminal as well as to access minecraft server from node server.
5. Configure storage - 8GiB (Select as per your own need)
6. Launch the instance.

Wait for few minutes to load and start the instance.

### Setting up basics.

1. Open instance screen and select connect.
2. Select SSH client. (recommended - use bash from here on.)
3. Download Minecraft Bedrock Server for Ubuntu.
4. Recommended to move Server file and EC2 instance key pair file in a folder "Minecraft" on Desktop.
5. Open terminal and cd in the folder.
6. Run command `chmod 400 "your-key-name.pem"`
7. Connect to your instance by using command `ssh -i "your-key-name.pem" ubuntu@ec2-instanceIP.instanceLocation.compute.amazonaws.com`. You will find this command on Connect - SSH client page of your EC2 instance.
8. Run `sudo apt update && sudo apt upgrade -y` to update your Ubuntu.
9. Install unzip and other packages `sudo apt install unzip curl wget -y`.
10. Run `mkdir minecraft` to create a new folder.

### Getting a Elastic IP.

We need to get a elastic IP so that the ip of the instance won't change when you restart it. It will be useful because same IP will be your Minecraft server IP.

1. In Network & Security > Elastic IPs.
2. Allocate Elastic IP address.
3. Create and then Associate this Elastic IP address to your instance in Actions section.

(Note: If you create and don't use an Elastic IP then a small hourly charged will be charged.)

### Setting up Minecraft Server.

1. If you don't have a previous world skip this first step. Unzip the downloaded minecraft server zip and create a worlds folder and move your world to it. And also change the level-name to your world name in server.properties file and zip back the server folder.
2. To upload your zipped server file to ubuntu open a new terminal and cd into your "Minecraft" folder on desktop.
3. Run command `scp -i "your-key-name.pem" server_file_name.zip ubuntu@ec2-instanceIP.instanceLocation.compute.amazonaws.com:/ubuntu/minecraft` (here ubuntu is the username folder and minecraft is the folder that you created in setting up basics step.) and after finishing the upload you can close this terminal and got back to the first ternimal opened and connected with ssh.
4. Run command `cd minecraft` and then `ls` and verify that the file server_file_name.zip is present in it.
5. To extract the file use unzip package `unzip server_file_name.zip -d .`. Make sure all files are extracted in the minecraft folder using cmd `ls`.
6. Run cmd `sudo LD_LIBRARY_PATH=.` and then `./bedrock_server`. The server will create a new world if world is not present in worlds directory and will start the server. Use `stop` to stop it.

### Will update soon...
