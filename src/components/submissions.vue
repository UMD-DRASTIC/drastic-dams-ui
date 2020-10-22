<template>
  <div class="container-fluid">
    <div class="row">
      <h2>Submissions</h2>
      <div style="padding-left: 5em">&nbsp;&nbsp;&nbsp;&nbsp;<CreateSubmission /></div>
    </div>
    <div class="row">
      <div class="scroll col-md-4">
        <tree df:data="fetchData" :options="treeOptions" df:filter="filter" ref="tree">
          <span class="tree-text" slot-scope="{ node }" v-bind:class="{ new: node.data.new }">
            <div id="file-drag-drop" style='display: inline'>
              <form
                @drag.stop.prevent
                @dragstart.stop.prevent
                @dragend.stop.prevent
                @dragover.stop.prevent
                @dragenter.stop.prevent
                @dragleave.stop.prevent
                @drop.stop.prevent="drop($event, node)">
                <template v-if="node.data.isSubmission">
                  <feather type="archive" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                  <a v-if="node.data.hasUploads" class="submit-button" v-on:click.stop.prevent="uploadFiles(node)">Upload</a> &nbsp;&nbsp;&nbsp;&nbsp;
                  <a v-if="node.data.hasUploads" class="submit-button" v-on:click.stop.prevent="flattenFolders(node)">Flatten</a>
                </template>
                <template v-else-if="node.data.isfolder && !node.data.new">
                  <feather type="folder" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-else-if="node.data.isfolder && node.data.new">
                  <feather type="folder-plus" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-if="!node.data.isfolder && !node.data.new">
                  <feather type="file" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-if="!node.data.isfolder && node.data.new">
                  <feather type="file-plus" />  <feather type="link" v-if="node.data.description"/>
                  &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }} <progress v-if="'file' in node.data" max="100" :value.prop="node.data.uploadPercentage"></progress>
                </template>
              </form>
            </div>
          </span>
        </tree>
      </div>
      <div class="col-md-8" v-if="currentNode">
        <div class="container">
           <span v-for="(c, index) in crumbs" :key="crumbs.slice(0,index).join('/')" class="crumb">
             {{ c }} <feather type="chevrons-right" />
           </span>
        </div>

        <div class="container">
          <h2>{{ currentNode['text'] }}</h2>
        </div>

        <div class="tabs">
          <a v-on:click="activetab=1" v-bind:class="[ activetab === 1 ? 'active' : '' ]">View</a>
          <a v-on:click="activetab=2" v-bind:class="[ activetab === 2 ? 'active' : '' ]">Description</a>
          <a v-on:click="activetab=3" v-bind:class="[ activetab === 3 ? 'active' : '' ]">Provenance</a>
          <a v-on:click="activetab=4" v-bind:class="[ activetab === 4 ? 'active' : '' ]">Technical Data</a>
        </div>

        <div class="content">
          <div v-if="activetab === 1" class="tabcontent">
              <img v-if="isimage" :src="nodeurl" :key="getPath(currentNode)">
          </div>
          <div v-if="activetab === 2" class="tabcontent">
            <a v-if="hasDescription" v-bind:href="currentNode.data.description.value">Described by {{ currentNode.data.description.value }}</a>:
            <div v-for="s in descProps" :key="s[0]+s[1]" class="row">
              <div class="col-md-3">{{ s[0] }}</div>
              <div class="col-md-9">{{ s[1] }}</div>
            </div>
              <p>TODO render item level Dublin Core (to be extracted from manifest)</p>
          </div>
          <div v-if="activetab === 3" class="tabcontent">
              List of PREMIS events.
          </div>
          <div v-if="activetab === 4" class="tabcontent">
            <div class="container">
              <p>TODO: use prefixes w/hover showing expanded URIs.</p>
              <div v-for="s in rdfProps" :key="s[0]+s[1]" class="row">
                <div class="col-md-3">{{ s[0] }}</div>
                <div class="col-md-9">{{ s[1] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
/* eslint-disable no-alert */
import LiquorTree from 'liquor-tree'
import dtransfers from '../assets/js/dtransfers.js'
import lth from '../assets/js/lthelp.js'
import filenames from '../assets/js/filenames'
const $rdf = require('rdflib');
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const ldp_baseurl = 'http://0.0.0.0';
const basepath = '/submissions/';
const base_container = store.sym(ldp_baseurl);

function makeViewData(tree_node, container) {
  let contents = store.each(container, LDP('contains'));
  let result = [];
  for (var i=0; i<contents.length; i++) {
    let n = {id:null, data: { rdf: contents[i] } };
    if(contents[i].uri.endsWith("/")) {
      n.data['isfolder'] = true;
      n.data['new'] = false;
      n['text'] = contents[i].uri.split('/').reverse()[1];
      n['isBatch'] = true;
    } else {
      n.data['isfolder'] = false;
      n.data['new'] = false;
      n['text'] = contents[i].uri.split('/').reverse()[0];
    }
    result.push(n);
  }
  result.sort(alphaSort);
  return result;
}

function alphaSort(a, b) {
  var x = a.text.toLowerCase();
  var y = b.text.toLowerCase();
  if (x < y) {return -1;}
  if (x > y) {return 1;}
  return 0;
}

function determineDragAndDropCapable() {
 var div = document.createElement('div');
 return ( ( 'draggable' in div )
         || ( 'ondragstart' in div && 'ondrop' in div ) )
         && 'FormData' in window
         && 'FileReader' in window;
}

// function sleep() {
//   return new Promise(resolve => {
//     console.log('waiting..');
//     setTimeout(resolve, 20000);
//   });
// }

function buildUploadTree(rawfiles, node) {
  let files = rawfiles.sort((a, b) => {
    return a.fullPath.localeCompare(b.fullPath)
  });
  for (var i = 0; i < files.length; i++) {
    var chain = files[i].fullPath.split('/');
    chain.shift();
    var currentNode = node;

    // FIXME node:added events work only when adding file to empty folder
    for (var j = 0; j < chain.length; j++) {
        var wantedText = chain[j];
        var lastNode = currentNode;
        // find or insert required folders
        let newNode = {id: null, data: {new: true, isfolder: true}, text: wantedText, children: []};
        if(j == chain.length-1) { // last index is the file itself
          newNode.data.isfolder = false;
          newNode.data['file'] = files[i];
          newNode.data['uploadPercentage'] = 0;
        }
        for (var k = 0; k < currentNode.children.length; k++) {
            if (currentNode.children[k].data.text == wantedText) {
                currentNode = currentNode.children[k];
                break;
            } else if (currentNode.children[k].data.text.localeCompare(wantedText) > 0 ) {
                currentNode.children[k].before(newNode);
                currentNode = currentNode.children[k];
                break;
            }
        }
        if (lastNode == currentNode) {
            currentNode = currentNode.append(newNode);
        }
    }
  }
}

function ingest(it, node) {
  let parent_path = new lth(node.parent).makePath(basepath).replace(/ /g,'_');
  var parenturi = ldp_baseurl + parent_path + '/';
  console.log("building ingest req for "+node.data.text+" at "+parenturi);
  if(node.data.isfolder) {
    let head = {
      'Content-Type': 'application/ld+json',
      'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
      'Slug': node.data.text
    };
    return it.$http({
        method: 'post',
        url: parenturi,
        headers: head
    }).then(resolve => {
      setTimeout(resolve, 200);
    });
  } else {
    let entry = node.data.file;
    return new Promise((resolve) => {
      entry.file((file) => { resolve(file) });
    }).then((file) => {
      it.$http.post( parenturi, file,
        { headers: {
          'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
          'Slug': encodeURIComponent(file.name.replace(/\|/g, '')).replace(/'/g, '%27'),
          'Content-Type': 'application/octet-stream'},
          onUploadProgress: function( progressEvent ) {
            node.data.uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
          }.bind(it)
        }
      );
    }).catch( function(error) {
      node.data.failed = true;
      console.log('FAILURE!!', error);
    });
  }
}

function submissionHasUploads(anynode, bool) {
  for(let s = anynode; s != undefined; s = s.parent) {
    if(s.data.isSubmission == true) {
      s.data['hasUploads'] = bool;
      s.data = { ...s.data };
      s.vm.$forceUpdate();
      break;
    }
  }
}

export default {
  name: 'Submissions',
  components: {
    'tree': LiquorTree
  },
  mounted() {
    this.dragAndDropCapable = determineDragAndDropCapable();
    this.$refs.tree.$on("node:selected", this.focus);
    this.$refs.tree.$on("node:added", this.uploadAdded);
  },
  computed: {
    crumbs: function() {
      let segs = new lth(this.currentNode).makePath().split('/');
      segs.pop();
      return segs;
    },
    hasuploads: function() {
      //console.log(this.node);
      return true;
    },
    isimage: function() {
      let re_img = /.*\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG)/
      return re_img.test(this.currentNode.text);
    },
    hasDescription: function() {
      return 'description' in this.currentNode.data;
    },
    nodeurl: function() {
      return base_container.uri + new lth(this.currentNode).makePath(basepath);
    },
    rdfProps: function () {
      return this.rdfdetails.map(
        v => {
          let result = [];
          result[0] = String(v.predicate);
          result[1] = v.object;
          return result;
        }
      );
    },
    descProps: function () {
      return this.descdetails.map(
        v => {
          let result = [];
          result[0] = String(v.predicate);
          result[1] = v.object;
          return result;
        }
      );
    }
  },
  methods: {
    drop: async function(e, node) {
      node.expand();
      let files = await new dtransfers(e.dataTransfer).getAllFileEntries();
      submissionHasUploads(node, true);
      buildUploadTree(files, node);
    },
    focus: async function(oldNode, newNode) {
      let node = newNode && newNode.text ? newNode : oldNode
      this.currentNode = node;
      for(let s = node; s != undefined; s = s.parent) {
        if(s.data.isSubmission == true) {
          this.currentSubmission = s;
          break;
        }
      }
      let uri = store.sym(base_container.uri + new lth(node).makePath(basepath));
      fetcher.load(uri).then(() => {
        this.rdfdetails = store.statementsMatching(uri, undefined, undefined);
      }).catch(e => console.log(e));
      if('description' in node.data) {
        this.descdetails = store.statementsMatching(node.data.description, undefined, undefined);
      }
    },
    uploadAdded: async function(parent, newnode) {
      if(!newnode.data.isfolder && newnode.data.new) {
        let fn = new filenames(newnode.text);
        let paths = fn.getDescriptionPaths();
        let result = null;
        for( let i = 0; i < paths.length; i++) {
          let base_container = store.sym(ldp_baseurl);
          let desc = store.sym(base_container.uri + '/description' + paths[i]);
          await fetcher.load(desc).then(() => {
            result = desc;
          }).catch(() => {
            console.log(paths[i]+ ' not found');
          });
          if (result != null) {
            break;
          }
        }
        let data = newnode.data;
        data['description'] = result;
        data['isSource'] = true;
        newnode.data = data;
        console.log(fn.isSource());
        // TODO find proximate description node
        // Annotate the treenode
      }
    },
    uploadFiles(node) {
      // build array of all new folders and files in order.
      // ingest folders and files in order.
      var q = new Promise(() => { console.log("Ingest starting..." )});
      var counter = 0;
      let lt = new lth(node);
      lt.depthFirstChildren().forEach( child => {
        if(child.data.new) {
          let p = ingest(this, child);
          q = q.then(p);
          q.then(() => {
            counter++;
          });
        }
      });
      q.then(() => {
        submissionHasUploads(node, false);
        console.log(counter+" objects ingested.");
      });
    },
    flattenFolders(node) {
      var submissionNode = node;
      let lh = new lth(node);
      lh.depthFirstChildren().forEach( child => {
        if(child.data.new && !child.data.isfolder) {
          child.parent.children.splice(child.parent.children.indexOf(child), 1);
          submissionNode.append(child);
        }
      });
      lh.depthFirstChildren().forEach( child => {
        if(child.data.new && child.data.isfolder) {
          child.parent.children.splice(child.parent.children.indexOf(child), 1);
        }
      });
      submissionNode.children = submissionNode.children.sort(alphaSort);
    },
    getPath(node) {
      new lth(node).makePath()
    }
  },
  data: function() {
    return {
      dragAndDropCapable: false,
      currentNode: undefined,
      currentSubmission: undefined,
      rdfdetails: undefined,
      descdetails: undefined,
      activetab: 1,
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
              container = store.sym(base_container.uri + ((basepath) ? basepath : '/'));
            } else if('rdf' in node.data) {
              container = store.sym(node.data.rdf.uri);
            }
            //console.log('getting child data');
            //console.log(container);
            fetcher.load(container).then(() => {
              let result = makeViewData(node, container);
              if(node.id == 'root') {
                result.forEach((node) => {
                  node.data['isSubmission'] = true;
                });
              }
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
.feather {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  vertical-align: text-bottom;
}
form {
  display: block;
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px;
  border: 0px;
}

span.new {
  color: green;
}
</style>
