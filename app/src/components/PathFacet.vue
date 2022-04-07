<template>
  <div v-show="facets.length" style="text-align: left" class="checkbox-facet">
    <div class="checkbox-facet_options-list">
      <label
        v-for="facetItem in facets"
        :key="facetItem.key"
        class="checkbox-facet-option"
      >
        <pre class="checkbox-facet-option-graphic">{{ pathGraphic(facetItem.key) }}</pre>
        <input
          class="checkbox-facet-option-checkbox"
          type="checkbox"
          :value="facetItem.key"
          :checked="facetItem.key == checked"
          @change="$emit('change', $event)"
        />
        &nbsp;<span class="checkbox-facet-option-path">{{ lastSegment(facetItem.key) }}</span>
        &nbsp;<span class="checkbox-facet-option-count">({{ facetItem.doc_count }})</span>
        &nbsp;<span v-if="facetItem.label" class="checkbox-facet-option-label">{{ facetItem.label }}</span>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    facets: {
      type: Array,
      required: true
    },
    checked: {
      type: String,
      required: true
    },
    // url: {
    //   type: String,
    //   required: true
    // }
  },
  created() {
    this.loadLabels();
  },
  watch: {
    facets() {
      this.loadLabels();
    }
  },
  computed: {

  },
  methods: {
    pathGraphic(path) {
      var segs = path.split('/');
      if(segs.length <= 2) {
        return "";
      } else {
        var spaces = 2*(segs.length-3);
        return " ".repeat(spaces)+"┗╸";
      }
    },
    lastSegment(path) {
      var segs = path.split('/');
      return segs[segs.length - 1];
    },
    isChecked(value) {
      return this.checked_pathfacet === value;
    },
    async loadLabels() {
      if(this.facets.length == 0) return;
      var missing_paths = this.facets.filter(f => !("label" in f)).map(f => f.key)
      var esQuery =
      {
        "query": {
          "terms": {
            "path": missing_paths,
            "boost": 1.0
          }
        },
        "_source": false,
        "fields": [ "title", "path"],
        "size": missing_paths.length
      }
      var facetIndex = 0;
      try {
        var r = await this.$http.post("http://localhost:9200/descriptions/_search", esQuery)
        for (let i = 0; i < r.data.hits.hits.length; i++) {
          if(!(facetIndex < this.facets.length-2)) break;
          var hit = r.data.hits.hits[i];
          while(this.facets[facetIndex].key != hit.fields.path[0]) {
            facetIndex = facetIndex + 1;
          }
          this.$set(this.facets[facetIndex], "label", hit.fields.title[0]);
        }
      } catch(error) {
        console.log(this.facets);
        console.log(facetIndex);
        console.error("failed ES search", error)
        alert("system failure of some sort")
      }
    }
  }
};
</script>

<style>
.checkbox-facet-option {
  display: block;
  overflow: hidden;
  white-space:nowrap;
}

.checkbox-facet-option:hover {
  border: 2px solid gray;
  margin: -2px;
}

.checkbox-facet-option-path {
  font-size: smaller;
}

.checkbox-facet-option-label {
  overflow: hidden;
  display: inline;
  white-space:nowrap;
  text-overflow: ellipsis;
  font-size: smaller;
}

.checkbox-facet-option-graphic {
  display: inline;
  font-family: monospace, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
