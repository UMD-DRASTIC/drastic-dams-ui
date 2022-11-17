<template>
  <div v-if="esItem">
    <b-modal id="modal-view" size="xl" :title="esItem.title[0]" cancel-disabled="true">
      <div class="container">
        <div class="row">
          <div class="imgcon col-md-8">
            <div class="container">
              <a href="/maximize">
                  <img :src="pageImageURI" width="100%" />
              </a>
              <div class="imnav">
                  <a :class="{disabled: !prevPage}" @click="prevPage()">
                      <div class="prim control"><b-icon icon="arrow-bar-left" font-scale="10"></b-icon></div>
                  </a>
                  <a :href="pageImageURI">
                      <div class="zmim control"><b-icon icon="zoom-in" font-scale="10"></b-icon></div>
                  </a>
                  <a :class="{disabled: !nextPage}" @click="nextPage()">
                      <div class="neim control"><b-icon icon="arrow-bar-right" font-scale="10"></b-icon></div>
                  </a>

              </div>
            </div>
          </div>
          <div class="metadata col-md-4">
            <table class="metadata">
              <tbody>
                <tr><th>Title</th><td>{{ esItem.title[0] }}</td></tr>
                <tr><th>Creator</th><td>{{ esItem.creator[0] }}</td></tr>
                <tr><th>Description</th><td>{{ esItem.description[0] }}</td></tr>
                <tr><th>Date</th><td>{{ esItem.date[0] }}</td></tr>
                <tr><th>Subject</th><td>{{ esItem.subject[0] }}</td></tr>
                <tr><th>Rights</th><td>{{ esItem.rights[0] }}</td></tr>
                <tr><th>Identifier</th><td>{{ esItem.identifier[0] }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
const $rdf = require('rdflib');

export default {
  data() {
    return {
      esItem: null,
      pageProxy: null,
      nextProxy: null,
      prevProxy: null,
      doc: null,
      pageImageURI: null,
    };
  },
  emits: ['view'],
  created() {
    this.rdfStore = $rdf.graph();
    this.rdfFetcher = new $rdf.Fetcher(this.rdfStore);
    this.PCDM = $rdf.Namespace('http://pcdm.org/models#');
    this.PCDM_OBJECT = this.PCDM('Object');
    this.IANA = $rdf.Namespace('http://www.iana.org/assignments/relation/');
    this.ORE = $rdf.Namespace('http://www.openarchives.org/ore/terms/');
    this.NPS = $rdf.Namespace('https://example.nps.gov/2021/nps-workflow#');
  },
  methods: {
    open: function(item) {
      this.rdfStore = $rdf.graph();
      this.rdfFetcher = new $rdf.Fetcher(this.rdfStore);
      console.log('open', item);
      this.esItem = item;
      this.doc = $rdf.sym(item.uri);
      let me = this;
      this.rdfFetcher.unload(this.doc);
      this.rdfFetcher.load(this.doc, {
        force: true,
        headers: { Prefer: 'return=representation; include="http://www.w3.org/ns/ldp#PreferContainment"',
                   Accept: "text/turtle",
                   'Cache-Control': 'no-cache' }
        }).then(() => {
          let pageProxy = me.rdfStore.any(me.doc, me.IANA('first'), undefined);
          me.page(pageProxy);
          me.$bvModal.show("modal-view");
        });
    },
    page: function(proxy) {
      this.pageProxy = proxy;
      console.log("page", proxy);
      let srcImg = this.rdfStore.any(this.pageProxy, this.ORE('proxyFor'), undefined);
      let accessImg = this.rdfStore.any(srcImg, this.NPS('hasAccess'), undefined);
      this.pageImageURI = accessImg.uri;
      this.nextProxy = this.rdfStore.any(this.pageProxy, this.IANA('next'), undefined);
      this.prevProxy = this.rdfStore.any(this.pageProxy, this.IANA('prev'), undefined);
    },
    nextPage: function() {
      this.page(this.nextProxy);
    },
    prevPage: function() {
      this.page(this.prevProxy);
    }
  },
  computed: {
  }
};
</script>

<style>
.imgcon {
    position:relative;
    width:660px;
    margin:0 auto;
}

.imnav {
    color: #ffffff;
    margin:0 auto;
    opacity:0.6;
    display:none;
    position:absolute;
    top:0;
    left:0px;
    width:100%;
    height:100%;
}

.imgcon:hover .imnav{display:inline-block;}

.control {
    display: flex;
    float:left;
    height:100%;
    width:33%;
    opacity:0;
    justify-content: center;
    align-items: center;
}

.control:hover {
    opacity:0.6;
}

.prim{
    text-align: right;
}
.zmim{
    width:34%;
    text-align: center;
}
.neim{
    text-align: left;
}

table.metadata > tbody > tr {
  border-top: 2px solid gray;
}

table.metadata > tbody > tr > th {
  text-align: left;
  vertical-align: top;
  padding-right: 1em;
}
</style>
