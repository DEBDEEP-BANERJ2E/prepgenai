const DB_NAME = 'prepgen_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * Initializes the IndexedDB database.
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject("Failed to open database");
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves a File or Blob to IndexedDB and returns a unique fileId.
 * @param {File|Blob} file 
 * @returns {Promise<string>} fileId
 */
export async function saveFile(file) {
  try {
    const db = await initDB();
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(file, fileId);
      
      request.onsuccess = () => {
        resolve(fileId);
      };
      
      request.onerror = (e) => {
        console.error("Error saving file:", e);
        reject("Failed to save file to IndexedDB");
      };
    });
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieves a File or Blob from IndexedDB by fileId.
 * @param {string} fileId 
 * @returns {Promise<File|Blob>}
 */
export async function getFile(fileId) {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(fileId);
      
      request.onsuccess = (event) => {
        const file = event.target.result;
        if (file) {
          resolve(file);
        } else {
          reject("File not found");
        }
      };
      
      request.onerror = (e) => {
        console.error("Error retrieving file:", e);
        reject("Failed to retrieve file from IndexedDB");
      };
    });
  } catch (err) {
    throw err;
  }
}

/**
 * Deletes a File or Blob from IndexedDB by fileId.
 * @param {string} fileId 
 * @returns {Promise<void>}
 */
export async function deleteFile(fileId) {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(fileId);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (e) => {
        console.error("Error deleting file:", e);
        reject("Failed to delete file from IndexedDB");
      };
    });
  } catch (err) {
    throw err;
  }
}
