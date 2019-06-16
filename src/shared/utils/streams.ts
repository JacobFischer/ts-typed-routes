
export const streamEnd = async (stream: NodeJS.ReadableStream) => (
    new Promise((resolve) => stream.once("end", resolve))
);
