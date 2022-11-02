import { h, Fragment, Component } from "preact";
import { observer } from "mobx-react";
import { withStore } from "@searchspring/snap-preact-components";

import "./Header.css";

import { SearchInput } from "../SearchInput/SearchInput"


@withStore
@observer
export class Header extends Component {
  render() {
    const { pagination, search, custom } = this.props.store;

    return (
      <header class={`ss-header-container page-width ${pagination.totalResults > 0 ? 'ss-header-results-found' : 'ss-header-results-not-found'}`}>
          {pagination.totalResults ? (
            <>
              <h2 class="ss-title ss-results-title">
                {`We found `}
                <span class="ss-results-count-total">{pagination.totalResults}</span>
                {` result${pagination.totalResults == 1 ? '' : 's'}`}
                {search?.query && (
                  <span>
                    {` for `}
                    <span class="ss-results-query">"{search.query.string}"</span>
                  </span>
                )}
              </h2>
            </>
          ) : (
            pagination.totalResults === 0 && (
              <h2 class="ss-title ss-results-title ss-no-results-title">
                {search?.query ? (
                  <>
                    <span>
                    {window.Resources.searchspring.results.noResultsHeading} {' '}
                      <span class="ss-results-query">
                          "{search.query.string}"
                      </span>{' '}
                    </span>
                    <span class="ss-results-header-body">
                      Double check your spelling or try again with a less specific term.
                    </span>
                    <SearchInput/>
                  </>
                ) : (
                  <span>No results found.</span>
                )}
              </h2>
            )
          )}
      </header>
    );
  }
}
