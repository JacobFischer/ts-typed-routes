
export const streamEnd = async (stream: NodeJS.ReadableStream) => new Promise<unknown>((resolve) => stream.once("end", resolve));
