import { useState, useEffect } from "react";
import axios from "axios";

import { API_URL } from "./constants";

const App = () => {
  const [instanceActive, setInstanceActive] = useState(false);
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [serverActive, setServerActive] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [stoppingInstance, setStoppingInstance] = useState(false);

  const [infoMessage, setInfoMessage] = useState("");

  const setInfoMessageWithTimeout = (message) => {
    setInfoMessage(message);
    setTimeout(() => {
      setInfoMessage("");
    }, 3000);
  };

  const fetchInstanceStatus = async () => {
    setInstanceLoading(true);
    try {
      const resp = await axios.get(`${API_URL}/check`);
      console.log(resp.data);
      setInstanceActive(resp?.data?.instanceStatus || false);
      setServerActive(resp?.data?.minecraftServerStatus || false);
      setInfoMessageWithTimeout("Initial status fetched successfully.");
    } catch (error) {
      setInstanceActive(false);
      setServerActive(false);
      setInfoMessageWithTimeout("Initial status fetch failed.");
    } finally {
      setInstanceLoading(false);
    }
  };

  const startInstance = async () => {
    setInstanceLoading(true);
    try {
      await axios.post(`${API_URL}/start`);
      setInstanceActive(true);
      setInfoMessageWithTimeout("Instance started successfully.");
    } catch (error) {
      console.error(error);
      setInstanceActive(false);
      setInfoMessageWithTimeout("Instance start failed.");
    } finally {
      setInstanceLoading(false);
    }
  };

  const startServer = async () => {
    setServerLoading(true);
    try {
      await axios.post(`${API_URL}/start-server`);
      setServerActive(true);
      setInfoMessageWithTimeout("Minecraft Server started successfully.");
    } catch (error) {
      console.error(error);
      setServerActive(false);
      setInfoMessageWithTimeout("Minecraft Server start failed.");
    } finally {
      setServerLoading(false);
    }
  };

  const stopServer = async () => {
    setServerLoading(true);
    try {
      await axios.post(`${API_URL}/stop-server`);
      setServerActive(false);
      setInfoMessageWithTimeout("Minecraft Server stopped successfully.");
    } catch (error) {
      console.error(error);
      setServerActive(true);
      setInfoMessageWithTimeout("Minecraft Server stop failed.");
    } finally {
      setServerLoading(false);
    }
  };

  const stopInstance = async () => {
    setStoppingInstance(true);
    try {
      await axios.post(`${API_URL}/stop`);
      setInstanceActive(false);
      setServerActive(false);
      setInfoMessageWithTimeout("Instance stopped successfully.");
    } catch (error) {
      console.error(error);
      setInstanceActive(true);
      setInfoMessageWithTimeout("Instance stop failed.");
    } finally {
      setStoppingInstance(false);
    }
  };

  useEffect(() => {
    fetchInstanceStatus();
  }, []);

  return (
    <>
      <header>
        <nav className="px-2 py-3 bg-blue-500 text-3xl font-bold text-white text-center">
          LazyCycoz Minecraft Server
        </nav>
      </header>
      <main className="px-1 py-3">
        <div className="flex flex-col gap-2 max-w-64 mx-auto text-white font-bold">
          {!instanceActive && (
            <button
              className={`p-2 ${
                instanceActive ? "bg-green-500" : "bg-neutral-500"
              } rounded-lg disabled:opacity-50`}
              disabled={instanceLoading || instanceActive}
              onClick={startInstance}
            >
              {instanceLoading
                ? "Processing..."
                : instanceActive
                ? "Instance Active"
                : "Start Instance"}
            </button>
          )}

          {instanceActive && !serverActive && (
            <button
              className={`p-2 ${
                serverActive ? "bg-green-500" : "bg-neutral-500"
              } rounded-lg disabled:opacity-50`}
              disabled={!instanceActive || serverLoading || serverActive}
              onClick={startServer}
            >
              {serverLoading
                ? "Starting Minecraft Server..."
                : serverActive
                ? "Minecraft Server Active"
                : "Start Minecraft Server"}
            </button>
          )}

          {instanceActive && serverActive && (
            <button
              className={`p-2 ${
                serverActive ? "bg-red-500" : "bg-neutral-500"
              } rounded-lg disabled:opacity-50`}
              disabled={serverLoading || !serverActive}
              onClick={stopServer}
            >
              {serverLoading
                ? "Stopping Minecraft Server..."
                : serverActive
                ? "Stop Minecraft Server"
                : "Minecraft Server Active"}
            </button>
          )}

          {instanceActive && (
            <button
              className={`p-2 ${
                instanceActive ? "bg-red-500" : "bg-neutral-500"
              } rounded-lg disabled:opacity-50`}
              disabled={true}
              onClick={stopInstance}
            >
              {stoppingInstance ? "Stopping Instance" : "Stop Instance"}
            </button>
          )}

          {infoMessage && (
            <div className="p-2 border border-solid border-yellow-600 rounded-lg text-center max-w-md mx-auto text-blue-600">
              {infoMessage}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default App;
