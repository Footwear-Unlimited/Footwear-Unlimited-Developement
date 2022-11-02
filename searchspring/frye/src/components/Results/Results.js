import { h, Fragment, Component } from "preact";
import { useMemo } from 'preact/hooks'
import { observer } from "mobx-react";

import {
  Banner,
//  Results as ResultsComponent,
  withStore,
  withController,
} from "@searchspring/snap-preact-components";

import { ProductCount } from '../FilterSummary/ProductCount'
import { Profile } from "../Profile/Profile";
import { ResultsComponent } from './ResultsComponent'
import { Toolbar } from "../Toolbar/Toolbar";
import { MediaQuery } from '../Helpers/MediaQuery'

import "./results.css";
import { FeaturedFilter } from "../FilterSummary/FeaturedFilter";

@withStore
@withController
@observer
export class Results extends Component {
  componentDidMount() {
    const templateWrapper = document.querySelector(".search-results-template-wrapper");

    if (templateWrapper) {
      templateWrapper.classList.add("some-results");
    }
  }

  render() {
    const { merchandising, results, pagination } = this.props.store;
    const controller = this.props.controller;

    return (
      <div class="ss-results">
        <Banner content={merchandising.content} type="header" />
        <Banner content={merchandising.content} type="banner" />

        <FeaturedFilter />

        <MediaQuery query="(min-width: 990px)">
          <div className="ss-results__top-wrapper page-width">
            <ProductCount />
            <Toolbar />
          </div>
        </MediaQuery>

        <MediaQuery query="(max-width: 989px)">
          <ProductCount />
          <Toolbar />
        </MediaQuery>

        <div class="clear"></div>

        <Profile name="results" controller={controller}>
          <ResultsComponent
            className="page-width"
            controller={controller}
            results={results}
          />
        </Profile>

        <div class="clear"></div>
      </div>
    );
  }
}

@withController
@withStore
@observer
export class NoResults extends Component {
  componentDidMount() {
    const templateWrapper = document.querySelector('.search-results-template-wrapper')

    if (templateWrapper) {
        templateWrapper.classList.add('no-results')
    }
}

  render() {
    const store = this.props.store;
    return null;
  }
}
