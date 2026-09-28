/**
 * Turns the transformers.js progress_callback reports into the model download progress ({ loadedBytes }).
 */

// transformers.js reports each model file separately; the sum of their loaded bytes only grows,
// so it is reported once per megabyte instead of a percentage that jumps back when a new file starts.
export function createDownloadReporter(onProgress) {
  if (!onProgress) return undefined;
  const loadedByFile = new Map();
  let reportedMb = -1;
  return (report) => {
    if (report?.status !== 'progress' || !report.file) return;
    loadedByFile.set(report.file, Number(report.loaded) || 0);
    const loadedBytes = [...loadedByFile.values()].reduce((sum, bytes) => sum + bytes, 0);
    const loadedMb = Math.floor(loadedBytes / 1e6);
    if (loadedMb === reportedMb) return;
    reportedMb = loadedMb;
    onProgress({ loadedBytes });
  };
}
