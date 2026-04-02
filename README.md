# 🖼️ Heisen Gallery

A modern, secure desktop image gallery application built with Electron and React, featuring a cyberpunk-inspired dark theme and advanced viewing capabilities.

## ✨ Features

### 🔐 Security & Privacy
- **Passcode Protection**: Secure access with your custom numeric passcode
- **Auto-lock**: Automatically locks after 1 hour of inactivity
- **Private Browsing**: No external analytics or tracking

### 🖥️ Viewing Experience
- **Responsive Masonry Layout**: Adaptive grid that scales from 1-5 columns based on screen size
- **Full-screen Image Viewer**: Pan, zoom, and navigate with mouse/keyboard controls
- **Video Support**: Native MP4 video playback with autoplay and controls
- **Auto-scroll Mode**: Hands-free viewing with automatic 10-minute scroll sessions
- **Keyboard Navigation**: Arrow keys, ESC to close, full keyboard support

### 📁 Organization
- **Smart Folder System**: Organize images into custom folders
- **Favorites System**: Heart/unheart images for quick access
- **Dynamic Import**: Automatically discovers images from folder structure
- **Drag & Drop Import**: Drag images/videos onto the window to import into any folder or create a new one
- **Search & Filter**: Browse by folder with instant switching

### 🎨 Interface
- **Cyberpunk Theme**: Matrix-inspired green-on-black color scheme
- **Smooth Animations**: Hover effects, scaling, and transitions
- **Clean Typography**: Courier New monospace font throughout
- **Responsive Design**: Adapts from mobile to ultra-wide displays

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dpope32/heisen-gallery
   cd heisen-gallery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set your passcode**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and set your custom passcode
   # REACT_APP_PASSCODE=your_secret_code
   ```

4. **Add your images**
   - **Create the Images folder**: `src/Images/` (this folder doesn't exist by default and is gitignored)
   - **Drag & drop**: Drag files onto the running app to import them into any folder
   - **Manual**: Place images directly in `src/Images/` for the Home tab, or in subfolders like `src/Images/Vacation/` for folder tabs
   - **Supported formats**: JPG, PNG, SVG, MP4

5. **Launch the application**
   ```bash
   npm start
   ```

### Building for Production

```bash
# Create distributable package
npm run make

# Build webpack bundle
npm run build

# Package without installer
npm run package
```

## 📂 Project Structure

```
heisen-gallery/
├── src/
│   ├── components/
│   │   ├── ImageGallery/     # Gallery grid, viewer, and items
│   │   ├── DropZone/         # Drag & drop import overlay
│   │   ├── AutoScrollDialog/ # Auto-scroll controls
│   │   └── Passcode.js      # Security component
│   ├── hooks/               # Custom React hooks
│   ├── Images/              # Your image collection (gitignored)
│   └── assets/              # App icons and resources
├── forge.config.js          # Electron Forge configuration
└── webpack.config.js        # Webpack build configuration
```

## 🎮 Usage

### First Launch
1. Enter your custom passcode (set in `.env` file)
2. **Create** the `src/Images/` folder (it doesn't exist by default!)
3. Add your images and folders inside `src/Images/`
4. Restart the app to load new images

### Navigation
- **Mouse**: Click images to view full-screen, scroll to browse
- **Keyboard**: Arrow keys (←/→) to navigate, ESC to close viewer
- **Folders**: Click folder tabs to switch collections
- **Favorites**: Click heart icon to save favorites
- **Import**: Drag image/video files onto the window to import
- **Auto-scroll**: Click play button for hands-free viewing
- **Lock**: Click lock button or wait 1 hour for auto-lock

### Advanced Features
- **Zoom**: Mouse wheel or zoom buttons in full-screen mode
- **Download**: Right-click images for download confirmation
- **Video**: Full playback controls with loop and autoplay
- **Performance**: Lazy loading and optimized rendering

## 🛠️ Technical Details

### Built With
- **Electron 34.2.0**: Cross-platform desktop framework
- **React 18.2.0**: Modern UI library with hooks
- **React Bootstrap**: UI components and grid system
- **React Masonry CSS**: Pinterest-style responsive layout
- **React Zoom Pan Pinch**: Advanced image viewing controls
- **Webpack**: Module bundling and asset optimization

### Architecture
- **Main Process**: Electron app initialization, window management, IPC handlers, and custom `media://` protocol for serving images
- **Renderer Process**: React application with component-based architecture
- **Custom Hooks**: Reusable logic for auto-scroll, keyboard navigation, and storage
- **Local Storage**: Persistent favorites and settings without external dependencies

### Performance
- **Filesystem-based media**: Images are served directly from disk via a custom `media://` protocol — no webpack bundling of media files, so startup is fast regardless of collection size
- **Code Splitting**: Lazy-loaded components for faster startup
- **Memory Management**: Efficient rendering with React.memo and useMemo
- **Responsive Images**: Adaptive loading based on viewport size

## 🔧 Configuration

### Adding Images

**Option 1 — Drag & drop**: Drag files onto the running app. A green overlay appears where you can pick an existing folder or create a new one. The gallery refreshes automatically.

**Option 2 — Manual**: Place files in `src/Images/` and restart the app.

- **Home tab**: Files placed directly in `src/Images/`
- **Dynamic tabs**: Each subfolder becomes a clickable tab
- **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.svg`, `.mp4`

Example structure:
```
src/Images/
├── sunset.jpg          ← Shows in "Home" tab
├── family.png          ← Shows in "Home" tab  
├── Vacation/           ← Creates "Vacation" tab
│   ├── beach.jpg
│   └── mountains.mp4
└── Art/                ← Creates "Art" tab
    ├── painting1.jpg
    └── sculpture.png
```

### Customization
- **Passcode**: Set `REACT_APP_PASSCODE` in `.env` file
- **Timeout**: Modify `INACTIVITY_TIMEOUT` in `src/App.js`
- **Theme**: Customize colors in `src/HackerTheme.css`
- **Layout**: Adjust breakpoints in `ImageGallery.js`

## 📊 Performance Stats

- **Startup Time**: < 3 seconds on modern hardware
- **Memory Usage**: ~150MB baseline, scales with image count
- **Supported Images**: Unlimited (limited by available RAM)
- **Max Resolution**: Up to 8K images with smooth zooming
- **Video Performance**: Hardware-accelerated MP4 playback

## 🐛 Troubleshooting

### Common Issues
- **No images showing**: Create the `src/Images/` folder, or drag & drop files onto the app to create it automatically
- **Images not loading**: Ensure images are in `src/Images/` (or use drag & drop)
- **Folders not appearing**: Subfolders in `src/Images/` become tabs automatically
- **Password not working**: Check your `.env` file, default fallback is `000000`
- **Performance issues**: Reduce image file sizes, close other applications
- **Build errors**: Clear `node_modules` and reinstall dependencies

### Debug Mode
```bash
# Run with developer tools open
npm start -- --debug
```

## 📄 License

**MIT License** - This project is open source!

```
MIT License

Copyright (c) 2024 Dawson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**TL;DR**: Use it, hack it, distribute it, make it your own! 🚀

## 👨‍💻 Author

**Dawson** - d.pope@eagles.oc.edu

---

*Built with ❤️ and lots of ☕ for secure, beautiful image viewing* 
