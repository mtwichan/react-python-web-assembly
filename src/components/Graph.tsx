import { useState, useEffect, useRef } from "react";
import MyWorker from "../workers/myWorkerPython?worker"; // Use worker-loader for the Web Worker
import Plot from "react-plotly.js";

type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; data: string }
  | { type: "error"; error: string };

const PlotlyGraph = ({ graphData }: { graphData: unknown }) => {
  // Parse the JSON string if it hasn't been parsed already
  const plotData =
    typeof graphData === "string" ? JSON.parse(graphData) : graphData;

  return (
    <Plot
      data={plotData.data}
      layout={plotData.layout}      
    />
  );
};

export const Graph = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the worker
    const worker = new MyWorker();

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === "ready") {
        setIsReady(true);
      } else if (event.data.type === "result") {
        setResult(event.data.data);
      } else if (event.data.type === "error") {
        console.error("Worker error:", event.data.error);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const executePythonScript = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "executeScript",
        scriptUrl: "/python/script.py",
        variables: { data: { A: [1, 2, 3], B: [4, 5, 6] } },
      });
    }
  };

  return (
    <div>
      <h1>Pyodide with External Python Script</h1>
      <button onClick={executePythonScript} disabled={!isReady}>
        {isReady ? "Run Python Script" : "Loading Pyodide..."}
      </button>
      {result && (
        <div>
          <h2>Result:</h2>
          <pre>{result}</pre>
          <PlotlyGraph graphData={result} />
        </div>
      )}
    </div>
  );
};
