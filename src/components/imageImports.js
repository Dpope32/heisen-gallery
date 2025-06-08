// imageImports.js
function importAllImages() {
  const folders = {};
  const processedFiles = new Map(); // Map to store normalized paths and their source folders

  // Helper function to normalize paths and filenames
  const normalizePath = (path) => {
    return path.toLowerCase()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/\/+/g, '/');
  };

  // Helper function to extract base filename without extension
  const getBaseName = (filename) => {
    return filename.replace(/\.(png|jpe?g|svg|mp4)$/i, '');
  };

  // Helper function to create image object
  const createImageObject = (src, name, isVideo) => ({
    src: src.default || src,
    caption: name.replace(/[-_]/g, ' '),
    isVideo
  });

  // Import root level images first (these get priority)
  const rootContext = require.context('../Images', false, /\.(png|jpe?g|svg|mp4)$/i);
  rootContext.keys().forEach(item => {
    const normalizedPath = normalizePath(item);
    const filename = item.replace('./', '');
    const baseName = getBaseName(filename);
    const isVideo = filename.toLowerCase().endsWith('.mp4');

    // Store in processed files map with source folder
    processedFiles.set(normalizedPath, 'Home');

    // Initialize Home folder if needed
    if (!folders['Home']) folders['Home'] = [];

    // Add to Home folder
    folders['Home'].push(createImageObject(rootContext(item), baseName, isVideo));
  });

  // Import subfolder images
  const subfolderContext = require.context('../Images', true, /^\.\/[^/]+\/.*\.(png|jpe?g|svg|mp4)$/i);
  subfolderContext.keys().forEach(item => {
    const normalizedPath = normalizePath(item);
    const parts = normalizedPath.split('/');
    const folder = parts[0];
    const filename = parts[parts.length - 1];
    const baseName = getBaseName(filename);
    const isVideo = filename.toLowerCase().endsWith('.mp4');

    // Check if this file was already processed
    if (processedFiles.has(normalizedPath)) {
      console.log(`Skipping duplicate file: ${filename} (already in ${processedFiles.get(normalizedPath)} folder)`);
      return;
    }

    // Initialize folder if needed
    if (!folders[folder]) folders[folder] = [];

    // Store in processed files map
    processedFiles.set(normalizedPath, folder);

    // Add to appropriate folder
    folders[folder].push(createImageObject(subfolderContext(item), baseName, isVideo));
  });

  // Log summary of processed files
  console.log('Processed files summary:', {
    totalFiles: processedFiles.size,
    folders: Object.keys(folders),
    filesPerFolder: Object.fromEntries(
      Object.entries(folders).map(([folder, files]) => [folder, files.length])
    )
  });

  return folders;
}

const images = importAllImages();
export default images;