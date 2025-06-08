// imageImports.js
function importAllImages() {
  const folders = {};
  const processedFiles = new Set(); // Track processed filenames to prevent duplicates

  // Import root level images first (these get priority)
  const rootContext = require.context('../Images', false, /\.(png|jpe?g|svg|mp4)$/i);
  rootContext.keys().forEach(item => {
    const filename = item.replace('./', '');
    if (!folders['Home']) folders['Home'] = [];

    const name = filename.replace(/\.(png|jpe?g|svg|mp4)$/i, '');
    const caption = name.replace(/[-_]/g, ' ');
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    const src = rootContext(item);

    // Add to processed files set with normalized path
    const normalizedPath = filename.toLowerCase().replace(/\\/g, '/');
    processedFiles.add(normalizedPath);

    folders['Home'].push({
      src: src.default || src,
      caption,
      isVideo
    });
  });

  // Import subfolder images, skipping any that were already processed
  const subfolderContext = require.context('../Images', true, /^\.\/[^/]+\/.*\.(png|jpe?g|svg|mp4)$/i);
  subfolderContext.keys().forEach(item => {
    const normalizedItem = item.replace(/\\/g, '/');
    const parts = normalizedItem.replace('./', '').split('/');
    const folder = parts[0];
    const filename = parts[parts.length - 1];

    // Skip if this filename was already processed (case-insensitive)
    const normalizedPath = filename.toLowerCase().replace(/\\/g, '/');
    if (processedFiles.has(normalizedPath)) {
      console.log(`Skipping duplicate file: ${filename}`);
      return;
    }

    if (!folders[folder]) folders[folder] = [];

    const name = filename.replace(/\.(png|jpe?g|svg|mp4)$/i, '');
    const caption = name.replace(/[-_]/g, ' ');
    const isVideo = filename.toLowerCase().endsWith('.mp4');
    const src = subfolderContext(item);

    // Add to processed files set
    processedFiles.add(normalizedPath);

    folders[folder].push({
      src: src.default || src,
      caption,
      isVideo
    });
  });

  return folders;
}

const images = importAllImages();
export default images;