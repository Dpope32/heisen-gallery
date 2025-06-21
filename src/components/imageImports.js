// imageImports.js
function importAllImages() {
  const folders = {};
  const processedFiles = new Map();
  const processedPaths = new Set(); 

  const normalizePath = (path) => {
    return path.toLowerCase()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '')
      .replace(/\/+/g, '/')
      .replace(/^img\s+/i, '')
      .replace(/^images\//i, '')
      .trim();
  };

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

    if (processedPaths.has(normalizedPath)) {
      return;
    }

    if (!folders[folder]) folders[folder] = [];

    processedFiles.set(normalizedPath, folder);
    processedPaths.add(normalizedPath);

    folders[folder].push(createImageObject(src, filename, isVideo));
  });

  // Then process root level images
  const rootContext = require.context('../Images', false, /\.(png|jpe?g|svg|mp4)$/i);
  rootContext.keys().forEach(item => {
    const normalizedPath = normalizePath(item);
    const filename = item.replace('./', '');
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    const src = rootContext(item);

    if (processedPaths.has(normalizedPath)) {
      console.log(`Skipping root image that exists in subfolder: ${normalizedPath}`);
      return;
    }

    if (!folders['Home']) folders['Home'] = [];

    processedFiles.set(normalizedPath, 'Home');
    processedPaths.add(normalizedPath);

    folders['Home'].push(createImageObject(src, filename, isVideo));
  });

  return folders;
}

const images = importAllImages();
export default images;
