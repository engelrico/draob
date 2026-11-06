/** Version from the manifest ("" when not running as an extension, e.g. in tests). */
export const appVersion = () => globalThis.chrome?.runtime?.getManifest?.().version ?? '';
