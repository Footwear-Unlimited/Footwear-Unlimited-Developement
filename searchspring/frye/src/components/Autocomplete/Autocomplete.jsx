import { h, Component, Fragment } from "preact";
import { observer } from "mobx-react";
import classnames from "classnames";

import { Autocomplete as LibraryAutocomplete } from "@searchspring/snap-preact-components";

import { Result } from "../Result/Result";

import { IconCtaArrow } from "../Icons/IconCtaArrow";

import "./autocomplete.css";

@observer
export class Autocomplete extends Component {
  render() {
    const controller = this.props.controller;
    const autocompleteStrings =
      window.Resources?.searchspring?.autocomplete ?? {};

    const resultsTitle = controller.store.state.input
      ? autocompleteStrings.recommendedProducts
      : autocompleteStrings.popularProducts;

    return (
      <LibraryAutocomplete
        controller={controller}
        input={controller.config.selector}
        hideFacets
        hideBanners
        termsTitle={autocompleteStrings.suggestions}
        trendingTitle={autocompleteStrings.topSearches}
        contentTitle={resultsTitle}
        resultsSlot={<AutocompleteResults />}
        noResultsSlot={<AutocompleteNoResults />}
        termsSlot={<AutocompleteTerms />}
      />
    );
  }
}

// For reference, you can see where this slot component gets used by the library Autocomplete component here:
// https://github.com/searchspring/snap/blob/main/packages/snap-preact-components/src/components/Organisms/Autocomplete/Autocomplete.tsx#L503
const AutocompleteResults = ({ results, contentTitle, controller }) => {
  const numberOfResultsToShow = 4; // magic number - could later be shopify setting driven
  const resultsToShow = results.slice(0, numberOfResultsToShow);
  const { state } = controller.store;

  const autocompleteStrings =
    window.Resources?.searchspring?.autocomplete ?? {};

  return (
    <>
      <div className="ss__autocomplete__results-wrap">
        {contentTitle && (
          <div
            className={
              "ss__autocomplete__title ss__autocomplete__title--content"
            }
          >
            <h5 className="ss__autocomplete__recommended--heading">
              {contentTitle}
            </h5>
          </div>
        )}

        <div className="ss__autocomplete__results">
          {resultsToShow.map((result) => (
            <div className="ss__autocomplete__result">
              <Result result={result} hideBadge hideSwatches/>
            </div>
          ))}
        </div>
        {!!state.input && results.length > 0 && (
          <div className="ss__autocomplete__view-all">
            <a
              className="ss__autocomplete__view-all__link link link--text"
              href={state.url.href}
            >
              {autocompleteStrings.viewAllResults}
              <IconCtaArrow/>
            </a>
          </div>
        )}
      </div>
    </>
  );
};

const AutocompleteNoResults = () => (
  <p className="ss__autocomplete__no-result">
    {window.Resources?.searchspring?.autocomplete?.noResultsAutocomplete}
  </p>
);

// For reference, you can see where this slot component gets used by the library Autocomplete component here:
// https://github.com/searchspring/snap/blob/main/packages/snap-preact-components/src/components/Organisms/Autocomplete/Autocomplete.tsx#L402
const AutocompleteTerms = (props) => {
  const {
    terms,
    trending,
    termsTitle,
    trendingTitle,
    showTrending,
    valueProps,
    emIfy,
    onTermClick,
    controller,
  } = props;
  const { state } = controller.store;
  return (
    <>
      {terms.length > 0 ? (
        <>
          <div className="ss__autocomplete__inner-wrapper">
            {termsTitle ? (
              <div className="ss__autocomplete__title ss__autocomplete__title--terms">
                <h5 className="ss__autocomplete__terms-heading">
                  {termsTitle}
                </h5>
              </div>
            ) : null}
            <div className="ss__autocomplete__terms__options">
              {terms.map((term) => (
                <div
                  className={classnames("ss__autocomplete__terms__option", "CQL-p3", {
                    "ss__autocomplete__terms__option--active": term.active,
                  })}
                >
                  <a
                    onClick={(e) => onTermClick && onTermClick(e)}
                    href={term.url.href}
                    {...valueProps}
                    onFocus={() => term.preview()}
                  >
                    {emIfy(term.value, state.input)}
                  </a>
                </div>
              ))}
            </div>
            <hr className="ss__autocomplete__inner-wrapper__divider medium-hide large-up-hide" />
          </div>
        </>
      ) : null}

      {showTrending ? (
        <div className="ss__autocomplete__inner-wrapper">
          {trendingTitle ? (
            <div className="ss__autocomplete__title ss__autocomplete__title--trending">
              <h5 className="ss__autocomplete__terms--heading">
                {trendingTitle}
              </h5>
            </div>
          ) : null}
          <div className="ss__autocomplete__terms__options">
            {trending.map((term) => (
              <div
                className={classnames("ss__autocomplete__terms__option", {
                  "ss__autocomplete__terms__option--active": term.active,
                })}
              >
                <a
                  onClick={(e) => onTermClick && onTermClick(e)}
                  href={term.url.href}
                  {...valueProps}
                  onFocus={() => term.preview()}
                >
                  {emIfy(term.value, state.input)}
                </a>
              </div>
            ))}
          </div>
          <hr className="ss__autocomplete__inner-wrapper__divider medium-hide large-up-hide" />
        </div>
      ) : null}
    </>
  );
};
