<template>
  <div class="container-fluid">
    <div class="row">
      <h2>Submissions</h2>
      <div style="padding-left: 5em">&nbsp;&nbsp;&nbsp;&nbsp;<CreateSubmission /></div>
    </div>
    <div class="row">
      <div class="scroll col-md-6">
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
                  <a v-if="node.data.hasUploads" class="btn-sm btn-info" v-on:click.stop.prevent="uploadFiles(node)">Upload</a>
                </template>
                <template v-else-if="node.data.types.includes(BC.value) && !node.data.new">
                  <feather type="folder" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-else-if="node.data.types.includes(BC.value) && node.data.new">
                  <feather type="folder-plus" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-if="node.data.types.includes(NRS.value) && !node.data.new">
                  <feather type="file" /> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
                <template v-if="node.data.types.includes(NRS.value) && node.data.new">
                  <feather type="file-plus" v-if="node.data.types.includes(NRS.value)"/>
                  <feather type="link" v-if="node.data.linked"/>
                  &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                  <a v-if="node.data.metadata" class="btn-sm btn-info" v-on:click.stop.prevent="harvestDCSheet(node)">Extract Dublin Core</a>
                  &nbsp;&nbsp;<progress v-if="'file' in node.data" max="100" :value.prop="node.data.uploadPercentage">{{ node.data.uploadPercentage }}</progress>
                </template>
                <template v-if="node.data.types.includes(RS.value)">
                  <feather type="layers"/> &nbsp;&nbsp;&nbsp;&nbsp; {{ node.text }}
                </template>
              </form>
            </div>
          </span>
        </tree>
      </div>
      <div class="col-md-6" v-if="currentNode">
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
              <template v-if="this.currentNode.data.metadata">
                This spreadsheet file contains metadata for multiple items.
                Push the <a class="btn-sm btn-info">Extract</a> button next to the file name to create an
                RDF object that contains the extracted metadata. Upon ingest the metadata
                will describe the appropriate objects in the repository.
              </template>
              <template v-if="this.currentNode.data.types.includes(RS.value) && this.currentNode.data.new">
                <p><strong>Content (text/turtle)</strong></p>
                <pre>{{ this.currentNode.data.turtle }}</pre>
              </template>
          </div>
          <div v-if="activetab === 2" class="tabcontent">
            <a v-if="hasRelatedObjectOf" v-bind:href="relatedObjectOf">Finding aid location: {{ relatedObjectOf }}</a>
            <template v-for="s in rdfProps">
            <div :key="s[0]+s[1]" v-if="s[0].startsWith('<http://purl.org/dc/elements/1.1/')" class="row">
              <div class="col-md-3">{{ s[0] }}</div>
              <div class="col-md-9">{{ s[1] }}</div>
            </div>
            </template>
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
/* eslint-disable no-unused-vars */
import LiquorTree from 'liquor-tree'
import dtransfers from '../assets/js/dtransfers.js'
import Treehelp from '../assets/js/treehelp.js'
import filenames from '../assets/js/filenames'
import sheet from '../assets/js/nps-sheets'

const $rdf = require('rdflib');

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

// function buildUploadTree(rawfiles, node) {
//   let uploads = [];
//   let files = rawfiles.sort((a, b) => {
//     return a.fullPath.localeCompare(b.fullPath)
//   });
//   for (var i = 0; i < files.length; i++) {
//     var chain = files[i].fullPath.split('/');
//     chain.shift();
//     var currentNode = node;
//
//     // FIXME node:added events work only when adding file to empty folder
//     for (var j = 0; j < chain.length; j++) {
//         var wantedText = chain[j];
//         var lastNode = currentNode;
//         // find or insert required folders
//         let newNode = {id: null, data: {new: true, types: [BC.value]}, text: wantedText, children: []};
//         if(j == chain.length-1) { // last index is the file itself
//           newNode.data.types = [NRS.value];
//           newNode.data['file'] = files[i];
//           newNode.data['uploadPercentage'] = 0;
//         }
//         for (var k = 0; k < currentNode.children.length; k++) {
//             if (currentNode.children[k].data.text == wantedText) {
//                 currentNode = currentNode.children[k];
//                 break;
//             } else if (currentNode.children[k].data.text.localeCompare(wantedText) > 0 ) {
//                 currentNode.children[k].before(newNode);
//                 currentNode = currentNode.children[k];
//                 break;
//             }
//         }
//         if (lastNode == currentNode) {
//             currentNode = currentNode.append(newNode);
//             let node_path = new Treehelp(currentNode).makePath(basepath).replace(/ /g,'_');
//             var node_uri = ldp_baseurl + node_path
//             if(currentNode.data.types.includes(BC.value)) {
//               node_uri = node_uri + '/';
//             }
//             currentNode.data['rdf'] = store.sym(node_uri);
//         }
//     }
//   }
// }

// function ingest(it, node) {
//   let parent_path = new Treehelp(node.parent).makePath(basepath).replace(/ /g,'_');
//   var parenturi = ldp_baseurl + parent_path + '/';
//   console.log("building ingest req for "+node.data.text+" at "+parenturi);
//   if(node.data.types.includes(BC.value)) {
//     let head = {
//       'Content-Type': 'application/ld+json',
//       'Link': `<${BC.value}>; rel="type"`,
//       'Slug': node.data.text
//     };
//     return it.$http({
//         method: 'post',
//         url: parenturi,
//         headers: head
//     }).then(resolve => {
//       setTimeout(resolve, 200);
//     });
//   } else if(node.data.types.includes(NRS.value)) {
//     let entry = node.data.file;
//     return new Promise((resolve) => {
//       entry.file((file) => { resolve(file) });
//     }).then((file) => {
//       it.$http.post( parenturi, file,
//         { headers: {
//           'Link': `<${NRS.value}>; rel="type"`,
//           'Slug': encodeURIComponent(file.name.replace(/\|/g, '')).replace(/'/g, '%27'),
//           'Content-Type': 'application/octet-stream'},
//           onUploadProgress: function( progressEvent ) {
//             node.data.uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
//           }.bind(it)
//         }
//       );
//     }).catch( function(error) {
//       node.data.failed = true;
//       console.log('FAILURE!!', error);
//     });
//   } else if(node.data.types.includes(RS.value)) {
//     if('turtle' in node.data) {
//       it.$http.post( parenturi, node.data.turtle,
//         { headers: {
//           'Link': `${RS.value}; rel="type"`,
//           'Slug': node.data.text,
//           'Content-Type': 'text/turtle'},
//           onUploadProgress: function( progressEvent ) {
//             node.data.uploadPercentage = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
//           }.bind(it)
//         }
//       );
//     }
//   }
// }

// Find keys in o1 that are missing in o2
function differenceKeyset(o1, o2)
{
    var differenceSet = new Set();
    console.log(Object.keys(o1));
    Object.keys(o1).forEach( (key) => {
        if(!(key in o2)) {
          differenceSet.add(key);
        }
    });
    return differenceSet;
}

export default {
  name: 'Submissions',
  props: {
    activityStreamWebSocketUrl: {  // like 'ws://localhost:9090/notifier'
      required: true,
      type: String,
    },
    ldpUrl: {  // like 'http://localhost:9090';
      required: true,
      type: String
    },
    submissionsPath: {
      type: String,
      default:  '/submissions/'
    }
  },
  components: {
    'tree': LiquorTree
  },
  created() {
    this.LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
    this.R = this.LDP('Resource');
    this.RS = this.LDP('RDFSource');
    this.NRS = this.LDP('NonRDFSource');
    this.BC = this.LDP('BasicContainer');
    this.PCDM = $rdf.Namespace('http://pcdm.org/models#');
    this.DCE = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
    this.rdfStore = $rdf.graph();
    this.rdfFetcher = new $rdf.Fetcher(this.rdfStore);
    this.baseContainer = this.rdfStore.sym(this.ldpUrl + this.submissionsPath);
    this.activityStreamWebSocket = new WebSocket(this.activityStreamWebSocketUrl);
    this.activityStreamWebSocket.onmessage = ({ data }) => {
      const activityMessage = JSON.parse(data);
      this.updateTree(activityMessage)
      // TODO log this event in UI list
    };
    this.activityStreamWebSocket.onopen = function(event) {
      console.log(event)
      console.log("Successfully connected to the echo websocket server...")
    }
    this.activityStreamWebSocket.onerror = function(event) {
      console.log(event)
      console.log("Error with websocket...")
    }
  },
  mounted() {
    this.dragAndDropCapable = determineDragAndDropCapable();
    this.$refs.tree.$on("node:selected", this.focus);
    // TODO move logic to server-side this.$refs.tree.$on("node:added", this.uploadAdded);
    //this.$refs.tree.$on("node:added", this.uploadAdded);
  },
  computed: {
    crumbs: function() {
      let segs = new Treehelp(this.currentNode).makePath().split('/');
      segs.pop();
      return segs;
    },
    isimage: function() {
      let re_img = /.*\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|SVG)/
      return re_img.test(this.currentNode.text);
    },
    hasRelatedObjectOf: function() {
      let d = this.rdfStore.statementsMatching(this.currentNode.data.rdf, this.PCDM('relatedObjectOf'), undefined);
      return d.length > 0;
    },
    nodeurl: function() {
      return this.baseContainer.uri + new Treehelp(this.currentNode).makePath(this.submissionsPath);
    },
    rdfProps: function () {
      let rdfdetails = this.rdfStore.statementsMatching(this.currentNode.data.rdf, undefined, undefined);
      return rdfdetails.map(
        v => {
          let result = [];
          result[0] = String(v.predicate);
          result[1] = v.object;
          return result;
        }
      );
    },
    relatedObjectOf: function() {
      return this.rdfStore.each(this.currentNode.data.rdf, this.PCDM('relatedObjectOf'))[0];
    }
  },
  methods: {
    fetchData: function(node) {
      let me = this;
      return new Promise(function (resolve) {
        var container = null;
        if(node.id == 'root') {  // get base node
          container = me.rdfStore.sym(me.baseContainer.uri);
        } else if('rdf' in node.data) {
          container = me.rdfStore.sym(node.data.rdf.uri);
        }
        console.log(me.rdfStore);
        me.rdfFetcher.unload(container);
        me.rdfFetcher.load(container, {'force': true}).then(() => {
          let result = me.makeViewData(node, container);
          if(node.id == 'root') {
            result.forEach((node) => {
              node.data['isSubmission'] = true;
            });
          }
          resolve(result);
        }).catch(e => console.log(e));
      });
    },
    makeViewData: function(tree_node, container) {
      let contents = this.rdfStore.each(container, this.LDP('contains'));
      let result = [];
      for (var i=0; i<contents.length; i++) {
        let n = {id:null, data: { rdf: contents[i] } };
        if(contents[i].uri.endsWith("/")) {
          n.data['types'] = [this.BC.value];
          n.data['new'] = false;
          n['text'] = contents[i].uri.split('/').reverse()[1];
          n['isBatch'] = true;
        } else {
          n.data['types'] = [];
          n.data['new'] = false;
          n['text'] = contents[i].uri.split('/').reverse()[0];
        }
        result.push(n);
      }
      result.sort(alphaSort);
      this.subscribe(container.uri);
      return result;
    },
    updateTree: function(activityMessage) {
      const url = new URL(activityMessage.object.id);
      console.log("updating: "+url);
      let relPath = url.pathname.substring(this.submissionsPath.length);
      let segments = relPath.split('/');
      if(relPath.endsWith('/')) {
        segments.pop();
      }
      let slug = segments.pop();
      let parentPath = segments.join('/');
      switch(activityMessage.type[1]) {
        case "Update":
          if(relPath == "") { // tree root is special case
            this.fetchData({'id': 'root'}).then((children) => {
              var oldChildMap = {};
              this.$refs.tree.tree.model.forEach((c) => { oldChildMap[c.data.text] = c });
              var neuw = {};
              children.forEach((c) => { neuw[c.text] = c });
              differenceKeyset(oldChildMap, neuw).forEach((name) => {
                console.log('removing '+name+' at root');
                oldChildMap[name].remove();
              })
              differenceKeyset(neuw, oldChildMap).forEach((name) => {
                console.log('adding '+name+' at root');
                this.$refs.tree.addChild(neuw[name]);
              })
              this.$refs.tree.sortTree(alphaSort);
            });
          } else {
            var vue = new Treehelp(this.$refs.tree).findVue(relPath);
            var ltnode = vue.node;
            console.log(ltnode);
            this.fetchData(ltnode).then((children) => {
              console.log(children);
              var oldChildMap = {};
              ltnode.children.forEach((c) => { oldChildMap[c.data.text] = c });
              var neuw = {};
              children.forEach((c) => { neuw[c.text] = c });
              differenceKeyset(oldChildMap, neuw).forEach((name) => {
                console.log('removing '+name+' at '+ltnode.data.text);
                oldChildMap[name].remove();
              })
              differenceKeyset(neuw, oldChildMap).forEach((name) => {
                console.log('adding '+name+' at '+ltnode.data.text);
                ltnode.addChild(neuw[name]);
              })
              let data = ltnode.data;
              ltnode.data = data;
              this.$refs.tree.sortTree(alphaSort);
            });
          }
          break;
      }
    },
    enqueueIngests: function(rawfiles, node) {
      let ingests = [];
      let folders = {};
      let files = rawfiles.sort((a, b) => {
        return a.fullPath.localeCompare(b.fullPath)
      });
      for (var i = 0; i < files.length; i++) {
        var chain = files[i].fullPath.split('/');
        chain.shift();
        var currentNode = node;
        for (var j = 0; j < chain.length; j++) {
            var lastNode = currentNode;
            var slug = chain[j];
            let path = new Treehelp(currentNode).makePath(this.submissionsPath).replace(/ /g,'_');
            var parenturi = this.ldpUrl + path + '/';
            var newuri = parenturi+slug;
            if(j == chain.length-1) { // last index is the file itself
              // this is a file
              let ingest = {parent_uri: parenturi, types: [this.BC.value], slug: slug};
              ingest.types = [this.NRS.value];
              ingest['file'] = files[i];
              // TODO ingest the file
            } else {
              // this is a container
              if(folders[newuri]) {
                continue;
              } else {
                folders[newuri] = true;
                // TODO ingest the folder
              }
            }
        }
      }
    },
    drop: async function(e, node) {
      node.expand();
      let files = await new dtransfers(e.dataTransfer).getAllFileEntries();
      this.enqueueIngests(files, node);
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
      //let uri = store.sym(base_container.uri + new Treehelp(node).makePath(basepath));
      //fetcher.load(uri).then(() => {
      //  this.rdfdetails = store.statementsMatching(uri, undefined, undefined);
      //}).catch(e => console.log(e));
    },
    subscribe: async function(uri) {
      console.log('subscribe called for: '+uri)
      this.activityStreamWebSocket.send(JSON.stringify({subscribe: uri}))
    },
    uploadAdded: async function(parent, newnode) {
      console.log(newnode)
      console.log(this.NRS.value)
      if(newnode.data.types.includes(this.NRS.value) && newnode.data.new) {
        console.log(newnode);
        let fn = new filenames(newnode.data.file.name);

        if(fn.isDCSheet()) {
          let data = newnode.data;
          data['metadata'] = true;
          data.sheet = new sheet(newnode.data.file);
          newnode.data = data;
          newnode.data.sheet.loadWorkbook();
        }
        // Locate nearest existing finding aid object and add a pcdm:relatedObjectOf link.
        let paths = fn.getDescriptionPaths();
        let result = null;
        for( let i = 0; i < paths.length; i++) {
          let base_container = this.rdfStore.sym(this.ldpUrl);
          let desc = this.rdfStore.sym(base_container.uri + '/description' + paths[i]);
          await this.rdfFetcher.load(desc).then(() => {
            result = desc;
          }).catch(() => {
            console.log(paths[i]+ ' not found');
          });
          if (result != null) {
            break;
          }
        }
        if(result != null) {
          let data = newnode.data;
          this.rdfStore.add(data.rdf, this.PCDM('relatedObjectOf'), result);
          data['linked'] = true;
          newnode.data = data;
        }
      }
    },
    // uploadFiles(node) {
    //   // build array of all new folders and files in order.
    //   // ingest folders and files in order.
    //   var q = new Promise(() => { console.log("Ingest starting..." )});
    //   var counter = 0;
    //   let lt = new Treehelp(node);
    //   lt.depthFirstChildren().forEach( child => {
    //     if(child.data.new) {
    //       let p = this.ingest(this, child);
    //       q = q.then(p);
    //       q.then(() => {
    //         counter++;
    //       });
    //     }
    //   });
    //   q.then(() => {
    //     submissionHasUploads(node, false);
    //     console.log(counter+" objects ingested.");
    //   });
    // },
    getPath(node) {
      return new Treehelp(node).makePath();
    },
    harvestDCSheet(node) {
      let dcuri = this.ldpUrl + '/submissions/' + this.getPath(node) + '/' + 'Extracted-Dublin-Core';
      node.expand();
      let turtle = node.data.sheet.harvestDC(this.ldpUrl+'/description/');
      let newNode = {id: null, data: {new: true, types: [this.RS.value], turtle: turtle }, text: "Extracted-Dublin-Core"};
      node.append(newNode);
    }
  },
  data: function() {
    return {
      dragAndDropCapable: false,
      currentNode: undefined,
      currentSubmission: undefined,
      rdfdetails: undefined,
      descdetails: undefined,
      //ldp_baseurl: ldp_baseurl,
      activetab: 1,
      treeOptions: {
        propertyNames: {
          children: 'contents'
        },
        minFetchDelay: 1000,
        fetchData: this.fetchData,
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
a.btn-info {
  color: #ffffff;
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
