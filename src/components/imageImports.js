// imageImports.js
function importAllImages() {
  const folders = {};
  const processedFiles = new Map(); // Map to store file paths and their source folders
  const processedPaths = new Set(); // Set to track unique file paths

  // Helper function to normalize paths and filenames
  const normalizePath = (path) => {
    return path.toLowerCase()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/\/+/g, '/')
      .replace(/^img\s+/i, '')
      .replace(/^images\//i, '')
      .trim();
  };

  // Helper function to create image object
  const createImageObject = (src, name, isVideo) => ({
    src: src.default || src,
    caption: name.replace(/[-_]/g, ' '),
    isVideo
  });

  // First, process all subfolder images
  const subfolderContext = require.context('../Images', true, /^\.\/[^/]+\/.*\.(png|jpe?g|svg|mp4)$/i);
  subfolderContext.keys().forEach(item => {
    const normalizedPath = normalizePath(item);
    const parts = normalizedPath.split('/');
    const folder = parts[0];
    const filename = parts[parts.length - 1];
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    const src = subfolderContext(item);

    // Skip if we've already processed this path
    if (processedPaths.has(normalizedPath)) {
      console.log(`Skipping duplicate path: ${normalizedPath}`);
      return;
    }

    // Initialize folder if needed
    if (!folders[folder]) folders[folder] = [];

    // Store in processed files map
    processedFiles.set(normalizedPath, folder);
    processedPaths.add(normalizedPath);

    // Add to appropriate folder
    folders[folder].push(createImageObject(src, filename, isVideo));
  });

  // Then process root level images
  const rootContext = require.context('../Images', false, /\.(png|jpe?g|svg|mp4)$/i);
  rootContext.keys().forEach(item => {
    const normalizedPath = normalizePath(item);
    const filename = item.replace('./', '');
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    const src = rootContext(item);

    // Skip if this path exists in any subfolder
    if (processedPaths.has(normalizedPath)) {
      console.log(`Skipping root image that exists in subfolder: ${normalizedPath}`);
      return;
    }

    // Initialize Home folder if needed
    if (!folders['Home']) folders['Home'] = [];

    // Store in processed files map
    processedFiles.set(normalizedPath, 'Home');
    processedPaths.add(normalizedPath);

    // Add to Home folder
    folders['Home'].push(createImageObject(src, filename, isVideo));
  });

  // Log summary of processed files
  console.log('Processed files summary:', {
    totalFiles: processedFiles.size,
    uniquePaths: processedPaths.size,
    folders: Object.keys(folders),
    filesPerFolder: Object.fromEntries(
      Object.entries(folders).map(([folder, files]) => [folder, files.length])
    )
  });

  return folders;
}

const images = importAllImages();
export default images;