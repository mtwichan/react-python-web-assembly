import { loadPyodide, PyodideInterface } from "pyodide";

type WorkerMessage = {
  type: "execute";
  code: string;
};

type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; data: number[] }
  | { type: "error"; error: string };

let pyodide: PyodideInterface;

// Initialize Pyodide
const initializePyodide = async () => {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
  });
  await pyodide.loadPackage(["numpy", "pandas"]); // Preload commonly used packages
  postMessage({ type: "ready" } as WorkerResponse);
};

// Start initialization
initializePyodide();

onmessage = async (event: MessageEvent<WorkerMessage>) => {
  if (!pyodide) {
    postMessage({
      type: "error",
      error: "Pyodide is not initialized yet",
    } as WorkerResponse);
    return;
  }

  try {
    const { code } = event.data;
    const result = pyodide.runPython(code); // Execute the Python code
    postMessage({ type: "result", data: result } as WorkerResponse);
  } catch (error: unknown) {
    postMessage({
      type: "error",
      error: (error as Error).message,
    } as WorkerResponse);
  }
};
