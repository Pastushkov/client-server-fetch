import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { cn } from './cn';
import { API_HOST } from './environmentVars';

interface Result {
  index: number;
  type: 'success' | 'failed';
}

const App = () => {
  const [concurrency, setConcurrency] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const resultsEndRef = useRef<HTMLDivElement | null>(null);
  const [successfulRequests, setSuccessfulRequests] = useState(0);
  const [failedRequests, setFailedRequests] = useState(0);

  const handleStart = () => {
    if (concurrency < 1 || concurrency > 100) {
      alert('Concurrency must be between 1 and 100');
      return;
    }
    setSuccessfulRequests(0);
    setFailedRequests(0);
    setIsRunning(true);
    setResults([]);
    sendRequests();
  };

  const sendRequests = async () => {
    const totalRequests = 1000;
    const delay = 1000 / concurrency;
    let activeRequests = 0;
    let requestIndex = 1;

    const sendRequest = async (index: number) => {
      try {
        const { data } = await axios.get(`${API_HOST}?index=${index}`);
        setResults((prev) => [...prev, { index: data.index, type: 'success' }]);
        setSuccessfulRequests((prev) => prev + 1);
      } catch (error) {
        setResults((prev) => [...prev, { index, type: 'failed' }]);
        setFailedRequests((prev) => prev + 1);
      } finally {
        activeRequests--;
        sendNext();
      }
    };

    const sendNext = () => {
      if (requestIndex > totalRequests || activeRequests >= concurrency) return;
      activeRequests++;
      sendRequest(requestIndex);
      requestIndex++;
    };

    const intervalId = setInterval(() => {
      if (requestIndex > totalRequests) {
        clearInterval(intervalId);
        setIsRunning(false);
      } else {
        sendNext();
      }
    }, delay);
  };

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-200 p-4">
      <h1 className="mb-6 text-3xl font-semibold ">Client-Server Data Fetch</h1>
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex w-full flex-col">
          <label htmlFor="concurrency" className="text-lg">
            Enter concurrency
          </label>
          <input
            id="concurrency"
            type="number"
            value={concurrency}
            onChange={(e) => setConcurrency(parseInt(e.target.value))}
            disabled={isRunning}
            min={1}
            max={100}
            required
            className="rounded-md border border-gray-300 p-2 duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter concurrency limit (1-100)"
          />
        </div>
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={cn(
            'w-full rounded-md bg-indigo-400 px-4 py-2 font-bold text-black duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-200 disabled:text-gray-400',
            {
              isRunning: 'cursor-not-allowed bg-gray-400',
            },
          )}
        >
          Start
        </button>
      </div>
      <div className="mb-2 mt-6">Results</div>
      <ul
        className={cn('scrollbar h-72 w-full max-w-md space-y-2 overflow-y-auto rounded-lg bg-white p-4 shadow-lg', {
          'flex items-center justify-center': results.length === 0,
        })}
      >
        {results.length === 0 && !isRunning && <div>Сlick the “Start” button to run queries</div>}
        {results.map(({ index, type }, idx) => (
          <li key={idx} className="rounded-md bg-gray-100 p-2 text-center text-gray-700 shadow-sm">
            Request #{index} {type}
          </li>
        ))}
        <div ref={resultsEndRef} />
      </ul>
      <div className="mt-4 flex w-full max-w-md justify-between">
        <div>Successful requests: {successfulRequests}</div>
        <div>Failed requests: {failedRequests}</div>
      </div>
    </div>
  );
};

export default App;
