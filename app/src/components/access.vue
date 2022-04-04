<template>
  <div class="container-fluid h-100">
    <div class="container mt-4">
      <div class="row d-flex justify-content-center">
          <div class="col-md-9">
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
      <div v-if="searchState.wasSearched" class="col-md-3">
        <div class="card-inner p-3"><h4>Descriptive Hierarchy</h4>
          <SearchSort v-show="thereAreResults" v-model="sortBy" />
          <SearchHierarchyFacet
            v-show="thereAreResults"
            :checked="parentpath"
            :facet="searchState.facets.parentpath[0]"
            @change="handleHierarchyFacetChange($event, 'parentpath')"
          />
          <SearchFacet
            v-show="thereAreResults"
            :checked="level"
            :facet="searchState.facets.level[0]"
            @change="handleFacetChange($event, 'level')"
          />
        </div>
      </div>
      <div class="col-md-6">
        <div v-if="searchState.wasSearched" class="card-inner p-3"><h4>Results / Graph Context / Viewer</h4>
          <SearchResults
            v-show="thereAreResults"
            :results="searchState.results"
          />
        </div>
      </div>
      <div class="col-md-3">
        <div class="card-inner p-3"><h4>Related Topics</h4>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 fixed-bottom fw-bold flex-md-nowrap p-4 pb-0 shadow">
        <div class="card-inner p-0 text-center">
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
import { SearchDriver } from "@elastic/search-ui";
import config from "../searchConfig";
import SearchResults from "./SearchResults";
import SearchSort from "./SearchSort";
import SearchFacet from "./SearchFacet";
import SearchHierarchyFacet from "./SearchHierarchyFacet";
import SearchHeader from "./SearchHeader";

const driver = new SearchDriver(config);
console.log(driver);

export default {
  name: 'Access',
  components: {
    SearchResults,
    SearchSort,
    SearchFacet,
    SearchHierarchyFacet,
    SearchHeader
  },
  data() {
    return {
      searchInputValue: "",
      searchState: {},
      level: [],
      parentpath: [],
      rarity: [],
      type: [],
      set: [],
      card_class: [],
      cost: [],
      resultsPerPage: 20,
      sortBy: "relevance"
    };
  },
  computed: {
    thereAreResults() {
      return this.searchState.totalResults && this.searchState.totalResults > 0;
    }
  },
  watch: {
    resultsPerPage(newResultsPerPage) {
      driver.setResultsPerPage(newResultsPerPage);
    },
    sortBy(newSortBy) {
      driver.setSort(newSortBy, "asc");
    }
  },
  mounted() {
    const {
      searchTerm,
      sortField,
      resultsPerPage,
      filters,
      facets
    } = driver.getState();

    // restoring UI from url query
    this.searchInputValue = searchTerm;
    this.sortBy = sortField;
    this.resultsPerPage = resultsPerPage;
    filters.forEach(filter => {
      if (facets[filter.field][0].type === "range") {
        this[filter.field] = filter.values.map(value => value.name);
      } else {
        this[filter.field] = filter.values;
      }
    });

    driver.subscribeToStateChanges(state => {
      //console.log(state);
      this.searchState = state;
    });
  },
  methods: {
    handleFormSubmit() {
      console.log(this.searchInputValue);
      driver.getActions().setSearchTerm(this.searchInputValue);
    },
    handleFacetChange(event, facet) {
      const { value, checked } = event.target;
      const facetFromDriver = driver.getState().facets[facet][0];
      const valueforApi =
        facetFromDriver.type === "range"
          ? facetFromDriver.data.find(item => item.value.name === value).value
          : value;

      if (checked) {
        this[facet].push(value);
        driver.addFilter(facet, valueforApi, "any");
      } else {
        const index = this[facet].indexOf(value);
        if (index > -1) {
          this[facet].splice(index, 1);
        }
        driver.removeFilter(facet, valueforApi, "any");
      }
    },
    handleHierarchyFacetChange(event, facet) {
      const { value, checked } = event.target;
      if (checked) { // special logic for hierarchy.. Uncheck parent will uncheck children. Check parent will uncheck children..
        this[facet].push(value);
        driver.addFilter(facet, value, "any");
      } else {
        const index = this[facet].indexOf(value);
        if (index > -1) {
          this[facet].splice(index, 1);
        }
        driver.removeFilter(facet, value, "any");
      }
      // remove all other hierachy facets/filters
      Object.values(this[facet]).forEach((v, ind)=> {
        if( v !== value ) {
          this[facet].splice(ind, 1);
          driver.removeFilter(facet, v, "any");
        }
      });
    },
    setCurrentPage(page) {
      driver.setCurrent(page);
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

.mg-text span {
    font-size: 12px
}

.mg-text {
    line-height: 14px
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
