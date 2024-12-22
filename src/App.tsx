import { useState, useEffect, useRef } from 'react'
import MyWorker from './workers/myWorker?worker'; // Use worker-loader for the Web Worker
import { WorkerResponse } from './workers/myWorker';
import { Graph } from './components/Graph';


const App: React.FC = () => {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      // Initialize the Web Worker
      const worker = new MyWorker();
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          console.log('Worker received message (app)(result):', event.data);
          const { type, data } = event.data;

          if (type === 'result') {
              setResult(data);
              setLoading(false);
          }
      };

      worker.onerror = (error) => {
          console.error('Worker Error:', error);
      };

      workerRef.current = worker;

      // Clean up the worker on unmount
      return () => {
          worker.terminate();
      };
  }, []);

  const handleProcessData = () => {
      if (workerRef.current) {
          setLoading(true);
          workerRef.current.postMessage({
              type: 'processData',
              data: result, // Example data
          });
          console.log('Worker result:', result);
      }
  };

  return (
      <div>
          <h1>Basic Worker</h1>
          <button onClick={handleProcessData} disabled={loading}>
              {loading ? 'Processing...' : 'Start Worker'}
          </button>
          {result && (
              <div>
                  <h2>Result:</h2>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
          )}
          <Graph />
      </div>
  );
};


export default App
