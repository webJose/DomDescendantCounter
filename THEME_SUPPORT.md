# DevTools Theme Support

## Overview

This Chrome DevTools extension automatically adapts to the user's DevTools theme preference (light/dark mode). The extension uses **separate CSS files** for each theme that are loaded conditionally based on the user's preference.

## How It Works

### 1. Separate CSS Files Approach
The extension uses three CSS files:

- **`style.css`** - Base styles that are theme-independent
- **`style-dark.css`** - Dark theme specific styles  
- **`style-light.css`** - Light theme specific styles

### 2. HTML Implementation
In `sidebar.html`, multiple stylesheets are linked with media queries:

```html
<!-- Base styles (non-theme specific) -->
<link rel="stylesheet" href="./public/style.css">
<!-- Theme-specific styles -->
<link rel="stylesheet" href="./public/style-dark.css" media="(prefers-color-scheme: dark)">
<link rel="stylesheet" href="./public/style-light.css" media="(prefers-color-scheme: light)">
```

### 3. Build Process
During the build process, Vite:
1. Processes all three CSS files
2. Converts the theme-specific CSS files to base64 data URIs
3. Embeds them in the HTML with the correct media queries
4. Combines base styles into the main CSS bundle

This results in efficient conditional loading - only the appropriate theme CSS is applied based on the user's preference.

## Implementation Details

### Base Styles (`style.css`)
Contains theme-independent styles:
- Layout and positioning
- Font settings
- Button dimensions and interactions
- Table structure

### Dark Theme (`style-dark.css`)
- Background: #222222
- Text: #eeeeee  
- Primary accent: #00bfff (light blue)
- Success: #00cc66 (green)
- Warning: #ff6600 (orange)

### Light Theme (`style-light.css`)
- Background: #ffffff
- Text: #333333
- Primary accent: #0078d4 (blue)
- Success: #107c10 (green) 
- Warning: #d83b01 (red-orange)

## Browser Support

The `prefers-color-scheme` media query works in:
- Chrome 76+
- Firefox 67+
- Safari 12.1+
- Edge 79+

This covers all browsers that support Chrome extensions.

## Theme Switching

Users can change their DevTools theme by:
1. Opening DevTools (F12)
2. Press F1 to open Settings
3. Go to "Appearance" section
4. Select "Light" or "Dark" theme
5. The extension will automatically switch themes instantly

## Benefits

- **True separation of concerns** - Each theme is in its own file
- **Efficient loading** - Only the active theme CSS is processed
- **Maintainable** - Easy to modify individual themes
- **No JavaScript required** - Pure CSS solution using browser-native features
- **Instant switching** - No delays when user changes theme
- **Build-time optimization** - Vite processes and optimizes the CSS files

## Files Structure

```
src/
├── public/
│   ├── style.css         # Base styles
│   ├── style-dark.css    # Dark theme
│   └── style-light.css   # Light theme
├── sidebar.html          # Links to all CSS files with media queries
└── assets/
    └── copy-modal.html   # Modal also includes theme support
```

## Testing

To test theme switching:
1. Load the extension in Chrome DevTools
2. Open the extension panel (Elements > Descendant Count sidebar)
3. Change DevTools theme in Settings (F1 > Appearance)
4. Observe the extension interface updating automatically with different colors and styling
