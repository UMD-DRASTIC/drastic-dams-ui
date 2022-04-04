import "regenerator-runtime/runtime";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

const connector = new ElasticsearchAPIConnector(
  { host: "http://localhost:9200",
    index: "descriptions", },
  { queryFields: [ "parentpath",
    "title", "description" ] });

const config = {
//  debug: true,
  apiConnector: connector,
  searchQuery: {
    search_fields: {
      title: {},
      parentpath: {},
      description: {},
    },
    result_fields: {
      title: {
        raw: {}
      },
      // nps_link: {
      //   raw: {}
      // },
      parentpath: {
        raw: {}
      },
      description: {
        raw: {}
      },
      level: {
        raw: {}
      }
    },
    //disjunctiveFacets: ["level", "parentpath"],
    facets: {
      parentpath: {
        field: "location",
        type: "value"
      },
      level: {
        field: "level",
        type: "value"
      },
    },
  }
};

export default config;
