/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { Client } from "ssh2";
import {
  EC2Client,
  StartInstancesCommand,
  DescribeInstanceStatusCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const instanceId = process.env.AWS_INSTANCE_ID;
const instanceParams = {
  InstanceIds: [instanceId],
};

const startInstanceCmd = new StartInstancesCommand(instanceParams);
const describeInstanceStatusCmd = new DescribeInstanceStatusCommand(
  instanceParams
);
const stopInstanceCmd = new StopInstancesCommand(instanceParams);

const app = express();
const port = process.env.PORT || 3000;

app.use("/", express.static(process.cwd() + "/public"));
app.use(cors());

const privateKey = process.env.AWS_PRIVATE_KEY;
const instanceIP = process.env.AWS_INSTANCE_IP;

const startMinecraftServerScript = "start-minecraft-server";
const stopMinecraftServerScript = "stop-minecraft-server";

const conn = new Client();

// Check if the instance is running
const checkInstanceStatus = async (req, res) => {
  try {
    const status = await ec2Client.send(describeInstanceStatusCmd);
    console.log("Initial check", status);
    if (
      status &&
      status?.InstanceStatuses?.length > 0 &&
      status?.InstanceStatuses[0]?.InstanceState?.Name === "running"
    ) {
      return res.status(200).send("Server running");
    }
    res.status(400).send("Server not running");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

// Start Minecraft Server
const startInstance = async (req, res) => {
  try {
    // check if the instance is running
    const status = await ec2Client.send(describeInstanceStatusCmd);
    console.log("Initial check", status);
    if (
      status &&
      status?.InstanceStatuses?.length > 0 &&
      status?.InstanceStatuses[0]?.InstanceState?.Name === "running"
    ) {
      res.status(200).send("Server already running");
      return;
    }

    // start the instance
    await ec2Client.send(startInstanceCmd);
    console.log("Instance start initiated");

    // wait for the instance to start
    const checkInstanceStatus = new Promise((resolve, reject) => {
      let count = 0;

      const newInterval = setInterval(async () => {
        try {
          if (count === 10) {
            clearInterval(newInterval);
            reject("Instance did not start in time");
          }
          const status = await ec2Client.send(describeInstanceStatusCmd);
          if (
            status &&
            status?.InstanceStatuses?.length > 0 &&
            status?.InstanceStatuses[0]?.InstanceState?.Name === "running"
          ) {
            console.log("Instance started");
            clearInterval(newInterval);
            return resolve();
          }
          count++;
        } catch (error) {
          reject(error);
        }
      }, 3000);
    });

    await checkInstanceStatus;

    res.status(200).send("Instance started and server running");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

const startMinecraftServer = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      conn
        .on("error", (err) => {
          console.error(`Connection error: ${err.message}`);
          reject(err);
        })
        .on("ready", () => {
          console.log("SSH connection successful");

          conn.shell((err, stream) => {
            if (err) throw err;

            stream
              .on("data", function (data) {
                console.log("STDOUT: " + data);
                if (data?.includes("Server started")) {
                  conn.end();
                  resolve();
                }
              })
              .on("close", function () {
                console.log("Connection closed");
                conn.end();
                resolve();
              });

            stream.write(startMinecraftServerScript + "\n");
            stream.write("exit\n");
          });
        })
        .connect({
          host: instanceIP,
          port: 22,
          username: "ubuntu",
          privateKey: privateKey,
        });
    });

    res.status(200).send("Server started");
  } catch (error) {
    console.error(`Error in startMinecraftServer: ${error.message}`);
    res.status(500).send("Failed to start server");
  }
};

// Stop Minecraft Server
const stopMinecraftServer = async (req, res) => {
  try {
    // check if the instance is running
    const status = await ec2Client.send(describeInstanceStatusCmd);
    console.log("Initial check", status);
    if (
      status &&
      status?.InstanceStatuses?.length > 0 &&
      status?.InstanceStatuses[0]?.InstanceState?.Name !== "running"
    ) {
      res.status(200).send("Server already stopped");
      return;
    }

    // connect to the instance and stop the server
    await new Promise((resolve, reject) => {
      conn
        .on("error", (err) => {
          console.error(`Connection error: ${err.message}`);
          reject(err);
        })
        .on("ready", () => {
          console.log("SSH connection successful");

          conn.shell((err, stream) => {
            if (err) throw err;

            stream
              .on("data", function (data) {
                console.log("STDOUT: " + data);
                if (data?.includes("Server stopped")) {
                  conn.end();
                  resolve();
                }
              })
              .on("close", function () {
                console.log("Connection closed");
                conn.end();
                resolve();
              });

            stream.write(stopMinecraftServerScript + "\n");
            stream.write("exit\n");
          });
        })
        .connect({
          host: instanceIP,
          port: 22,
          username: "ubuntu",
          privateKey: privateKey,
        });
    });

    await ec2Client.send(stopInstanceCmd);
    console.log("Instance stop initiated");

    // wait for the instance to stop
    const checkInstanceStatus = new Promise((resolve) => {
      setTimeout(() => resolve(), 10000);
    });

    await checkInstanceStatus;

    res.status(200).send("Server stopped");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

// Express route to start EC2 instance and Bedrock server
app.post("/api/start", startInstance);

// Express route to check if the instance is running
app.get("/api/check", checkInstanceStatus);

// Express route to start Bedrock server
app.post("/api/start-server", startMinecraftServer);

// Express route to stop EC2 instance
app.post("/api/stop", stopMinecraftServer);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
