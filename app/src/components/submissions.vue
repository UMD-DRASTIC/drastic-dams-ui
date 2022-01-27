<template>
  <div class="container-fluid d-flex flex-column h-100">
    <div class="row">
      <h2>Submissions</h2>
      <div style="padding-left: 5em">
        &nbsp;&nbsp;&nbsp;&nbsp;
        <div style='display: inline'>
        <button id="show-modal" @click="showCreateModal = true; setCreateFocus();">Create Submission</button>
        <transition name="modal" v-if="showCreateModal" @close="showCreateModal = false">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container">

                <div class="modal-header">
                  <slot name="header">
                    Create Submission
                  </slot>
                </div>

                <div class="modal-body">
                  <div v-if="isCreateError">error</div>
                  <div v-else-if="isCreateLoading">loading</div>
                  <div v-else>
                    <form v-on:submit="createSubmission(createSubmissionName); showCreateModal = false;">
                      <input ref="submissionNameInput" v-model="createSubmissionName" :placeholder="'enter submission name..'">
                    </form>
                  </div>
                </div>

                <div class="modal-footer">
                  <slot name="footer">
                    <button class="modal-default-button" @click="showCreateModal = false">
                      CANCEL
                    </button>
                    <button class="modal-default-button" @click="createSubmission(createSubmissionName); showCreateModal = false;">
                      OK
                    </button>
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </transition>
        </div>
      </div>
    </div>
    <div class="row h-70">
      <div class="col-md-6 overflow-auto" style="overflow-y: scroll; height: 700px">
        <tree df:data="fetchData" dafdv-slot:default="slotProps" :options="treeOptions" df:filter="filter" ref="tree">
          <span class="tree-text" slot-scope="{ node }" >
            <div id="file-drag-drop" style='display: inline'>
              <form
                @drag.stop.prevent
                @dragstart.stop.prevent
                @dragend.stop.prevent
                @dragover.stop.prevent
                @dragenter.stop.prevent
                @dragleave.stop.prevent
                @drop.stop.prevent="drop($event, node)">
                <template>
                  <feather :type="icon(node.data.rdf)" />
                  &nbsp;&nbsp; {{ node.data.text }} &nbsp;&nbsp;
                  <template v-if="is(node.data.rdf, NRS) && node.data.rdf.value.endsWith('.tif')">
                    <span style="font-family: 'Courier New', monospace;">
                      <span style="color: red" v-if="node.data.md5Manifest == null">[</span>
                      <span v-else>[</span>
                      <span style="color: red" v-if="node.data.md5Manifest == null || node.data.md5System == null || node.data.md5System != node.data.md5Manifest">≠</span>
                      <span v-else>=</span>
                      <span style="color: red" v-if="node.data.md5System == null">]</span>
                      <span v-else>]</span>
                    </span>
                  </template>
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
          <h2><template v-if="is(currentNode.data.rdf, SUBMISSION)">Submission: </template>{{ currentNode['text'] }}</h2>
        </div>

        <div class="tabs">
          <a v-on:click="activetab=1" v-bind:class="[ activetab === 1 ? 'active' : '' ]">View</a>
          <a v-on:click="activetab=2" v-bind:class="[ activetab === 2 ? 'active' : '' ]">Description</a>
          <a v-on:click="activetab=3" v-bind:class="[ activetab === 3 ? 'active' : '' ]">Provenance</a>
          <a v-on:click="activetab=4" v-bind:class="[ activetab === 4 ? 'active' : '' ]">Technical Data</a>
        </div>

        <div class="content">
          <div v-if="activetab === 1" class="tabcontent">
              <img v-if="isimage" :src="nodeurl" :key="getPath(currentNode)" class="img-fluid" style="padding-top: 5px; max-height: 500px">
              <template v-if="is(currentNode.data.rdf, SUBMISSION)">
                <p>Submission Package Status: <span style="color: green">Preparing</span></p>
                <ol>
                  <li>Drag and drop scanned page files onto the submission package icon or below<br />

                    <div @drag.stop.prevent
                    @dragstart.stop.prevent
                    @dragend.stop.prevent
                    @dragover.stop.prevent
                    @dragenter.stop.prevent
                    @dragleave.stop.prevent
                    @drop.stop.prevent="drop($event, currentNode)" id="dropPad">
                      <input type="file" name="files[]" id="file" class="box__file" data-multiple-caption="{count} files selected" multiple />
                      <label for="file"><strong>Choose files</strong><span class="box__dragndrop"> or drag them here</span>.</label>
                    </div>
                  </li>
                  <li>Upload an MD5 manifest (Excel file: ???_MD5.xslx).</li>
                  <li>Wait for fixity calculations to complete..</li>
                  <li>Review fixity status of uploaded files. (Red indicates an issue.)</li>
                  <li>Upload a Dublin Core metadata (Excel file: ???_inventory.xslx).</li>
                  <li>Do you expect to create <span style="color: green">{{ currentNode.data.docsExpected }}</span> documents with <span style="color: green">{{ currentNode.data.pages }}</span> pages in total?</li>
                  <li>If so, click on <button @click="makePagedDocuments(currentNode.data.rdf.uri)">Make Documents</button> to create document structures.</li>
                  <li>Review document structures</li>
                  <li>All documents should be linked to a folder in the archival description.</li>
                  <li>If this submission package is complete, click on <button @click="ingest()">Ingest</button> to make it official.</li>
                </ol>
              </template>
              <template v-else-if="is(currentNode.data.rdf, PCDM_OBJECT)">
                <div>
                <template v-for="(s, idx) in pcdmPageImages">
                  <img height="50" :src="s" v-bind:key="idx" />
                </template>
                </div>
                <p><strong><a v-bind:href="this.currentNode.data.rdf.uri">Raw content link (text/turtle)</a></strong></p>
              </template>
              <template v-else-if="is(currentNode.data.rdf, NRS)">
                <p><strong><a target="_blank" v-bind:href="this.currentNode.data.rdf.uri">Raw file link</a></strong></p>
              </template>
              <template v-else-if="is(currentNode.data.rdf, RS)">
                <p><strong><a v-bind:href="this.currentNode.data.rdf.uri">Raw content link (text/turtle)</a></strong></p>
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
              <div v-for="(s, index) in rdfProps" v-bind:key="index" dfkey="s[0]+s[1]" class="row">
                <div class="col-md-3">{{ s[0] }}</div>
                <div class="col-md-9">{{ s[1] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="row mt-auto h-100 col-md-12 mb-3">
      <div class="scroll col-md-12">
        <h4>Actions</h4>
        <table class="table table-hover">
          <thead>
            <tr>
        <th tabindex="0" style="" data-field="id">
          <div class="th-inner both">#</div>
          <div class="fht-cell"></div>
        </th>
        <th tabindex="0" style="" data-field="name">
          <div class="th-inner both">Type</div>
          <div class="fht-cell"></div>
        </th>
        <th tabindex="0" style="" data-field="price">
          <div class="th-inner both">Location</div>
          <div class="fht-cell"></div>
        </th>
        <th tabindex="0" style="" data-field="price">
          <div class="th-inner both">Progress</div>
          <div class="fht-cell"></div>
        </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(action, index) in ldpActions" v-bind:key="index">
               <td>{{ index }}</td><td>{{ action.type }}</td><td>{{ action.uri }}</td><td><progress max="100" :value.prop="action.progress">{{ action.progress }}</progress></td>
            </tr>
          </tbody>
        </table>
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
const posix = require('path-posix')
const path = require('path');

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

// Find keys in o1 that are missing in o2
function differenceKeyset(o1, o2)
{
    var differenceSet = new Set();
    Object.keys(o1).forEach( (key) => {
        if(!(key in o2)) {
          differenceSet.add(key);
        }
    });
    return differenceSet;
}

function Queue() {
    this.elements = [];
}
Queue.prototype.enqueue = function (e) {
    if(this.isEmpty()) {
        this.elements.push(e);
    } else if(this.elements[this.elements.length -1] != e) {
        this.elements.push(e);
    }
};
Queue.prototype.dequeue = function () {
    return this.elements.shift();
};
Queue.prototype.isEmpty = function () {
    return this.elements.length == 0;
};
Queue.prototype.peek = function () {
    return !this.isEmpty() ? this.elements[0] : undefined;
};
Queue.prototype.length = function() {
    return this.elements.length;
}

export default {
  name: 'Submissions',
  props: {
    asWebSocketURL: {  // like 'ws://localhost:9090/notifier'
      required: true,
      type: String,
    },
    ldpURL: {  // like 'http://localhost:9090';
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
    this.PCDM_OBJECT = this.PCDM('Object');
    this.IANA = $rdf.Namespace('http://www.iana.org/assignments/relation/');
    this.ORE = $rdf.Namespace('http://www.openarchives.org/ore/terms/');
    this.DCE = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
    this.RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    this.NPS = $rdf.Namespace('https://example.nps.gov/2021/nps-workflow#');
    this.SUBMISSION = this.NPS('submission');
    this.PREMIS = $rdf.Namespace('http://www.loc.gov/standards/premis/rdf/v3/');
    this.MD5 = $rdf.sym('http://id.loc.gov/vocabulary/cryptographicHashFunctions/md5');
    this.rdfStore = $rdf.graph();
    this.rdfFetcher = new $rdf.Fetcher(this.rdfStore);
    this.baseContainer = this.rdfStore.sym(this.ldpURL + this.submissionsPath);
    this.updateTimer = null;
    this.updateQueue = new Queue();
    this.activityStreamWebSocket = new WebSocket(this.asWebSocketURL);
    this.activityStreamWebSocket.onmessage = ({ data }) => {
      const activityMessage = JSON.parse(data);
      // make update async and consolidate events
      if(activityMessage.type[1] == "Update") {
        var urlstr = activityMessage.object.id;
        if(urlstr.indexOf('?') >= 0) {
          urlstr = urlstr.substring(0, urlstr.indexOf('?'));
        }
        this.updateQueue.enqueue(urlstr);
      }
    };
    this.activityStreamWebSocket.onopen = function(event) {
      //console.log("Successfully connected to the activity stream websocket.")
    };
    this.activityStreamWebSocket.onerror = function(event) {
      console.log(event)
      console.log("Error with websocket...")
    };
  },
  mounted() {
    this.dragAndDropCapable = determineDragAndDropCapable();
    this.$refs.tree.$on("node:selected", this.focus);
    let me = this;
    this.$refs.tree.$on("tree:mounted", function(treecomponent) {
      me.$refs.tree.model.forEach((c) => { me.calculateNodeData(c); });
    });
    this.$refs.tree.$on("tree:data:received", function(parentNode) {
      me.calculateNodeData(parentNode);
      parentNode.children.forEach((c) => { me.calculateNodeData(c); });
    });
    this.$refs.tree.$on("node:added", function(oldNode, newNode) {
      let node = newNode && newNode.data.text ? newNode : oldNode;
      me.calculateNodeData(node);
    });
    this.timer = setTimeout(this.processQueue, 5000);
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
      return this.ldpURL + new Treehelp(this.currentNode).makePath(this.submissionsPath);
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
    pcdmPageImages: function() {
      console.log('called');
      let result = [];
      let g = this.currentNode.data.rdf;
      let first = this.rdfStore.any(this.currentNode.data.rdf, this.IANA('first'));
      console.log('first '+ first);
      for(let p = first; p != null; p = this.rdfStore.any(p, this.IANA('next'))) {
        let page = this.rdfStore.any(p, this.ORE('proxyFor'));
        let images = this.rdfStore.each(page, this.PCDM('hasFile'));
        for(let i in images) {
          console.log(images[i]);
          if(images[i].value.endsWith('_ACCESS.png')) {
            result.push(images[i].value);
          }
        }
        if(images.length == 0) {
          result.push("/missingimage.png")
        }
      }
      return result;
    },
    relatedObjectOf: function() {
      return this.rdfStore.each(this.currentNode.data.rdf, this.PCDM('relatedObjectOf'))[0];
    }
  },
  methods: {
    setCreateFocus: function() {
      this.$nextTick(() => this.$refs.submissionNameInput.focus());
    },
    createSubmission: async function(name) {
      try {
        this.isCreateLoading = true;
        let head = {
          'Content-Type': 'text/turtle',
          'Link': `<${ this.BC.value }>; rel="type"`,
          'Slug': name
        };
        await this.$http.post(this.ldpURL + this.submissionsPath,
          `<> a <${this.NPS('submission').value}> .`,
          { headers: head }
        );
      } catch(err) {
        console.log(err);
        this.isCreateError = true;
      } finally {
        this.isCreateLoading = false;
      }
    },
    is: function(rdfnode, type) {
      let matches = this.rdfStore.statementsMatching(rdfnode, this.RDF('type'), type);
      return matches.length > 0;
    },
    icon: function(rdfnode) {
      if(this.is(rdfnode, this.SUBMISSION)) {
        return 'archive';
      } else if (this.is(rdfnode, this.BC)) {
        return 'folder';
      } else if (this.is(rdfnode, this.RS)) {
        return 'layers';
      } else {
        return 'file';
      }
    },
    fixitySeverity: function(rdfnode) {
      if(this.fixityExists(rdfnode)) {
        if(this.manifestFixityExists(rdfnode)) {
          if(this.fixityValid(rdfnode)) {
            return "info"
          }
        }
        return "warn";
      } else {
        return "error";
      }
    },
    fixityExists: function(rdfnode) {
      let matches = this.rdfStore.statementsMatching(rdfnode, this.PREMIS('fixity'), undefined);
      return matches.length > 0;
    },
    manifestFixityExists: function(rdfnode) {
      this.rdfStore.each(rdfnode, this.PREMIS('fixity'), undefined)
      .forEach(fixity => {
        if(this.rdfStore.statementsMatching(fixity, this.DCE('source'), undefined) > 0) {
          return true;
        }
      })
      return false;
    },
    getManifestMD5: function(rdfnode) {
      var result = null;
      let fs = this.rdfStore.each(rdfnode, this.PREMIS('fixity'), undefined);
      let graph = $rdf.sym(rdfnode.value+'?ext=description');
      for(let f in fs) {
        if(this.rdfStore.statementsMatching(fs[f], this.DCE('source'), undefined, graph).length == 0) {
          continue;
        }
        if(this.rdfStore.statementsMatching(fs[f], this.RDF('type'), this.MD5, graph).length == 0) {
          continue;
        }
        result = this.rdfStore.any(fs[f], this.RDF('value'), undefined, graph).value;
        break;
      }
      return result;
    },
    getSystemMD5: function(rdfnode) {
      var result = null;
      let fs = this.rdfStore.each(rdfnode, this.PREMIS('fixity'), undefined);
      let graph = $rdf.sym(rdfnode.value+'?ext=description');
      for(let f in fs) {
        let creator = this.rdfStore.any(fs[f], this.DCE('creator'), undefined, graph);
        if(this.rdfStore.any(fs[f], this.DCE('creator'), undefined, graph).value != 'java.security.MessageDigest') {
          continue;
        }
        if(this.rdfStore.statementsMatching(fs[f], this.RDF('type'), $rdf.sym('http://id.loc.gov/vocabulary/cryptographicHashFunctions/md5'), graph).length == 0) {
          continue;
        }
        result = this.rdfStore.any(fs[f], this.RDF('value'), undefined, graph).toString();
        break;
      }
      return result;
    },
    fetchData: function(node) {
      let me = this;
      return new Promise(function (resolve) {
        var container = null;
        if(node.id == 'root') {  // get base node
          container = me.baseContainer;
        } else if('rdf' in node.data) {
          container = node.data.rdf;
        }
        me.rdfFetcher.unload(container);
        me.rdfFetcher.load(container, {'force': true}).then(() => {
          let contents = me.rdfStore.each(container, me.LDP('contains'));
          let loadList = [];
          for (var i=0; i<contents.length; i++) {
            let loadLoc = contents[i].uri;
            if(!loadLoc.endsWith('/')) {
              loadList.push(loadLoc + "?ext=description");
            } else {
              loadList.push(loadLoc);
            }
          }
          // TODO Some of these are files.. and need ?ext=description
          me.rdfFetcher.load(loadList, {'force': true}).then(() => {
            let result = [];
            for (var i=0; i<contents.length; i++) {
              let n = {id:null, data: { rdf: contents[i] } };
              if(contents[i].uri.endsWith("/")) {
                //n.data['types'] = [this.BC.value];
                n['text'] = contents[i].uri.split('/').reverse()[1];
                n['isBatch'] = true;
              } else {
                //n.data['types'] = [];
                n['text'] = contents[i].uri.split('/').reverse()[0];
                n['isBatch'] = true;
              }
              result.push(n);
              me.subscribe(contents[i].uri);
            }
            result.sort(alphaSort);
            me.subscribe(container.uri);
            resolve(result);
          });
        }).catch(e => console.log(e));
      });
    },
    calculateNodeData: function(node) {
      if(node.id == 'root') return;
      if(this.is(node.data.rdf, this.NRS)) {
        console.log('updating '+node.data.text);
        node.data['md5Manifest'] = this.getManifestMD5(node.data.rdf);
        node.data['md5System'] = this.getSystemMD5(node.data.rdf);
      }
      if(this.is(node.data.rdf, this.SUBMISSION)) {
        let data = this.submissionContent(node.data.rdf);
        node.data['docsExpected'] = data[0];
        node.data['docsActual'] = data[1];
        node.data['pages'] = data[2];
      }
      let data = node.data;
      node.data = data;
    },
    submissionContent: function(submission) {
      let contents = this.rdfStore.each(submission, this.LDP('contains'));
      var docsExpected = new Set();
      var docsActual = 0;
      var pages = 0;
      for (var i=0; i<contents.length; i++) {
        let c = contents[i];
        if(this.is(c, this.NRS)) {
          var name = c.uri.slice(c.uri.lastIndexOf('/')+1);
          var fn = new filenames(name);
          if(!fn.isSource()) continue;
          var paths = fn.getDescriptionPaths();
          if(paths.length == 0) continue;
          let docPath = paths[1];
          console.log('docpath: '+ docPath);
          docsExpected.add(docPath);
          pages += 1;
        } else if (this.is(c, this.DOCUMENT)) {
          docsActual += 1;
        }
      }
      return [docsExpected.size, docsActual, pages];
    },
    processQueue: function() {
      while(!this.updateQueue.isEmpty()) {
        var next = this.updateQueue.dequeue();
        this.updateNode(next);
      }
      this.timer = setTimeout(this.processQueue, 5000);
    },
    updateNode: function(urlstr) {
      console.log('updateNode '+urlstr)
      const url = new URL(urlstr);
      let relPath = url.pathname.substring(this.submissionsPath.length);
      let segments = relPath.split('/');
      if(relPath.endsWith('/')) {
        segments.pop();
      }
      let slug = segments.pop();
      let parentPath = segments.join('/');
      let rdfnode = null;
      let ltnode = null;
      let oldChildMap = {};
      if(relPath == "") { // tree root is special case
        ltnode = this.$refs.tree;
        rdfnode = this.baseContainer;
        this.$refs.tree.tree.model.forEach((c) => { oldChildMap[c.data.text] = c });
      } else {
        console.log("relpath "+relPath)
        console.log("vuenode");
        console.log(new Treehelp(this.$refs.tree).findVue(relPath));
        ltnode = new Treehelp(this.$refs.tree).findVue(relPath).node;
        rdfnode = ltnode.data.rdf;
        ltnode.children.forEach((c) => { oldChildMap[c.data.text] = c });
      }
      let loadList = [];
      if(!rdfnode.uri.endsWith('/')) {
        loadList.push(rdfnode.uri + "?ext=description");
      } else {
        loadList.push(rdfnode.uri);
      }
      for(let x in loadList) { this.rdfFetcher.unload($rdf.sym(loadList[x])); }
      this.rdfFetcher.load(loadList, {'force': true}).then(() => {
        if(relPath != "") {
          this.calculateNodeData(ltnode);
        }
        let data = ltnode.data;
        ltnode.data = data;
        let contents = this.rdfStore.each(rdfnode, this.LDP('contains'));
        var neuw = {};
        for (var i=0; i<contents.length; i++) {
          let c = {id:null, data: { rdf: contents[i] }};
          if(contents[i].uri.endsWith("/")) {
            c['text'] = contents[i].uri.split('/').reverse()[1];
            c['isBatch'] = true;
          } else {
            c['text'] = contents[i].uri.split('/').reverse()[0];
            c['isBatch'] = true;
          }
          neuw[c.text] = c;
        }
        differenceKeyset(oldChildMap, neuw).forEach((name) => {
          oldChildMap[name].remove();
        });
        differenceKeyset(neuw, oldChildMap).forEach((name) => {
          let uri = neuw[name].data.rdf.uri;
          this.subscribe(uri);
          let loadChildList = [];
          if(!uri.endsWith('/')) {
            loadChildList.push(uri + "?ext=description");
          } else {
            loadChildList.push(uri);
          }
          this.rdfFetcher.load(loadChildList, {'force': true}).then(() => {
            ltnode.addChild(neuw[name]);
            this.$refs.tree.sortTree(alphaSort);
          });
        });
      });
    },
    enqueueIngests: function(rawfiles, node) {
      let ingests = [];
      let folders = {};
      let files = rawfiles.sort((a, b) => {
        return a.fullPath.localeCompare(b.fullPath)
      });
      for (var i = 0; i < files.length; i++) {
        var chain = files[i].fullPath.split(path.sep);  // TODO test Win32 paths
        chain.shift();
        var currentNode = node;
        for (var j = 0; j < chain.length; j++) {
            var slug = chain[j];
            let ldpPath = new Treehelp(currentNode).makePath(this.submissionsPath).replace(/ /g,'_');
            let ingestRelPath = chain.slice(0, j).join('/');
            var parenturi = this.ldpURL + posix.join(ldpPath, ingestRelPath);
            var newuri = this.ldpURL + posix.join(ldpPath, ingestRelPath, slug);
            if(j == chain.length-1) { // last index is the file itself
              this.uploadFile(parenturi, slug, files[i]);
            } else {
              // this is a container
              if(folders[newuri]) {
                continue;
              } else {
                folders[newuri] = true;
                this.createFolder(parenturi, slug);
              }
            }
        }
      }
    },
    uploadFile: function(parenturi, slug, file) {
      console.log("building ingest req for "+slug+" at "+parenturi);
      var action = {'type': 'Upload', 'uri': parenturi+'/'+slug, 'progress': 0, 'error': null};
      this.ldpActions.push(action);
      return new Promise((resolve) => {
        file.file((file) => { resolve(file) });
      }).then((file) => {
        this.$http.post( parenturi, file,
          { headers: {
            'Link': `<${this.NRS.value}>; rel="type"`,
            'Slug': encodeURIComponent(file.name.replace(/\|/g, '')).replace(/'/g, '%27'),
            'Content-Type': 'application/octet-stream'},
            onUploadProgress: function( progressEvent ) {
              action.progress = parseInt( Math.round( ( progressEvent.loaded / progressEvent.total ) * 100 ));
            }.bind(this)
          }
        );
      }).catch( function(error) {
        action.error = error;
        console.log('FAILURE!!', error);
      });
    },
    createFolder: function(parenturi, slug) {
      var action = {'type': 'Create Folder', 'uri': parenturi+slug, 'progress': 0, 'error': null};
      this.ldpActions.push(action);
      let head = {
         'Content-Type': 'application/ld+json',
         'Link': `<${this.BC.value}>; rel="type"`,
         'Slug': slug
       };
       this.$http({
           method: 'post',
           url: parenturi,
           headers: head
       }).then(resolve => {
         setTimeout(resolve, 200);
         action.progress = 100;
       }).catch( function(error) {
         action.error = error;
         console.log('FAILURE!!', error);
       });
    },
    drop: async function(e, node) {
      node.expand();
      let files = await new dtransfers(e.dataTransfer).getAllFileEntries();
      this.enqueueIngests(files, node);
    },
    focus: async function(oldNode, newNode) {
      let node = newNode && newNode.data.text ? newNode : oldNode
      this.currentNode = node;
      for(let s = node; s != undefined; s = s.parent) {
        if(s.data.isSubmission == true) {
          this.currentSubmission = s;
          break;
        }
      }
    },
    makePagedDocuments: function(uri) {
      return new Promise(() => {
        this.activityStreamWebSocket.send(JSON.stringify({makePagedDocuments: uri}));
      });
    },
    subscribe: function(uri) {
      return new Promise(() => {
        this.activityStreamWebSocket.send(JSON.stringify({subscribe: uri}));
        if(!uri.endsWith('/')) {
          this.activityStreamWebSocket.send(JSON.stringify({subscribe: uri+'?ext=description'}));
        }
      });
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
          let base_container = this.rdfStore.sym(this.ldpURL);
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
    getPath(node) {
      return new Treehelp(node).makePath();
    },
    harvestDCSheet(node) {
      let dcuri = this.ldpURL + '/submissions/' + this.getPath(node) + '/' + 'Extracted-Dublin-Core';
      node.expand();
      let turtle = node.data.sheet.harvestDC(this.ldpURL+'/description/');
      let newNode = {id: null, data: {new: true, types: [this.RS.value], turtle: turtle }, text: "Extracted-Dublin-Core"};
      node.append(newNode);
    }
  },
  data: function() {
    return {
      showCreateModal: false,
      createSubmissionName: '',
      isCreateLoading: false,
      isCreateError: false,
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
      },
      ldpActions: [],
      ldpActionFields: [ 'type', 'uri', 'progress' ]
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
/* li {
  display: inline-block;
  margin: 0 10px;
} */
a {
  color: #42b983;
}
a.btn-info {
  color: #ffffff;
}
table td, table th {
  padding: 0px;
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

div#dropPad
{
  font-size: 1.25rem; /* 20 */
  background-color: #c8dadf;
  position: relative;
  padding: 100px 20px;
}
div#dropPad
{
  text-align: center;
  outline: 2px dashed #92b0b3;
  outline-offset: -10px;
  -webkit-transition: outline-offset .15s ease-in-out, background-color .15s linear;
  transition: outline-offset .15s ease-in-out, background-color .15s linear;
}

span.new {
  color: green;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 80vmin;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}
</style>
