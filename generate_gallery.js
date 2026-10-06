const fs = require('fs');
const path = require('path');

const YEAR = '2026';
const YEAR_DIR = path.join(__dirname, YEAR);
const OUTPUT_JSON = path.join(YEAR_DIR, 'gallery.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function formatName(folderName) {
  // e.g. "abinashgiri" -> "Abinash Giri"
  // "narayanthapa" -> "Narayan Thapa"
  if (folderName === 'abinashgiri') return 'Abinash Giri';
  if (folderName === 'narayanthapa') return 'Narayan Thapa';
  
  // Generic fallback: convert camelCase, snake_case, or concatenated words
  return folderName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function scanGallery() {
  if (!fs.existsSync(YEAR_DIR)) {
    console.error(`Directory ${YEAR_DIR} does not exist.`);
    return;
  }

  const entries = fs.readdirSync(YEAR_DIR, { withFileTypes: true });
  const folders = [];
  let totalPhotos = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderName = entry.name;
      const folderPath = path.join(YEAR_DIR, folderName);
      
      const files = fs.readdirSync(folderPath);
      const photos = [];

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          photos.push({
            filename: file,
            path: `${folderName}/${file}`
          });
        }
      }

      // Sort photos by filename
      photos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' }));

      if (photos.length > 0) {
        folders.push({
          id: folderName,
          name: formatName(folderName),
          photoCount: photos.length,
          photos: photos
        });
        totalPhotos += photos.length;
      }
    }
  }

  // Sort folders alphabetically by name
  folders.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    year: YEAR,
    title: `PinkWalk ${YEAR} Photo Gallery`,
    generatedAt: new Date().toISOString(),
    totalPhotos: totalPhotos,
    folders: folders
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Successfully generated gallery manifest: ${OUTPUT_JSON}`);
  console.log(`Total Folders: ${folders.length}`);
  console.log(`Total Photos: ${totalPhotos}`);
  folders.forEach(f => {
    console.log(` - ${f.name} (${f.id}): ${f.photoCount} photos`);
  });
}

scanGallery();
