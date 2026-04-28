/**
 * Minimal Server-Sent Events parser for the WHATWG fetch Response.body stream.
 * Supports `event:` and `data:` fields (with multi-line `data:` coalescing)
 * and dispatches whenever a blank line is seen, matching the SSE spec.
 */

export interface SseEvent {
  /** Value of the last `event:` field for this message, if any */
  event?: string;
  /** Concatenated `data:` lines (joined by \n) */
  data: string;
  /** Optional id, if sent */
  id?: string;
}

/**
 * Parses a ReadableStream of SSE bytes into discrete events.
 * The parser treats either "\n\n" or "\r\n\r\n" as an event boundary.
 * @param stream - Raw byte stream from a fetch Response.body.
 * @returns An async iterable of {@link SseEvent}s.
 */
export async function* parseSseStream(stream: ReadableStream<Uint8Array>): AsyncIterable<SseEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.length > 0) {
          const event = parseEventBlock(buffer);
          if (event) yield event;
        }
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary = findBoundary(buffer);
      while (boundary !== -1) {
        const rawBlock = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);
        const event = parseEventBlock(rawBlock);
        if (event) yield event;
        boundary = findBoundary(buffer);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

interface Boundary {
  index: number;
  length: number;
}

function findBoundary(buffer: string): Boundary | -1 {
  const rnBoundary = buffer.indexOf('\r\n\r\n');
  const nBoundary = buffer.indexOf('\n\n');
  if (rnBoundary === -1 && nBoundary === -1) return -1;
  if (rnBoundary === -1) return { index: nBoundary, length: 2 };
  if (nBoundary === -1) return { index: rnBoundary, length: 4 };
  return rnBoundary < nBoundary
    ? { index: rnBoundary, length: 4 }
    : { index: nBoundary, length: 2 };
}

function parseEventBlock(block: string): SseEvent | null {
  const lines = block.split(/\r?\n/);
  let eventName: string | undefined;
  let id: string | undefined;
  const dataParts: string[] = [];

  for (const line of lines) {
    if (line === '' || line.startsWith(':')) continue;

    const colonIdx = line.indexOf(':');
    const field = colonIdx === -1 ? line : line.slice(0, colonIdx);
    let value = colonIdx === -1 ? '' : line.slice(colonIdx + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    switch (field) {
      case 'event':
        eventName = value;
        break;
      case 'data':
        dataParts.push(value);
        break;
      case 'id':
        id = value;
        break;
      default:
        break;
    }
  }

  if (dataParts.length === 0 && eventName === undefined && id === undefined) {
    return null;
  }

  return { event: eventName, data: dataParts.join('\n'), id };
}
