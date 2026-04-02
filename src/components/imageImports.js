// imageImports.js — loads images from filesystem via IPC instead of webpack bundling

export async function loadImages() {
  const data = await window.electron.getImageData();
  const folders = {};

  for (const [folder, files] of Object.entries(data)) {
    folders[folder] = files.map(filename => {
      const isVideo = filename.toLowerCase().endsWith('.mp4');
      // Build a media:// URL — subfolder files use "folder/filename", root files use just "filename"
      const mediaPath = folder === 'Home' ? filename : `${folder}/${filename}`;
      return {
        src: `media://${encodeURIComponent(mediaPath).replace(/%2F/g, '/')}`,
        caption: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        isVideo,
      };
    });
  }

  return folders;
}
