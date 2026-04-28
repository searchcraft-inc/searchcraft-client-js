/**
 * Client version metadata.
 *
 * Keep {@link CLIENT_VERSION} in sync with the `version` field in package.json.
 */

export const CLIENT_VERSION = '0.2.0';

/**
 * Returns true when running in a Node.js-like environment where
 * custom `User-Agent` headers are permitted. Browsers treat `User-Agent`
 * as a forbidden header and silently drop it, so we only set it when
 * running on the server.
 */
export const isNodeRuntime = (): boolean => {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    typeof process.versions.node === 'string'
  );
};

/**
 * The User-Agent value sent by the client on server-side requests.
 */
export const CLIENT_USER_AGENT = `searchcraft-client-js/${CLIENT_VERSION} (node)`;
