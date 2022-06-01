<template>
  <div v-show="facets.length" style="text-align: left" class="checkbox-facet">
    <div class="checkbox-facet_options-list">
      <label
        v-for="facetkey in facetKeysSorted"
        :key="facetkey"
        class="checkbox-facet-option"
      >
        <pre class="checkbox-facet-option-graphic">{{ pathGraphic(facetkey) }}</pre>
        <input
          class="checkbox-facet-option-checkbox"
          type="checkbox"
          :value="facetkey"
          :checked="facetkey == checked"
          @change="$emit('change', $event)"
        />
        &nbsp;<span class="checkbox-facet-option-path">{{ lastSegment(facetkey) }}</span>
        &nbsp;<span v-if="facets[facetkey].label" class="checkbox-facet-option-label">{{ facets[facetkey].label }}</span>
      </label>
    </div>
  </div>
</template>

<note>
  &nbsp;<span class="checkbox-facet-option-count">({{ facets[facetkey].doc_count }})</span>
</note>

<script>
export default {
  props: {
    facets: {
      type: Object,
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
    facetKeysSorted: function () {
      return Object.keys(this.facets).sort();
    }
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
      var missing_paths = [];
      Object.entries(this.facets).forEach((e) => {
        if(!("label" in e[1])) {
          missing_paths.push(e[0]);
        }
      });
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
      try {
        var r = await this.$http.post("http://localhost:9200/descriptions/_search", esQuery)
        for (let i = 0; i < r.data.hits.hits.length; i++) {
          var hit = r.data.hits.hits[i];
          var path = hit.fields.path[0];
          var label = hit.fields.title ? hit.fields.title[0] : null;
          this.$set(this.facets[path], "label", label);
        }
      } catch(error) {
        console.log(this.facets);
        console.error("failed ES search", error)
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
