import { describe, expect, it } from 'vitest';
import { parseSseStream } from '../../src/utils/sse';

function stringToStream(input: string | string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = Array.isArray(input) ? input : [input];
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function drain<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const v of iter) out.push(v);
  return out;
}

describe('parseSseStream', () => {
  it('parses a single event with an event name and data', async () => {
    const stream = stringToStream('event: delta\ndata: hello\n\n');
    const events = await drain(parseSseStream(stream));
    expect(events).toEqual([{ event: 'delta', data: 'hello', id: undefined }]);
  });

  it('parses multiple events separated by blank lines', async () => {
    const stream = stringToStream(
      'event: metadata\ndata: {"results_count":2}\n\nevent: delta\ndata: "a"\n\nevent: done\ndata: {}\n\n'
    );
    const events = await drain(parseSseStream(stream));
    expect(events.map((e) => e.event)).toEqual(['metadata', 'delta', 'done']);
    expect(events[0].data).toBe('{"results_count":2}');
  });

  it('coalesces multiple data lines with \\n joins', async () => {
    const stream = stringToStream('event: msg\ndata: line1\ndata: line2\n\n');
    const events = await drain(parseSseStream(stream));
    expect(events).toEqual([{ event: 'msg', data: 'line1\nline2', id: undefined }]);
  });

  it('handles events split across chunk boundaries', async () => {
    const stream = stringToStream([
      'event: delta\nda',
      'ta: hel',
      'lo\n\nevent: done\ndata: {}\n\n',
    ]);
    const events = await drain(parseSseStream(stream));
    expect(events).toEqual([
      { event: 'delta', data: 'hello', id: undefined },
      { event: 'done', data: '{}', id: undefined },
    ]);
  });

  it('ignores comment lines starting with :', async () => {
    const stream = stringToStream(': keep-alive\nevent: delta\ndata: ok\n\n');
    const events = await drain(parseSseStream(stream));
    expect(events).toEqual([{ event: 'delta', data: 'ok', id: undefined }]);
  });

  it('supports CRLF line endings and blank-line boundaries', async () => {
    const stream = stringToStream('event: delta\r\ndata: ok\r\n\r\n');
    const events = await drain(parseSseStream(stream));
    expect(events).toEqual([{ event: 'delta', data: 'ok', id: undefined }]);
  });
});
