/** @jsx jsx */
import { h, Fragment, Component } from "preact";
import { observer } from "mobx-react";
import { useMemo } from 'preact/hooks';
import { jsx, css } from '@emotion/react';

import { filters } from '@searchspring/snap-toolbox';

import { SortBy } from "./SortBy";
import { SidebarContents } from "../Sidebar/Sidebar";
import { MediaQuery } from '../Helpers/MediaQuery'
import { FacetOptionsFooter } from './FacetDisplays'
import { FilterSummary } from "../FilterSummary/FilterSummary";

import {
  Button,
  Facet,
  FacetSlider,
  FacetGridOptions,
  FacetPaletteOptions,
  FacetListOptions,
  FacetHierarchyOptions,
  Slideout,
  withStore,
} from "@searchspring/snap-preact-components";

import { IconClose } from '../Icons/IconClose'
import { IconFilter } from '../Icons/IconFilter'

import './toolbar.css'

@withStore
@observer
export class Toolbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
        activeKey: null,
        showViewResultsButton: false,
    }

    this.setActiveKey = this.setActiveKey.bind(this)
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    this.preventPropagation = this.preventPropagation.bind(this)
    this.handleCloseSidebar = this.handleCloseSidebar.bind(this)
  }

  handleCloseSidebar() {
    const mobileFiltersButton = document.querySelector('.ss__slideout__button')
    mobileFiltersButton.click()
  }

  setActiveKey(value) {
    this.setState({
        activeKey: value,
    })
  }

  preventPropagation(e) {
      e.stopPropagation()
  }

  handleOutsideClick() {
      this.setState({
          activeKey: null,
      })
  }

  componentDidMount() {
    this.props.store.facets.forEach(facet => {
        facet.collapsed = true
    })

    const toolbar = document.getElementById('toolbar-filters')
    const body = document.body
    const sticky = toolbar.offsetTop

    /* Handle sticky header */
    const toggle = () => {
        if (window.pageYOffset + 100 > sticky) {
            toolbar.classList.add('sticky')
            body.classList.add('show-header')
        } else {
            toolbar.classList.remove('sticky')
            body.classList.remove('show-header')
        }
    }
    window.onscroll = () => toggle()

    /* Handle outside click */
    toolbar.addEventListener('click', this.preventPropagation)
    window.addEventListener('click', this.handleOutsideClick)
  }

  componentWillUnmount() {
      /*Clean up event handlers */
      const toolbar = document.getElementById('toolbar-filters')
      toolbar.removeEventListener('click', this.preventPropagation)
      window.removeEventListener('click', this.handleOutsideClick)
  }
  render() {
    const {
      facets,
      filters,
    } = this.props.store;

    const inlineCount = this.props.store.data.merchandising?.content?.inline?.length ?? 0
    const resultCount = this.props.store.data.pagination.totalResults - inlineCount

    return (
      <div class="ss-toolbar ss-toolbar-top page-width" id="toolbar-filters">
        <div class="toolbar-wrapper">
          <MediaQuery query="(max-width: 991px)">
            <div class="ss-toolbar-row">
              <div class="ss-toolbar-col">
                <SortBy />
              </div>
            </div>
          </MediaQuery>

          <MediaQuery query="(max-width: 991px)">
            <Slideout
              buttonContent={slideoutButton(filters)}
            >
              <Fragment>
                <div
                    class="slideout-content-wrapper slideout-close-button"
                    onClick={this.handleCloseSidebar}
                >
                    <IconClose />
                </div>
                <div class="slideout-content-wrapper slideout-filter-by">
                  <h3>Filter By</h3>
                  <FilterSummary />
                </div>
                <SidebarContents />
              </Fragment>

              <div class={
                    this.state.showViewResultsButton
                        ? 'slideout-view-results slideout-view-results--active'
                        : 'slideout-view-results'
                  }
              >
                <button class="CQL-p2" onClick={this.handleCloseSidebar}>{window.Resources.searchspring.recommendations.filterSeeResults} ({resultCount})</button>
              </div>

            </Slideout>
          </MediaQuery>

          <MediaQuery query="(min-width: 992px)">
            <div class="ss-toolbar-row">
                <div class="ss-toolbar-row">
                  <div class="ss-toolbar-col">
                    <SortBy />
                  </div>
                </div>

                <Slideout
                  buttonContent={slideoutButton(filters)}
                  >
                  <Fragment>
                    <div
                        class="slideout-content-wrapper slideout-close-button"
                        onClick={this.handleCloseSidebar}
                    >
                        <IconClose />
                    </div>
                    <div class="slideout-content-wrapper slideout-filter-by">
                      <h3 class="CQL-h3">Filter By</h3>
                    </div>
                    <SidebarContents />
                  </Fragment>

                  <div class={
                        this.state.showViewResultsButton
                            ? 'slideout-view-results slideout-view-results--active'
                            : 'slideout-view-results'
                      }
                  >
                    <button class="button button--primary CQL-p2" onClick={this.handleCloseSidebar}>{window.Resources.searchspring.recommendations.filterSeeResults} ({resultCount})</button>
                  </div> 

                </Slideout>
            </div>
          </MediaQuery>
        </div>
      </div>
    );
  }
}

const slideoutButton = (filters) => {
  let filtersApplied = filters.length > 0 ? `(${filters.length})` : null;

  return (
    <Button
      style={{
        margin: "0 1rem",
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      {window.Resources.searchspring.toolbar.filter} <span className="ss__filters-applied">{filtersApplied}</span>
    </Button>
  );
};

class ControlledFacet extends Component {
  constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
      const { facet, activeKey, setActiveKey } = this.props
      setActiveKey(activeKey === facet.field ? null : facet.field)
  }

  render({ facet, activeKey, setActiveKey, className }) {
      if (facet.field === activeKey) {
        className += 'selected-facet'
      } else {
        facet.collapsed = true
      }

      let showFacet = true

      return showFacet ? (
        <div class={className} onClick={this.handleClick}>
          <Facet
              facet={facet}
              disableOverflow={true}
              optionsSlot={<OptionsSlot setActiveKey={setActiveKey} />}
          />
        </div>
      ) : null
  }
}

export class OptionsSlot extends Component {
  constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
      this.handleClose = this.handleClose.bind(this)
  }

  handleClick(e) {
      e.stopPropagation()
  }

  handleClose() {
      const { setActiveKey } = this.props
      setActiveKey(null)
  }

  getFacetDisplay(facet) {
      switch (facet.display) {
        case 'slider':
          return <FacetSlider facet={facet} />
        case 'grid':
          let columns = facet.label == "Size" ? 8 : 6
          return <FacetGridOptions facet={facet} values={facet.values} columns={8} />
        case 'palette':
          return <CustomFacetPaletteOptions facet={facet} />;
        case 'hierarchy':
          return <FacetHierarchyOptions values={facet.values} />
        default:
          return <FacetListOptions values={facet.values} />
      }
  }

  render({ facet }) {
      const facetDisplay = this.getFacetDisplay(facet)

      return (
          <div onClick={this.handleClick}>
              {facetDisplay}
              <FacetOptionsFooter onClose={this.handleClose} />
          </div>
      )
  }
}

const CustomFacetPaletteOptions = ({ facet }) => {
  const { values } = facet;
  const { field } = facet
  const shopifyFileURL = window.Resources.searchspring.shopifyURLs.fileURL.split('/placeholder')[0];

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

  return <FacetPaletteOptions css={facetCss} values={transformedValues} columns={12} hideIcon gapSize='0px' />;
};