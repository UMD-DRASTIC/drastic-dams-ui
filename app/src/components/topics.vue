<template>
  <div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <div class="tabs">
          <a v-on:click="activetab=1" v-bind:class="[ activetab === 1 ? 'active' : '' ]">Entity Resolution</a>
          <a v-on:click="activetab=2" v-bind:class="[ activetab === 2 ? 'active' : '' ]">NABWH People</a>
          <a v-on:click="activetab=3" v-bind:class="[ activetab === 3 ? 'active' : '' ]">NABWH Organizations</a>
      </div>

      <div class="content">
          <div v-if="activetab === 1" class="tabcontent">
            <div class="row">
            <div class="col-md-6">
              <h4>Named Entities Recognized in Text</h4>
            <div style="height: 650px">
              <div class="h-100 w-100 overflow-scroll">
              <b-list-group>
                <b-list-group-item action :active="activeProposedEntity == e"
                 v-for="e, idx in unresolvedEntities" :key="e.e.value"
                 @click="activate(e, idx)">
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1"><span class="badge bg-secondary">{{ e.l.value }} &nbsp;&nbsp;<font-awesome-icon :icon="icon(e.t.value)" /></span></h5>
                    <small v-if="!e.resolved">Unresolved</small>
                  </div>
                  in {{ e.title.value }} <br /><a :href="e.i.value">{{ path(e) }}</a>
                </b-list-group-item>
              </b-list-group>
            </div>
            </div>
            </div>
            <div class="col-md-6">
              <h4>Resolve to NABWH Name Authority Records</h4>
              <div class="tabs">
                  <a v-on:click="subtab=0" v-bind:class="[ subtab === 0 ? 'active' : '' ]">All Concepts <span class="badge rounded-pill bg-primary">{{ conceptHits.length }}</span></a>
                  <a v-on:click="subtab=1" v-bind:class="[ subtab === 1 ? 'active' : '' ]">People <span class="badge rounded-pill bg-primary">{{ personHits.length }}</span></a>
                  <a v-on:click="subtab=2" v-bind:class="[ subtab === 2 ? 'active' : '' ]">Organizations <span class="badge rounded-pill bg-primary">{{ organizationHits.length }}</span></a>
                  <a v-on:click="subtab=3" v-bind:class="[ subtab === 3 ? 'active' : '' ]">Places <span class="badge rounded-pill bg-primary">{{ placeHits.length }}</span></a>
              </div>
              <div class="content">
                <div v-if="subtab === 0" class="tabcontent">
                  <div>
                    <a target="locsearch" :href="loc_query(activeProposedEntity.l.value)">Search for "{{ activeProposedEntity.l.value }}" in the LOC Name Authority File</a>
                  </div>
                  <p />
                  <b-card
                    v-for="h in conceptHits" :key="h.id"
                    :title="h.prefLabel"
                    img-src="https://picsum.photos/600/300/?image=25"
                    img-alt="Image"
                    img-top
                    tag="article"
                    style="max-width: 26rem;"
                    class="mb-2"
                    footer-tag="footer"
                  >
                    <b-list-group>
                      <b-list-group-item
                        v-for="l in excludeTerm(h.labels, h.prefLabel)" :key="l"
                      >{{ l }}
                      </b-list-group-item>
                    </b-list-group>
                    <p />
                    <b-button @click="resolve(h.id)" variant="primary">Resolve</b-button>
                    <template #footer>
                      <small class="text-muted">LOC: <a :href="h.id">{{ h.id.substring(h.id.lastIndexOf("/")+1, h.id.length) }}</a></small>
                    </template>
                  </b-card>
                  <div v-if="conceptHits.length < 1">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">No concepts match in local records.</h5>
                    </div>
                  </div>
                </div>
                <div v-if="subtab === 1" class="tabcontent">
                  <div>
                    <a target="locsearch" :href="loc_query_person(activeProposedEntity.l.value)">Search for personal name "{{ activeProposedEntity.l.value }}" in the LOC Name Authority File</a>
                  </div>
                  <p />
                  <b-card
                    v-for="h in personHits" :key="h.id"
                    :title="h.prefLabel"
                    img-src="https://picsum.photos/600/300/?image=25"
                    img-alt="Image"
                    img-top
                    tag="article"
                    style="max-width: 20rem;"
                    class="mb-2"
                    footer-tag="footer"
                  >
                    <b-list-group>
                      <b-list-group-item
                        v-for="l in excludeTerm(h.labels, h.prefLabel)" :key="l"
                      >{{ l }}
                      </b-list-group-item>
                    </b-list-group>
                    <p />
                    <b-button @click="resolve(h.id)" variant="primary">Resolve</b-button>
                    <template #footer>
                      <small class="text-muted">LOC: <a :href="h.id">{{ h.id.substring(h.id.lastIndexOf("/")+1, h.id.length) }}</a></small>
                    </template>
                  </b-card>
                  <div v-if="conceptHits.length < 1">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">No personal names match in local records.</h5>
                    </div>
                  </div>
                </div>
                <div v-if="subtab === 2" class="tabcontent">
                  <div>
                    <a target="locsearch" :href="loc_query_organization(activeProposedEntity.l.value)">Search for corporate name "{{ activeProposedEntity.l.value }}" in the LOC Name Authority File</a>
                  </div>
                  <p />
                  <b-card
                    v-for="h in organizationHits" :key="h.id"
                    :title="h.prefLabel"
                    img-src="https://picsum.photos/600/300/?image=25"
                    img-alt="Image"
                    img-top
                    tag="article"
                    style="max-width: 26rem;"
                    class="mb-2"
                    footer-tag="footer"
                  >
                    <b-list-group>
                      <b-list-group-item
                        v-for="l in excludeTerm(h.labels, h.prefLabel)" :key="l"
                      >{{ l }}
                      </b-list-group-item>
                    </b-list-group>
                    <p />
                    <b-button @click="resolve(h.id)" variant="primary">Resolve</b-button>
                    <template #footer>
                      <small class="text-muted">LOC: <a :href="h.id">{{ h.id.substring(h.id.lastIndexOf("/")+1, h.id.length) }}</a></small>
                    </template>
                  </b-card>
                  <div v-if="conceptHits.length < 1">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">No organization names match in local records.</h5>
                    </div>
                  </div>
                </div>
                <div v-if="subtab === 3" class="tabcontent">
                  <div>
                    <a target="locsearch" :href="loc_query_place(activeProposedEntity.l.value)">Search for geographic name "{{ activeProposedEntity.l.value }}" in the LOC Name Authority File</a>
                  </div>
                  <p />
                  <b-card
                    v-for="h in placeHits" :key="h.id"
                    :title="h.prefLabel"
                    img-src="https://picsum.photos/600/300/?image=25"
                    img-alt="Image"
                    img-top
                    tag="article"
                    style="max-width: 26rem;"
                    class="mb-2"
                    footer-tag="footer"
                  >
                    <b-list-group>
                      <b-list-group-item
                        v-for="l in excludeTerm(h.labels, h.prefLabel)" :key="l"
                      >{{ l }}
                      </b-list-group-item>
                    </b-list-group>
                    <p />
                    <b-button @click="resolve(h.id)" variant="primary">Resolve</b-button>
                    <template #footer>
                      <small class="text-muted">LOC: <a :href="h.id">{{ h.id.substring(h.id.lastIndexOf("/")+1, h.id.length) }}</a></small>
                    </template>
                  </b-card>
                  <div v-if="conceptHits.length < 1">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">No place names match in local records.</h5>
                    </div>
                  </div>
                </div>
              </div>
              <p />
              <h4>Resolve to Ignore</h4>
              <b-button variant="primary" @click="ignore()">Ignore</b-button>
              <p />
              <h4>Resolve to LOC Term and Import</h4>
              <div class="">
                <b-form-group
                  id="fieldset-1"
                  description="Import a new LOC term and resolve this entity to the term."
                  label="Enter a URI from LOC Name Authority"
                  label-for="input-1"
                  valid-feedback="Thank you!"
                  :invalid-feedback="invalidLOCURIFeedback"
                  :state="stateLOCURI"
                >
                  <b-form-input placeholder="http://id.loc.gov/authorities/names/n79007751" id="input-1" v-model="locuri" :state="stateLOCURI" trim></b-form-input>
                </b-form-group>
                <b-button variant="primary" @click="importResolve(locuri)">Import and Resolve..</b-button>
              </div>
            </div>
            </div>
          </div>

          <div v-if="activetab === 2" class="tabcontent">
            Create, Read, Update, and Delete of person name authority records specific to the
            NABWH. (Revisions are posted to a versioned SKOS resource at /name-authority/People_NABWH_SKOS.)
            Authority records may also be created through the entity resolution workflow.
          </div>

          <div v-if="activetab === 3" class="tabcontent">
            Create, Read, Update, and Delete of organization name authority records specific to the
            NABWH. (Revisions are posted to a versioned SKOS resource at /name-authority/Organizations_NABWH_SKOS.)
            Authority records may also be created through the entity resolution workflow.
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
const fuseki_baseurl = 'http://localhost:3030/ds/query';
const elasticsearch_url = 'http://localhost:9200/authority-records/_search';

export default {
  name: 'Topics',
  methods: {
    ignore: function() {
      let item_uri = this.activeProposedEntity.i.value;
      let entity_uri = this.activeProposedEntity.e.value;
      fetch(item_uri, {
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/sparql-update",
          'Accept': 'application/json'
        },
        "body": `INSERT {
          <${entity_uri}> <https://example.nps.gov/2021/nps-workflow#entityResolution> <https://example.nps.gov/2021/nps-workflow#entityIgnored> .
          } WHERE {}`
      }).then(response => {
        if (response.ok || response.status == 406) {
          this.unresolvedEntities[this.activeProposedEntityIndex].resolved = true;
          this.activate(this.unresolvedEntities[this.activeProposedEntityIndex+1], this.activeProposedEntityIndex+1);
        } else {
          alert("HTTP-Error: " + response.status);
        }
      })
    },
    importResolve: function(loc_uri) {
      var my_uri = loc_uri;
      if (!my_uri.startsWith("https")) {
        my_uri = "https"+my_uri.substring(4, my_uri.length);
      }
      fetch(my_uri+".json", {
        "headers": {
          'Accept': 'application/json'
        }
      }).then(response => response.text())
      .then(body => {
        var uri = "http://localhost:9090/name-authority/";
        if(body.includes("http://www.loc.gov/mads/rdf/v1#Geographic")) {
          uri += "place/";
        } else if (body.includes("http://www.loc.gov/mads/rdf/v1#PersonalName")) {
          uri += "person/"
        } else if (body.includes("http://www.loc.gov/mads/rdf/v1#CorporateName")) {
          uri += "organization/"
        }
        uri += loc_uri.substring(loc_uri.lastIndexOf("/")+1, loc_uri.length)
        alert(uri);
        fetch(uri, {
          "method": "PUT",
          "headers": {
            "Link": "<http://www.w3.org/ns/ldp#RDFSource>; rel=\"type\"",
            "Content-Type": "application/ld+json"
          },
          "body": body
        }).then( resp => {
          this.resolve(loc_uri);
        });
      });
    },
    resolve: function(id) {
      let item_uri = this.activeProposedEntity.i.value;
      let name_uri = id;
      let entity_uri = this.activeProposedEntity.e.value;
      fetch(item_uri, {
        "method": "PATCH",
        "headers": {
          'Content-Type': 'application/sparql-update',
          'Accept': 'application/json'
        },
        "body": `INSERT {
          <${entity_uri}> <https://example.nps.gov/2021/nps-workflow#entityResolution> <${name_uri}> .
          <${item_uri}> <http://purl.org/dc/terms/subject> <${name_uri}> .
          } WHERE {}`
      }).then(response => {
        if (response.ok || response.status == 406) {
          alert(this.activeProposedEntityIndex);
          this.unresolvedEntities[this.activeProposedEntityIndex].resolved = true;
          this.activate(this.unresolvedEntities[this.activeProposedEntityIndex+1], this.activeProposedEntityIndex+1);
        } else {
          alert("HTTP-Error: " + response.status);
        }
      })
    },
    excludeTerm: function(list, excluded) {
      var result = list.filter(l => {
        if(l.trim() === excluded.trim()) return false;
        return true;
      });
      return result;
    },
    loc_query: function(query) {
      return "https://id.loc.gov/search/?q="+ encodeURIComponent(query) +"&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fnames";
    },
    loc_query_person: function(query) {
      return "https://id.loc.gov/search/?q=rdftype:PersonalName&q="+ encodeURIComponent(query) +"&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fnames";
    },
    loc_query_organization: function(query) {
      return "https://id.loc.gov/search/?q=rdftype:CorporateName&q="+ encodeURIComponent(query) +"&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fnames";
    },
    loc_query_place: function(query) {
      return "https://id.loc.gov/search/?q=rdftype:Geographic&q="+ encodeURIComponent(query) +"&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fnames";
    },
    fetchProposed: async function() {
      fetch(fuseki_baseurl, {
          body: `select ?i ?e ?t ?l ?title WHERE { GRAPH ?g {
               ?i <https://example.nps.gov/2021/nps-workflow#hasProposedEntity> ?e .
               ?e <https://example.nps.gov/2021/nps-workflow#entityType> ?t  .
               ?e <https://example.nps.gov/2021/nps-workflow#entityText> ?l .
               FILTER NOT EXISTS { ?e <https://example.nps.gov/2021/nps-workflow#entityResolution> ?z . }
               OPTIONAL { ?i <http://purl.org/dc/terms/title> ?title }
          } }`,
          method: "POST",
          headers: {
            'Content-Type': 'application/sparql-query; charset=utf-8',
            'Accept': 'application/json'
          }
        }).then(resp => resp.json())
        .then(json => {
          this.unresolvedEntities = json.results.bindings;
          this.activate(this.unresolvedEntities[0], 0);
        });
    },
    icon: function(e) {
      if('https://example.nps.gov/2021/tika/meta#NER_PERSON' == e) {
        return 'fa-person fa-xl';
      } else if ('https://example.nps.gov/2021/tika/meta#NER_ORGANIZATION' == e) {
        return 'fa-users fa-xl';
      } else if ('https://example.nps.gov/2021/tika/meta#NER_LOCATION' == e) {
        return 'fa-map-location-dot fa-xl';
      } else {
        return 'fa-tag fa-xl';
      }
    },
    subtab_lookup: function(type) {
      if('https://example.nps.gov/2021/tika/meta#NER_PERSON' == type) {
        return 1;
      } else if ('https://example.nps.gov/2021/tika/meta#NER_ORGANIZATION' == type) {
        return 2;
      } else if ('https://example.nps.gov/2021/tika/meta#NER_LOCATION' == type) {
        return 3;
      } else {
        return 1;
      }
    },
    activate: function(e, idx) {
      this.activeProposedEntity = e;
      this.activeProposedEntityIndex = idx;
      this.lookup(e);
      this.subtab = this.subtab_lookup(e.t.value);
    },
    path: function(e) {
      let url = new URL(e.i.value);
      return url.pathname;
    },
    lookup: async function(e) {
      let keywords = e.l.value;
      fetch(elasticsearch_url, {
          body: JSON.stringify({"query": {"match": {"labels": keywords}}}),
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
          }
        }).then(resp => resp.json())
        .then(json => {
          this.conceptHits.splice(0, this.conceptHits.length)
          this.personHits.splice(0, this.personHits.length)
          this.organizationHits.splice(0, this.organizationHits.length)
          this.placeHits.splice(0, this.placeHits.length)
          json.hits.hits.forEach((item, i) => {
            this.conceptHits.push(item._source);
            if(item._source.type == "person") { this.personHits.push(item._source) }
            if(item._source.type == "organization") { this.organizationHits.push(item._source) }
            if(item._source.type == "place") { this.placeHits.push(item._source) }
          });
        });
    }
  },
  mounted() {
    this.fetchProposed();
  },
  computed: {
    stateLOCURI() {
      return this.locuri.length > 8 &&
       (this.locuri.startsWith("http://id.loc.gov/authorities/names") ||
       this.locuri.startsWith("https://id.loc.gov/authorities/names"))
    },
    invalidLOCURIFeedback() {
      if (this.locuri.length > 8) {
        return 'Enter a valid LOC URI.'
      }
      return 'Please look up and enter a LOC URI.'
    }
  },
  data: function() {
    return {
      unresolvedEntities: [],
      activetab: 1,
      subtab: 1,
      activeProposedEntity: { "l": {"value": "#"} },
      activeProposedEntityIndex: -1,
      conceptHits: [],
      personHits: [],
      organizationHits: [],
      placeHits: [],
      locuri: ""
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
