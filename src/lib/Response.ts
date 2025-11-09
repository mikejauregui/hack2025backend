const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};
export class ClientResponse extends Response {
  constructor(
    body: globalThis.BodyInit | null | undefined,
    init: globalThis.ResponseInit | undefined
  ) {
    // Merge CORS headers with any existing headers
    const headers = new Headers(init?.headers);

    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value);
    }

    super(body, { ...init, headers });
  }

  static json(data: any, init?: globalThis.ResponseInit): ClientResponse {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    return new ClientResponse(JSON.stringify(data), { ...init, headers });
  }
}
