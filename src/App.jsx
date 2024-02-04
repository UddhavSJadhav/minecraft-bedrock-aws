import { useState, useEffect } from "react";
import axios from "axios";

import { API_URL } from "./constants";

const App = () => {
  const [instanceActive, setInstanceActive] = useState(false);
  const [instanceLoading, setInstanceLoading] = useState(false);
  const [serverActive, setServerActive] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [stoppingInstance, setStoppingInstance] = useState(false);

  const fetchInstanceStatus = async () => {
    setInstanceLoading(true);
    try {
      await axios.get(`${API_URL}/check`);
      setInstanceActive(true);
      setServerActive(true);
    } catch (error) {
      setInstanceActive(false);
      setServerActive(false);
    } finally {
      setInstanceLoading(false);
    }
  };

  const startInstance = async () => {
    setInstanceLoading(true);
    try {
      await axios.post(`${API_URL}/start`);
      setInstanceActive(true);
    } catch (error) {
      console.error(error);
      setInstanceActive(false);
    } finally {
      setInstanceLoading(false);
    }
  };

  const startServer = async () => {
    setServerLoading(true);
    try {
      await axios.post(`${API_URL}/start-server`);
      setServerActive(true);
    } catch (error) {
      console.error(error);
      setServerActive(false);
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
    } catch (error) {
      console.error(error);
      setInstanceActive(true);
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

          <button
            className={`p-2 ${
              instanceActive ? "bg-red-500" : "bg-neutral-500"
            } rounded-lg disabled:opacity-50`}
            disabled={!instanceActive || stoppingInstance}
            onClick={stopInstance}
          >
            {stoppingInstance ? "Stopping Instance" : "Stop Instance"}
          </button>
        </div>
      </main>
    </>
  );
};

export default App;
