// Get all the entries (files or sub-directories) in a directory
// by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Wrap readEntries in a promise to make v-else-if="'file' in node.data" working with readEntries easier
// readEntries will return only some of the entries in a directory
// e.g. Chrome returns at most 100 entries at a time

/* eslint-disable no-console */
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

function dtransfers(dataTransfer) {
  if (window === this) {
    return new dtransfers(dataTransfer);
  }
  this.dataTransfer = dataTransfer;
  return this;
}

dtransfers.prototype = {
  // Drop handler function to get all files
  getAllFileEntries: async function() {
    let fileEntries = [];
    // Use BFS to traverse entire directory/file structure
    let queue = [];
    // Unfortunately dataTransferItemList is not iterable i.e. no forEach
    for (let i = 0; i < this.dataTransfer.items.length; i++) {
      queue.push(this.dataTransfer.items[i].webkitGetAsEntry());
    }
    while (queue.length > 0) {
      let entry = queue.shift();
      if (entry.isFile) {
        fileEntries.push(entry);
      } else if (entry.isDirectory) {
        queue.push(...await readAllDirectoryEntries(entry.createReader()));
      }
    }
    return fileEntries;
  }

}

export { dtransfers as default };
