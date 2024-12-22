export type WorkerRequest = {
    type: 'processData';
    data: number[];
};

export type WorkerResponse = {
    type: 'result';
    data: number[];
};

// Worker logic
onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { type, data } = event.data;

    console.log('Worker received message (result)(worker):', event.data);

    if (type === 'processData') {
        const result = data.map((num) => num * 2); // Example: Double each number
        const response: WorkerResponse = { type: 'result', data: result };
        postMessage(response); // Send result back to the main thread
    }
};
