// Use if we want to enable chunks in the future
// eslint-disable-next-line no-undef
// __webpack_public_path__ = window.assetsPath;

import deepmerge from "deepmerge";

import { Snap } from "@searchspring/snap-preact";
import { getContext } from "@searchspring/snap-toolbox";

import { afterStore } from "./middleware/plugins/afterStore";
import { configurable } from "./middleware/plugins/configurable";
import { combineMerge } from "./middleware/functions";
import { ContentSkel } from "./components/Content/Skel";
import { SidebarSkel } from "./components/Sidebar/Skel";

const context = getContext(["collection", "tags", "template", "shopper"]);

const backgroundFilters = [];

if (context.collection?.handle) {
  // set background filters
  if (context.collection.handle != "all") {
    backgroundFilters.push({
      field: "collection_handle",
      value: context.collection.handle,
      type: "value",
      background: true,
    });
  }

  // handle collection tags (filters)
  if (context.tags) {
    var collectionTags = context.tags
      .toLowerCase()
      .replace(/-/g, "")
      .replace(/ +/g, "")
      .split("|");
    collectionTags.forEach((tag) => {
      backgroundFilters.push({
        field: "ss_tags",
        value: tag,
        type: "value",
        background: true,
      });
    });
  }
}

/*
	configuration and instantiation
 */

let config = {
  url: {
    settings: {
      coreType: "query",
      customType: "query",
    },
    parameters: {
      core: {
        query: { name: "q" },
        page: { name: "p" },
      },
    },
  },
  client: {
    globals: {
      siteId: "zw7x36",
    },
  },
  instantiators: {
    recommendation: {
      components: {
        Recommendation: async () => {
          return (await import("./components/Recommendations/Recs/Recs")).Recs;
        },
      },
      config: {
        branch: 'develop',
      },
    },
  },
  controllers: {
    search: [
      {
        config: {
          id: 'search',
          plugins: [[afterStore], [configurable]],
          settings: {
            redirects: {
              merchandising: true,
            },
            infinite: {},
            facets: {
              pinFiltered: false,
            },
          },
          globals: {
            filters: backgroundFilters,
            pagination: {
              pageSize: window?.ssConfig?.pageSize ?? 24,
            },
            ssConfig: window?.ssConfig,
          },
        },
        targeters: [
          {
            selector: '#searchspring-content',
            hideTarget: true,
            prefetch: true,
            component: async () => {
              return (await import('./components/Content/Content')).Content;
            },
          },
        ],
      },
    ],
    autocomplete: [
      {
        config: {
          id: 'autocomplete',
          selector: '.ss__search-desktop',
          settings: {
            syncInputs: false,
            trending: {
              limit: 6,
              showResults: true,
            },
          },
          globals: {
            search: {
              query: {
                spellCorrection: true,
              },
            },
          },
        },
        targeters: [
          {
            selector: '.ss__search-desktop',
            component: async () => {
              return (await import("./components/Autocomplete/Autocomplete"))
                .Autocomplete;
            },
          },
        ],
      },
      {
        config: {
          id: 'autocomplete-mobile',
          selector: '.ss__search-mobile',
          settings: {
            syncInputs: false,
            trending: {
              limit: 6,
              showResults: true,
            },
          },
          globals: {
            search: {
              query: {
                spellCorrection: true,
              },
            },
          },
        },
        targeters: [
          {
            selector: '.ss__search-mobile',
            component: async () => {
              return (await import("./components/Autocomplete/Autocomplete"))
                .Autocomplete;
            },
          },
        ],
      },
    ],
    finder: [
      {
        config: {
          id: "finder",
          url: "/",
          fields: [
            {
              field: "generic_color",
              label: "Color",
            },
          ],
        },
        targeters: [
          {
            name: "finder",
            selector: "#searchspring-finder",
            component: async () => {
              return (await import("./components/Finder/Finder")).Finder;
            },
          },
        ],
      },
      {
        config: {
          id: "finder_hierarchy",
          url: "/",
          fields: [
            {
              field: "ss_category_hierarchy",
            },
          ],
        },
        targeters: [
          {
            name: "finder_hierarchy",
            selector: "#searchspring-finder-hierarchy",
            component: async () => {
              return (await import("./components/Finder/Finder")).Finder;
            },
          },
        ],
      },
    ],
  },
};

// used to add config settings from cypress e2e tests
if (window?.mergeSnapConfig) {
  config = deepmerge(config, window.mergeSnapConfig, {
    arrayMerge: combineMerge,
  });
}

const snap = new Snap(config);
