import { h, Fragment, Component } from "preact";
import { observer } from "mobx-react";

import {
  Carousel,
  Recommendation,
//  Result,
} from "@searchspring/snap-preact-components";

import { Result } from '../../Result/Result'
import { MediaQuery } from '../../Helpers/MediaQuery'

import { ArrowUp } from "../../Icons/ArrowUp";

// CSS
import './recs.css'

@observer
export class Recs extends Component {
  constructor(props) {
    super();

    const controller = props.controller;

    if (!controller.store.profile) {
      controller.init();
      controller.search();
    }
  }

  render() {
    const controller = this.props.controller;
    const store = controller?.store;
    const arr = [...Array(9).keys()];

    const breakpoints = {
      0: {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 10,
      },
      749: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        spaceBetween: 10,
      },
    };

    return (
      <div>
        <MediaQuery query="(min-width: 750px)">
          <Recommendation 
            controller={controller}
            pagination={true}
            prevButton={<ArrowUp/>}
            nextButton={<ArrowUp/>}
            breakpoints={breakpoints}
            loop={true}
            allowTouchMove={false}
          >
            {store.results.map((result) => (
              <Result result={result} hideWishlist></Result>
            ))}
          </Recommendation>
        </MediaQuery>

        <MediaQuery query="(max-width: 749px)">
          <Recommendation 
            controller={controller}
            pagination={true}
            prevButton={<ArrowUp/>}
            nextButton={<ArrowUp/>}
            breakpoints={breakpoints}
            loop={false}
            allowTouchMove={true}
          >
            {store.results.map((result) => (
              <Result result={result} hideWishlist></Result>
            ))}
          </Recommendation>
        </MediaQuery>
      </div>
    );
  }
}
