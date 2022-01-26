<template>
  <div class="container-fluid">
    <div class="row">
    <h2>Archival Description</h2>
  </div>
  <div class="row">
    <div class="scroll col-md-4">
      <tree df:data="fetchData" :options="treeOptions" df:filter="filter" ref="tree">
        <span class="tree-text" slot-scope="{ node }">
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
         {{ c }} »
         </span>
      </div>
      <div class="tabs">
          <a v-on:click="activetab=1" v-bind:class="[ activetab === 1 ? 'active' : '' ]">Description</a>
          <a v-on:click="activetab=3" v-bind:class="[ activetab === 3 ? 'active' : '' ]">System</a>
      </div>

      <div class="content">
          <div v-if="activetab === 1" class="tabcontent">
            <div v-for="s in icmsProps" :key="s[0]+s[1]" class="row">
              <div class="label col-md-4">{{ s[0] }}</div>
              <div class="col-md-8">{{ s[1] }}</div>
            </div>
          </div>
          <div v-if="activetab === 3" class="tabcontent">
            <div v-for="s in systemProps" :key="s[0]+s[1]" class="row">
              <div class="label col-md-6">{{ s[0] }}</div>
              <div class="label col-md-6">{{ s[1] }}</div>
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
const ldp_baseurl = 'http://localhost:9090';
const path = '/description/';
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
    focus: async function(oldNode, newNode) {
      let node = newNode && newNode.text ? newNode : oldNode
      let container = store.sym(base_container.uri + makePath(node));
      fetcher.load(container).then(() => {
        this.rdfdetails = store.statementsMatching(container, undefined, undefined);
        this.currentpath = makePath(node);
      }).catch(e => console.log(e));
    },
  },
  mounted() {
    this.$refs.tree.$on("node:selected", this.focus);
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
      segs.shift();
      segs.shift();
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

div.label {
  overflow-wrap: break-word;
}


</style>
