<template>
  <div class="container-fluid">
    <div class="row">
    <h2>Archival Description</h2>
  </div>
  <div class="row">
    <div class="scroll col-md-4">
      <tree df:data="fetchData" :options="treeOptions" df:filter="filter" ref="tree">
        <span class="tree-text" slot-scope="{ node }" @click="focus($event, node)">
          <template v-if="!node.hasChildren()">
            <i class="ion-android-star"></i>
            {{ node.text }}
          </template>
          <template v-else>
            <i :class="[node.expanded() ? 'ion-android-folder-open' : 'ion-android-folder']"></i> {{ node.text }}
          </template>
        </span>
        <Uploader />
      </tree>
    </div>
    <div id="tabs" class="col-md-8" v-if="rdfdetails && rdfdetails.length > 0">
      <div class="container">
         <span v-for="(c, index) in crumbs" :key="index" class="crumb">
           >> {{ c }}
         </span>
      </div>
    <div class="tabs">
        <a v-on:click="activetab=1" v-bind:class="[ activetab === 1 ? 'active' : '' ]">Description</a>
        <a v-on:click="activetab=2" v-bind:class="[ activetab === 2 ? 'active' : '' ]">Related Assets</a>
        <a v-on:click="activetab=3" v-bind:class="[ activetab === 3 ? 'active' : '' ]">System</a>
    </div>

    <div class="content">
        <div v-if="activetab === 1" class="tabcontent">
          <div v-for="s in icmsProps" :key="s[0]" class="row">
            <div class="col-md-3">{{ s[0] }}</div>
            <div class="col-md-9">{{ s[1] }}</div>
          </div>
        </div>
        <div v-if="activetab === 2" class="tabcontent">
            Content for tab two
        </div>
        <div v-if="activetab === 3" class="tabcontent">
          <div v-for="s in systemProps" :key="s[0]" class="row">
            <div class="col-md-6">{{ s[0] }}</div>
            <div class="col-md-6">{{ s[1] }}</div>
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
const $rdf = require('rdflib');
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const ldp_baseurl = 'http://0.0.0.0/';
const path = 'description/';
const base_container = store.sym(ldp_baseurl);
const re_icms = /<https:\/\/rediscoverysoftware\.com\/schema\/icms_ns\/(.*)>/

function makeViewData(tree_node, container) {
  let contents = store.each(container, LDP('contains'));
  let result = [];
  for (var i=0; i<contents.length; i++) {
    let n = {id:null};
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

function makePath(tree_node) {
  if(tree_node.id == 'root') {  // get base node
    if(path == '/') {
      return "";
    } else {
      return path;
    }
  }
  var segments = [];
  for(var n = tree_node; n != null; n = n.parent) {
    segments.push(n.data.text);
  }
  let result = path + segments.reverse().join('/');
  if(tree_node.isBatch) { result += "/"; }
  return result;
}

export default {
  name: 'Description',
  components: {
    'tree': LiquorTree
  },
  methods: {
    focus: async function(e, node) {
      let container = store.sym(base_container.uri + makePath(node));
      fetcher.load(container).then(() => {
        this.rdfdetails = store.statementsMatching(container, undefined, undefined);
        this.currentpath = makePath(node);
        console.log(e, this.rdfdetails);
      }).catch(e => console.log(e));

    },
  },
  mounted() {
  },
  computed: {
    icmsProps: function () {
      return this.rdfdetails.filter(s => re_icms.test(s.predicate)).map(
        v => {
          let result = [];
          result[0] = String(v.predicate).match(re_icms)[1];
          result[1] = v.object;
          return result;
        }
      ).filter(foo => foo[0] != "RediscoveryExport");
    },
    systemProps: function () {
      return this.rdfdetails.filter(s => !re_icms.test(s.predicate)).map(
        v => {
          let result = [];
          result[0] = v.predicate;
          result[1] = v.object;
          return result;
        }
      );
    },
    crumbs: function() {
      let segs = this.currentpath.split('/');
      segs.pop();
      return segs;
    }
  },
  data: function() {
    return {
      rdfdetails: [],
      activetab: 1,
      currentpath: "/",
      treeOptions: {
        propertyNames: {
          //text: 'text',
          children: 'contents'
        },
        minFetchDelay: 1000,
        fetchData: node => {
          return new Promise(function (resolve) {
            let container = store.sym(base_container.uri + makePath(node));
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
div.scroll {
  width: 50%;
}
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
  /* color: #42b983;*/
}

span.crumb {
  font-weight: bolder;
  font-size: larger;
}

/* Style the tabs */
.tabs {
    overflow: hidden;
  margin-left: 20px;
    margin-bottom: -2px;
}

.tabs ul {
    list-style-type: none;
    margin-left: 20px;
}

.tabs a{
    float: left;
    cursor: pointer;
    padding: 12px 24px;
    transition: background-color 0.2s;
    border: 1px solid #ccc;
    border-right: none;
    background-color: #f1f1f1;
    border-radius: 10px 10px 0 0;
    font-weight: bold;
}
.tabs a:last-child {
    border-right: 1px solid #ccc;
}

/* Change background color of tabs on hover */
.tabs a:hover {
    background-color: #aaa;
    color: #fff;
}

/* Styling for active tab */
.tabs a.active {
    background-color: #fff;
    color: #484848;
    border-bottom: 2px solid #fff;
    cursor: default;
}

/* Style the tab content */
.tabcontent {
    padding: 30px;
    border: 1px solid #ccc;
    border-radius: 10px;
  box-shadow: 3px 3px 6px #e1e1e1
}
</style>
