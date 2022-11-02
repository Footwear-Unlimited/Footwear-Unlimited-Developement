/** @jsx jsx */
import { h, Fragment, Component } from "preact";
import { observer } from "mobx-react";
import { useMemo } from 'preact/hooks';
import { jsx, css } from '@emotion/react';

import { filters } from '@searchspring/snap-toolbox';

import {
  ThemeProvider,
  defaultTheme,
  FilterSummary,
  Facet,
  FacetSlider,
  FacetGridOptions,
  FacetPaletteOptions,
  FacetListOptions,
  FacetHierarchyOptions,
  StoreProvider,
  withStore,
  withController,
  ControllerProvider,
} from '@searchspring/snap-preact-components';

import './sidebar.css'

@observer
export class Sidebar extends Component {
  render() {
    const store = this.props.controller.store;

    return (
      <ThemeProvider theme={defaultTheme}>
        <ControllerProvider controller={this.props.controller}>
          <StoreProvider store={store}>
            <SidebarContents />
          </StoreProvider>
        </ControllerProvider>
      </ThemeProvider>
    );
  }
}

@withController
@withStore
@observer
export class SidebarContents extends Component {
  render() {
    const {
      filters,
      facets,
    } = this.props.store;

    return (
      <div class="ss-sidebar-container">
        <FilterSummary filters={filters} controller={this.props.controller} />

        <div class='ss__facets'>
          {facets.map(facet => {
            return facet.display === 'none' ? null : (
              <>
                <Facet facet={facet} optionsSlot={<OptionsSlot />} disableOverflow limit={50} />
                <hr class="facet__sidebar-separator"/>
              </>
            );
          })}
        </div>
      </div>
    );
  }
}

const OptionsSlot = ({ facet, limit }) => {
  const { label } = facet;
  const labelClass  = facet.label;

  const optionHelper = useMemo(() => {
    const optionHelperJSONString = document.getElementById('optionHelpers')?.textContent;
    const optionHelpers = optionHelperJSONString ? JSON.parse(optionHelperJSONString) : {};
    return optionHelpers[label.toLowerCase()]?.valueHelper;
  }, [label]);

  const facetDisplay = useMemo(() => {
    switch (facet.display) {
      case 'grid': {
        const isSizes = facet.label === 'Size' ? true : false;
        const columns = isSizes ? 5 : 4;
        const className = `ss__facet-grid-options`;
        return <FacetGridOptions values={facet.values} columns={columns} className={className} />;
      }
      case 'palette':
        return <CustomFacetPaletteOptions facet={facet} />;
      case 'hierarchy':
        return <FacetHierarchyOptions values={facet.values} />;
      case 'slider':
        return <FacetSlider facet={facet} />;
      default:
        return <FacetListOptions values={facet.values} />;
    }
  }, [facet]);

  return (
    <>
      {facetDisplay && <div className={`ss__facet-options-display ${labelClass}`}>{facetDisplay}</div>}
      {optionHelper && <OptionHelper html={optionHelper} />}
    </>
  );
};

const CustomFacetPaletteOptions = ({ facet }) => {
  const { values } = facet;
  const { field } = facet;
  const { label } = facet;
  const shopifyFileURL = window.Resources.searchspring.shopifyURLs.fileURL.split('/placeholder')[0];
  let columns = label.includes('olor') ? 4 : 3;

  const transformedValues = useMemo(() => {
    return values.filter(v => v.label);
  }, [values]);

  const facetCss = useMemo(() => {
    const styles = {};

    transformedValues.forEach(v => {
      let filterLabel = v.label.replaceAll(' ', '-').toLowerCase();
      let filterImage = shopifyFileURL + "/" + field + "__" + filterLabel + ".png";
      let background = `url("${filterImage}")`;

      styles[`& .ss__facet-palette-options__option__palette--${filters.handleize(filterLabel)}`] = {
        display: 'block',
        background: background,
      };
    });

    return [css(styles)];
  }, [transformedValues]);

  return <FacetPaletteOptions css={facetCss} values={transformedValues} columns={columns} hideIcon gapSize='0px' />;
};
