<template>
  <div class="finder">
    <div class="example-tree">
      <tree df:data="fetchData" :options="treeOptions" df:filter="filter" ref="tree">
        <span class="tree-text" slot-scope="{ node }">
          <template v-if="!node.hasChildren()">
            <i class="ion-android-star"></i>
            {{ node.text }}
          </template>

          <template v-else>
            <div id="file-drag-drop" style='display: inline'>
              <form
                @drag.stop.prevent
                @dragstart.stop.prevent
                @dragend.stop.prevent
                @dragover.stop.prevent
                @dragenter.stop.prevent
                @dragleave.stop.prevent
                @drop.stop.prevent="drop">
                <i :class="[node.expanded() ? 'ion-android-folder-open' : 'ion-android-folder']"></i> {{ node.text }}</form>
                <div v-for="file in files" :key="file.name" class="file-listing">
                  <img class="preview" v-bind:ref="'preview'+parseInt( file.name )"/>
                  {{ file.name }}
                </div>
            </div>
          </template>
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
const base_container = store.sym(ldp_baseurl); // + 'submissions/');

function makeViewData(tree_node, container) {
  let contents = store.each(container, LDP('contains'));
  let result = [];
  for (var i=0; i<contents.length; i++) {
    let text = contents[i].uri.split('/').reverse()[1];
    let n = {id:null, text:text};
    if(contents[i].uri.endsWith("/")) {
      n['isBatch'] = true;
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

function makePath(base_path, tree_node) {
  if(tree_node.id == 'root') {  // get base node
    if(base_path == '/') {
      return "";
    } else {
      return base_path;
    }
  }
  var segments = [];
  for(var n = tree_node; n != null; n = n.parent) {
    segments.push(n.data.text);
  }
  let result = base_path + segments.reverse().join('/');
  if(tree_node.isBatch) { result += "/"; }
  return result;
}

function determineDragAndDropCapable() {
 var div = document.createElement('div');
 return ( ( 'draggable' in div )
         || ( 'ondragstart' in div && 'ondrop' in div ) )
         && 'FormData' in window
         && 'FileReader' in window;
}

export default {
  name: 'Finder',
  props: {
    path: String
  },
  components: {
    'tree': LiquorTree
  },
  data: function() {
    return {
      dragAndDropCapable: false,
      treeOptions: {
        propertyNames: {
          //text: 'text',
          children: 'contents'
        },
        minFetchDelay: 1000,
        fetchData: node => {
          let base_path = this.path;
          return new Promise(function (resolve) {
            let uri = base_container.uri + makePath(base_path, node);
            let container = store.sym(uri);
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
</style>
