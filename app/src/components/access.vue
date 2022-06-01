<template>
  <div id="bg" class="container-fluid h-100">
    <div class="container mt-4">
      <div class="row d-flex justify-content-center">
          <div class="col-md-12">
              <div class="card p-2 mt-4">
                <b-collapse visible id="collapse-welcome">
                  <h3 class="heading mt-4 text-center">Hi! How can we help you?</h3>
                </b-collapse>
                  <div class="d-flex justify-content-center px-5">
                    <SearchHeader v-model="searchInputValue" @submit="handleFormSubmit" />
                  </div>
                  <div class="text-center justify-content-center px-5">
                    <b-collapse id="collapse-1" class="mt-2">
                      <b-card>
                        <p class="card-text">Search / View History Shown Here</p>
                      </b-card>
                    </b-collapse>
                    <div>
                      <b-button v-b-toggle.collapse-1 size="sm" variant="link-secondary">
                        <span class="when-closed"><b-icon icon="arrow-bar-down" font-scale="1"></b-icon></span>
                        <span class="when-open"><b-icon icon="arrow-bar-up" font-scale="1"></b-icon></span>
                      </b-button>
                    </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <div class="row p-3">
      <div class="col-md-3">
        <div class="card p-3 h-100 description-box"><h4>Descriptive Hierarchy</h4>
          <PathFacet
            v-show="thereAreResults"
            :checked="checked_pathfacet"
            :facets="pathfacets"
            @change="handlePathFacetChange($event)"
          />
        </div>
      </div>
      <div class="col-md-6">
        <div class="row justify-content-center">
          <div class="col-md-12">
            <nav class="" v-if="resultsPagingRequired" aria-label="Page navigation">
              <ul class="justify-content-center pagination">
                  <li class="page-item">
                      <button type="button" class="page-link" aria-label="Previous" v-on:click="changePageToPrevious()">
                          <span aria-hidden="true">&laquo;</span>
                      </button>
                  </li>
                  <li v-for="page in Math.min(10, totalPages)" v-bind:key="page" class="page-item">
                      <button type="button" class="page-link" v-on:click="changePageTo(page)">
                          <span aria-hidden="true">{{ page }}</span>
                      </button>
                  </li>
                  <li class="page-item">
                      <button type="button" class="page-link" aria-label="Next" v-on:click="changePageToNext()">
                          <span aria-hidden="true">&raquo;</span>
                      </button>
                  </li>
              </ul>
            </nav>
          </div>
          <div class="col-md-2">
            <!-- <SearchSort v-show="thereAreResults" v-model="sortBy" /> -->
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 p-3">
            <SearchResults @pathfacet="pathfacet" @view="view"
              v-show="thereAreResults"
              :results="results"
            />
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card p-3 h-100"><h4>Related Topics</h4>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 fixed-bottom fw-bold flex-md-nowrap p-4 pb-0 shadow">
        <div class="card p-0 text-center">
          <b-collapse id="collapse-fav" class="mt-2">
              <p class="card-text">Your Browser-Saved References Shown Here</p>
          </b-collapse>
            <b-button v-b-toggle.collapse-fav size="sm" variant="link-secondary">
              <span class="when-open"><b-icon icon="arrow-bar-down" font-scale="1"></b-icon></span>
              <span class="when-closed"><b-icon icon="arrow-bar-up" font-scale="1"></b-icon></span>
            </b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
//import { SearchDriver } from "@elastic/search-ui";
//import config from "../searchConfig";
import SearchResults from "./SearchResults";
//import SearchSort from "./SearchSort";
//import SearchFacet from "./SearchFacet";
import PathFacet from "./PathFacet";
import SearchHeader from "./SearchHeader";

//const { Client } = require('@elastic/elasticsearch');
//const client = new Client({node: 'http://localhost:9200'});
//const { errors } = require('@elastic/elasticsearch')
//console.log(errors)

export default {
  name: 'Access',
  components: {
    SearchResults,
    //SearchSort,
    //SearchFacet,
    PathFacet,
    SearchHeader
  },
  data() {
    return {
      resultsPerPage: 20,
      sortBy: "relevance",
      searchInputValue: "",
      currentPage: 0,
      totalResults: 0,
      results: [],
      levels: [],
      checked_levels: [],
      pathfacets: {},
      checked_pathfacet: "",
      resultsPagingRequired: false,
      totalPages: 0,
      tooManyPages: false,
    };
  },
  computed: {
    thereAreResults() {
      return this.totalResults && this.totalResults > 0;
    }
  },
  watch: {
    resultsPerPage(newResultsPerPage) {
      this.resultsPerPage = newResultsPerPage;
    },
    sortBy(newSortBy) {
      this.sortBy = newSortBy;
    }
  },
  created() {
    this.handleFormSubmit();
  },
  methods: {
    view: function(uri) {
      console.log("viewing: "+uri);
    },
    pathfacet: function(path) {
      console.log("pathfacet: "+path);
      this.checked_pathfacet = path;
      this.currentPage = 1;
      this.handleFormSubmit();
    },
    handleFormSubmit: function() {
      // defaults when no path selected
      var min_depth = 0;
      var max_depth = 0;
      var searchfilter = [];
      if(this.checked_pathfacet.trim().length > 0) {
        searchfilter.push({ "term": { "pathfacet" : this.checked_pathfacet } });
        max_depth = this.checked_pathfacet.split("/").length-1;
      }
      var facetfilter =
      {
        "bool": {
          //"must_not":[ { "term": { "pathfacet": "1" } }, { "term": { "pathfacet": "G1" } } ],
          "filter": { "range": { "depth": { "gte": min_depth, "lte": max_depth } } },
        }
      }
      var query =
      {
        "bool": {
          "must": {
            "match_all": {}
          },
          "filter": searchfilter,
          // "must_not": {
          //   "term": {
          //     "path": this.checked_pathfacet
          //   }
          // }
        }
      };
      if(this.searchInputValue.trim().length > 0) {
        query = {
          "bool":{
            "should":[
              {"multi_match":{
                "query":this.searchInputValue,
                "fields":["title","description"],
                "type":"best_fields",
                "operator":"and"}
              },
              {"multi_match": {
                "query":this.searchInputValue,
                "fields":["title","description"],
                "type":"cross_fields"}
              },
              {"multi_match":{
                "query":this.searchInputValue,
                "fields":["title","description"],
                "type":"phrase"}
              },
              {"multi_match":{
                "query":this.searchInputValue,
                "fields":["title","description"],
                "type":"phrase_prefix"}
              },
              {"terms":{
                "pathfacet": [this.searchInputValue]}
              }
            ],
            "filter": searchfilter
          }
        }
      }

      var esQuery = {
        "aggs":
          {"facet_bucket_all":
            {"aggs":{
              "pathfacet":{
                "terms":{
                  "field":"pathfacet",
                  "size":1000,
                  "order":{ "_key": "asc" }
                }
              },
              "level":{
                "terms":{
                  "field":"level",
                  "size":20,
                  "order":{"_count":"desc"}
                }
              }
            },
            "filter": facetfilter,
          }
        },
        // "_source":{
        //   "includes":["title","pathfacet","description","level"]
        // },
        "query": query,
        "from": Math.max(0, (this.currentPage - 1) * this.resultsPerPage),
        "size": this.resultsPerPage,
        "sort":[
          {"_score":"desc"}
        ]
      };
      this.$http.post("http://localhost:9200/descriptions/_search", esQuery).
        then(
          response => {
            var body = response.data
            this.results = body.hits.hits.map(hit => hit._source)

            // PAGING
            this.totalResults = this.results.length
            var numPagesInResults = this.totalResults == 0 ? 0 : Math.trunc(1 + ((this.totalResults - 1) / this.resultsPerPage))
            this.resultsPagingRequired = numPagesInResults > 0
            this.totalPages = numPagesInResults
            this.tooManyPages = numPagesInResults > 20

            var newPathFacets = {};
            var f = body.aggregations.facet_bucket_all.pathfacet.buckets;
            for (var i = 0; i < f.length; i++) {
              newPathFacets[f[i].key] = f[i];
            }
            //newPathFacets.sort( (a, b) => String(a["key"]).localeCompare(b["key"]) );
            this.pathfacets = newPathFacets;
            this.levels = body.aggregations.facet_bucket_all.level.buckets
            //this.notify(body.took, this.totalResults)
          },
          response => {
            console.error("failed ES search", response)
            alert("system failure of some sort")
          }
        )
    },
    handlePathFacetChange(event) {
      const { value, checked } = event.target;
      if (checked) { // special logic for hierarchy.. Uncheck parent will uncheck children. Check parent will uncheck children..
        this.checked_pathfacet = value;
      } else {
        this.checked_pathfacet = "";
      }
      this.currentPage = 1;
      this.handleFormSubmit();
    },
    changePageToPrevious: function() {
      this.changePageTo(this.currentPage - 1)
    },
    changePageToNext: function() {
      this.changePageTo(this.currentPage + 1)
    },
    changePageTo: function(pageNumber) {
      if (pageNumber < 1) {
        pageNumber = 1
      }
      if (pageNumber > this.totalPages) {
        pageNumber = this.totalPages
      }
      if (pageNumber == this.currentPage) {
        return
      }
      this.currentPage = pageNumber
      this.handleFormSubmit()
    }
  }
};
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

body {
    background-color: blue
}

div#bg {
  background-image: url(/US-NationalParkService-Logo.svg);
  background-repeat: no-repeat;
  background-size: 150px 220px;
  background-attachment: relative;
  background-position: 70px 10px;
}

.card {
    border: none;
    background: #eee
}

a:link {
    text-decoration: none
}

.card-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, .125);
    border-radius: .25rem;
    border: none;
    cursor: pointer;
    transition: all 2s
}

.description-box:hover {
  width: 250%;
  position: relative;
  z-index: 1;
  transition: all 2s;
}

.mg-text span {
    font-size: 12px
}

.mg-text {
    line-height: 14px
}

.pagination {
  margin-bottom: 0rem;
}

.page-item {
  margin: 0px;
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
