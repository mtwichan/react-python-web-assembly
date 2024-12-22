import { loadPyodide, PyodideInterface } from "pyodide";

type WorkerMessage = {
  type: "execute";
  code: string;
  scriptUrl: string;
  variables: { data: unknown };
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
  await pyodide.loadPackage(["numpy", "pandas", "micropip"]); // Preload commonly used packages
  await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('plotly')
`);
  postMessage({ type: "ready" } as WorkerResponse);
};

// Start initialization
initializePyodide();

onmessage = async (event: MessageEvent<WorkerMessage>) => {
  console.log("event (worker)", event);
  if (!pyodide) {
    postMessage({
      type: "error",
      error: "Pyodide is not initialized yet",
    } as WorkerResponse);
    return;
  }

  try {
    // if (event.type === "executeScript") {

    // }
    const { scriptUrl, variables } = event.data;

            // Set variables in Python global scope
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        pyodide.globals.set(key, value);
      });
    }
    console.log("scriptUrl (worker)", scriptUrl);
    console.log("variables (worker)", variables);
    const fullScriptUrl = scriptUrl;
    // Fetch the Python script content
    const response = await fetch(fullScriptUrl);
    console.log("response fetch (worker)", response);
    const pythonCode = await response.text();
    console.log("python code (worker)", pythonCode);
    const result = pyodide.runPython(pythonCode); // Execute the Python code
    console.log("result python code (worker)", result);
    postMessage({ type: "result", data: result } as WorkerResponse);
  } catch (error: unknown) {
    postMessage({
      type: "error",
      error: (error as Error).message,
    } as WorkerResponse);
  }
};
