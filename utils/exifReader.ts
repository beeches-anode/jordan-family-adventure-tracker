/**
 * Extracts the DateTimeOriginal from EXIF data in a JPEG image.
 * This tells us when the photo was actually taken.
 */

export interface ExifDate {
  date: Date;
  dateString: string; // ISO format: "2026-01-25"
}

/**
 * Reads the EXIF DateTimeOriginal from an image file.
 * Returns null if no EXIF date is found.
 */
export const extractExifDate = async (file: File): Promise<ExifDate | null> => {
  // Only process JPEG/TIFF images (which contain EXIF)
  if (!file.type.match(/^image\/(jpeg|tiff|heic|heif)/i) && !file.name.match(/\.(jpg|jpeg|tiff|tif|heic|heif)$/i)) {
    return null;
  }

  try {
    const arrayBuffer = await file.slice(0, 128 * 1024).arrayBuffer(); // Read first 128KB for EXIF
    const dataView = new DataView(arrayBuffer);

    // Check for JPEG SOI marker
    if (dataView.getUint16(0) !== 0xFFD8) {
      return null;
    }

    // Find EXIF data (APP1 marker)
    let offset = 2;
    while (offset < dataView.byteLength - 2) {
      const marker = dataView.getUint16(offset);

      if (marker === 0xFFE1) { // APP1 marker (EXIF)
        const length = dataView.getUint16(offset + 2);
        const exifData = parseExifData(dataView, offset + 4, length - 2);
        if (exifData) {
          return exifData;
        }
      }

      // Move to next marker
      if ((marker & 0xFF00) !== 0xFF00) {
        break;
      }

      const segmentLength = dataView.getUint16(offset + 2);
      offset += 2 + segmentLength;
    }

    return null;
  } catch (error) {
    console.warn('Failed to read EXIF data:', error);
    return null;
  }
};

function parseExifData(dataView: DataView, offset: number, length: number): ExifDate | null {
  // Check for "Exif\0\0" header
  const exifHeader = String.fromCharCode(
    dataView.getUint8(offset),
    dataView.getUint8(offset + 1),
    dataView.getUint8(offset + 2),
    dataView.getUint8(offset + 3)
  );

  if (exifHeader !== 'Exif') {
    return null;
  }

  const tiffOffset = offset + 6;

  // Check byte order (II = little endian, MM = big endian)
  const byteOrder = dataView.getUint16(tiffOffset);
  const littleEndian = byteOrder === 0x4949;

  // Verify TIFF magic number (42)
  if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {
    return null;
  }

  // Get offset to first IFD
  const ifd0Offset = dataView.getUint32(tiffOffset + 4, littleEndian);

  // Parse IFD0 to find EXIF IFD pointer
  const exifIfdPointer = findExifIfdPointer(dataView, tiffOffset, ifd0Offset, littleEndian);

  if (exifIfdPointer) {
    // Parse EXIF IFD for DateTimeOriginal
    const dateTime = findDateTimeOriginal(dataView, tiffOffset, exifIfdPointer, littleEndian);
    if (dateTime) {
      return dateTime;
    }
  }

  // Fallback: try to find DateTime in IFD0
  const dateTime = findDateTime(dataView, tiffOffset, ifd0Offset, littleEndian);
  return dateTime;
}

function findExifIfdPointer(dataView: DataView, tiffOffset: number, ifdOffset: number, littleEndian: boolean): number | null {
  const absoluteOffset = tiffOffset + ifdOffset;

  if (absoluteOffset + 2 > dataView.byteLength) return null;

  const numEntries = dataView.getUint16(absoluteOffset, littleEndian);

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = absoluteOffset + 2 + (i * 12);
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, littleEndian);

    // ExifIFDPointer tag = 0x8769
    if (tag === 0x8769) {
      return dataView.getUint32(entryOffset + 8, littleEndian);
    }
  }

  return null;
}

function findDateTimeOriginal(dataView: DataView, tiffOffset: number, ifdOffset: number, littleEndian: boolean): ExifDate | null {
  const absoluteOffset = tiffOffset + ifdOffset;

  if (absoluteOffset + 2 > dataView.byteLength) return null;

  const numEntries = dataView.getUint16(absoluteOffset, littleEndian);

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = absoluteOffset + 2 + (i * 12);
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, littleEndian);

    // DateTimeOriginal tag = 0x9003
    if (tag === 0x9003) {
      const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);
      return readDateTimeString(dataView, tiffOffset + valueOffset);
    }
  }

  return null;
}

function findDateTime(dataView: DataView, tiffOffset: number, ifdOffset: number, littleEndian: boolean): ExifDate | null {
  const absoluteOffset = tiffOffset + ifdOffset;

  if (absoluteOffset + 2 > dataView.byteLength) return null;

  const numEntries = dataView.getUint16(absoluteOffset, littleEndian);

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = absoluteOffset + 2 + (i * 12);
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, littleEndian);

    // DateTime tag = 0x0132
    if (tag === 0x0132) {
      const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);
      return readDateTimeString(dataView, tiffOffset + valueOffset);
    }
  }

  return null;
}

function readDateTimeString(dataView: DataView, offset: number): ExifDate | null {
  try {
    // EXIF date format: "YYYY:MM:DD HH:MM:SS" (20 bytes including null terminator)
    let dateStr = '';
    for (let i = 0; i < 19; i++) {
      if (offset + i >= dataView.byteLength) break;
      const char = dataView.getUint8(offset + i);
      if (char === 0) break;
      dateStr += String.fromCharCode(char);
    }

    // Parse "YYYY:MM:DD HH:MM:SS" format
    const match = dateStr.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months are 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Validate the date
    if (isNaN(date.getTime())) return null;

    // Create ISO date string (YYYY-MM-DD)
    const dateString = `${year}-${month}-${day}`;

    return { date, dateString };
  } catch {
    return null;
  }
}

/**
 * Extracts dates from multiple files and returns the earliest date found.
 * Useful for determining which day a batch of photos belongs to.
 */
export const getEarliestPhotoDate = async (files: File[]): Promise<ExifDate | null> => {
  const dates: ExifDate[] = [];

  for (const file of files) {
    const exifDate = await extractExifDate(file);
    if (exifDate) {
      dates.push(exifDate);
    }
  }

  if (dates.length === 0) return null;

  // Return the earliest date
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  return dates[0];
};
