<template>
  <div class="finder">
    <h2>Submissions</h2>
    <div class="folderview">
      <CreateSubmission />
      <tree df:data="fetchData" :options="treeOptions" df:filter="filter" ref="tree">
        <span class="tree-text" slot-scope="{ node }">
          <div id="file-drag-drop" style='display: inline'>
            <form
              @drag.stop.prevent
              @dragstart.stop.prevent
              @dragend.stop.prevent
              @dragover.stop.prevent
              @dragenter.stop.prevent
              @dragleave.stop.prevent
              @drop.stop.prevent="drop($event, node)">
              <feather v-if="node.hasChildren()" type="folder" />
              <feather v-else-if="'file' in node.data" type="file-plus" />
              <feather v-else type="folder" /> {{ node.text }} <a class="submit-button" v-on:click.stop.prevent="uploadFiles(node)" v-if="node.data.hasUploads">Upload</a>
              <progress v-if="'file' in node.data" max="100" :value.prop="node.data.uploadPercentage"></progress>
            </form>
          </div>
        </span>
      </tree>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
/* eslint-disable no-alert */
import LiquorTree from 'liquor-tree'
const $rdf = require('rdflib');
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const ldp_baseurl = 'http://0.0.0.0/';
const path = 'submissions/';
const base_container = store.sym(ldp_baseurl);

function makeViewData(tree_node, container) {
  let contents = store.each(container, LDP('contains'));
  let result = [];
  for (var i=0; i<contents.length; i++) {
    let n = {id:null, data: { rdf: contents[i] } };
    if(contents[i].uri.endsWith("/")) {
      n['text'] = contents[i].uri.split('/').reverse()[1];
      n['isBatch'] = true;
    } else {
      n['text'] = contents[i].uri.split('/').reverse()[0];
    }
    result.push(n);
  }
  result.sort(function(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    if (x < y) {return -1;}
    if (x > y) {return 1;}
    return 0;
  });
  return result;
}

function determineDragAndDropCapable() {
 var div = document.createElement('div');
 return ( ( 'draggable' in div )
         || ( 'ondragstart' in div && 'ondrop' in div ) )
         && 'FormData' in window
         && 'FileReader' in window;
}

// Drop handler function to get all files
async function getAllFileEntries(dataTransferItemList) {
  let fileEntries = [];
  // Use BFS to traverse entire directory/file structure
  let queue = [];
  // Unfortunately dataTransferItemList is not iterable i.e. no forEach
  for (let i = 0; i < dataTransferItemList.length; i++) {
    queue.push(dataTransferItemList[i].webkitGetAsEntry());
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
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

function sleep() {
  return new Promise(resolve => {
    console.log('waiting..');
    setTimeout(resolve, 20000);
  });
}

export default {
  name: 'Submissions',
  components: {
    'tree': LiquorTree
  },
  mounted() {
    this.dragAndDropCapable = determineDragAndDropCapable();
  },
  methods: {
    drop: async function(e, node) {
      let files = await getAllFileEntries(e.dataTransfer.items);
      for( let i = 0; i < files.length; i++ ) {
        node.append( { id: null, text: files[i].fullPath, data: { file: files[i], uploadPercentage: 0 } } );
      }
      node.data['hasUploads'] = true;
      node.expand();
    },
    uploadFiles(node) {
      // build array of all new folders in order.
      // create folders in order.
      var q = new Promise(() => {});
      var queued = new Set();
      node.children.forEach( child => {
        if( 'file' in child.data) {
          let entry = child.data.file;
          console.log(entry);
          entry.file(file => {
            var segments = entry.fullPath.split('/');
            console.log(segments);
            segments.pop();
            segments.shift();
            var parentpath = "";
            segments.forEach( seg => {
                var parenturi = node.data.rdf.uri + parentpath;
                let head = {
                  'Content-Type': 'application/ld+json',
                  'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                  'Slug': seg
                };
                var newpath = parentpath + seg + '/';
                if(!queued.has(newpath)) {
                  queued.add(newpath);
                  console.log('will make: '+seg+ " at "+ parenturi);
                  q = q.then(this.$http({
                    method: 'post',
                    url: parenturi,
                    headers: head
                  })).then(sleep());
                }
                parentpath = newpath;
            });
            q = q.then(
              this.$http.post( node.data.rdf.uri + parentpath, file,
              { headers: {
                'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
                'Slug': encodeURIComponent(file.name.replace(/\|/g, '')).replace(/'/g, '%27'),
                'Content-type': 'application/octet-stream'},
                onUploadProgress: function( progressEvent ) {
                  child.data.uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
                }.bind(this) }
            ).then( function() {
              //child.show();
            }).catch( function(error) {
              child.data.failed = true;
              console.log('FAILURE!!', error);
            }).finally( function() { console.log(node); }));
          }, error => console.warn(error));
        }
      });
    }
  },
  data: function() {
    return {
      dragAndDropCapable: false,
      treeOptions: {
        propertyNames: {
          children: 'contents'
        },
        // store: {
        //   getter: () => {
        //     return this.$store.getters.tree
        //   },
        //   dispatcher(tree) {
        //     this.$store.dispatch('updateTree', tree)
        //   }
        // },
        minFetchDelay: 1000,
        fetchData: node => {
          return new Promise(function (resolve) {
            var container = null;
            if(node.id == 'root') {  // get base node
              container = store.sym(base_container.uri + ((path == '/') ? "" : path));
            } else if('rdf' in node.data) {
              container = store.sym(node.data.rdf.uri);
            }
            //console.log('getting child data');
            //console.log(container);
            fetcher.load(container).then(() => {
              let result = makeViewData(node, container);
              resolve(result);
            }).catch(e => console.log(e));
          });
        },
        onFetchError(error) {
          console.error(error)
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

form {
  display: block;
  height: 100%;
  width: 100%;
  background: #ccc;
  margin: 0px;
  padding: 0px;
  border: 0px;
}
</style>
