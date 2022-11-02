/** @jsx jsx */
import { Fragment, h } from 'preact'
import { useState, useMemo } from 'preact/hooks'
import { useRef } from 'react';

// Searchspring
import { Price, Results, useMediaQuery } from '@searchspring/snap-preact-components'
import { useTheme, CacheProvider } from '@searchspring/snap-preact-components/dist/cjs/providers'
import { defined, cloneWithProps } from '@searchspring/snap-preact-components/dist/cjs/utilities'

// Packages
import { jsx, css } from '@emotion/react'
import classnames from 'classnames'
import { observer } from 'mobx-react-lite'

// Local 
import { useSwatches } from '../Helpers'
import { IconMore } from '../Icons/icon_more'
import { StarEmpty } from '../Icons/StarEmpty';
import { StarFull } from '../Icons/StarFull';
import { StarHalf } from '../Icons/StarHalf';

// CSS
import './result.css'

const CSS = {
    result: () =>
        css({
            '&.ss__result--grid': {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                '& .ss__result__image-wrapper': {
                    flex: '1 0 auto',
                },
            },
            '&.ss__result--list': {
                display: 'flex',
                flexDirection: 'row',
                '& .ss__result__image-wrapper': {
                    flex: '0 0 33%',
                },
                '& .ss__result__details': {
                    flex: '1 1 auto',
                    textAlign: 'left',
                    marginLeft: '20px',
                    padding: 0,
                },
            },

            '& .ss__result__image-wrapper': {
                position: 'relative',
                '& .ss__result__badge': {
                    background: '#FFFFFF',
                },
            },

            '& .ss__result__details': {
                textAlign: 'center',

                '& .ss__result__details__title': {
                    marginBottom: '10px',
                },
                '& .ss__result__details__pricing': {
                    marginBottom: '10px',

                    '& .ss__result__price': {
                        fontSize: '1.2em',
                    },
                    '& .ss__price--strike': {
                        fontSize: '80%',
                    },
                },
                '& .ss__result__details__button': {
                    marginBottom: '10px',
                },
            },
        }),
}

export const Result = observer(properties => {
    const globalTheme = useTheme()
    const [swatchIndex, setSwatchIndex] = useState(0)

    const props = {
        layout: 'grid',
        ...globalTheme?.components?.result,
        ...properties,
        ...properties.theme?.components?.result,
    }

    const {
        result,
        hideBadge,
        hideSwatches,
        hidePricing,
        hideTitle,
        hideWishlist,
        hideReviews,
        detailSlot,
        fallback,
        disableStyles,
        className,
        layout,
        style,
        controller,
    } = props

    const core = result?.mappings?.core
    const productID = core.uid;
    const hoverImage = result?.attributes?.ss_image_hover;
    const badge = result?.attributes?.mfield_cql_badge_label?.length ? result?.attributes?.mfield_cql_badge_label : null
    const priceRange = result?.attributes?.ss_price_range ? result?.attributes?.ss_price_range : null
    const variantColors = result?.attributes?.variant_color
    const variantImages = result?.attributes?.variant_images_json
    const variantID = result?.attributes?.variant_id ? result?.attributes?.variant_id : productID;
    let variantIDArray = "";
    const swatchImages = result?.attributes.mfield_cql_swatches_json
    const reviewScore = result?.attributes.reviews_product_score;
    const reviewTotal = result?.attributes.reviews_total_reviews;
    let shouldSkip = false;

    const swatches = useSwatches({
        variantColors: variantColors,
        variantImages: variantImages,
        swatchImages: swatchImages,
        fallbackImage: core.imageUrl,
    })
    

    const subProps = {
        price: {
            className: 'ss__result__price',
            ...globalTheme?.components?.price,
            ...defined({
                disableStyles,
            }),
            theme: props.theme,
        },
        badge: {
            className: 'ss__result__badge',
            content: badge,
            ...globalTheme?.components?.badge,
            ...defined({
                disableStyles,
            }),
            theme: props.theme,
        },
        image: {
            className: 'ss__result__image',
            alt: core?.name,
            src: core?.imageUrl,
            ...globalTheme?.components?.image,
            ...defined({
                disableStyles,
                fallback: fallback,
            }),
            theme: props.theme,
        },
    }

    const styling = {}
    if (!disableStyles) {
        styling.css = [CSS.result(), style]
    } else if (style) {
        styling.css = [style]
    }

    const queryParam = useMemo(() => {
        if (![...swatches][swatchIndex]) return ''
        return `?color=${[...swatches][swatchIndex]?.color}`
    }, [swatches, swatchIndex])

    const displayPrices = (priceRange) => {

        let decimalPlaces = 0;
        let corePrice = String(core.price);
        let msrpPrice = String(core.msrp);

        if (corePrice.includes('.') || msrpPrice.includes('.')) {
            decimalPlaces = 2;
        }

        if (priceRange) {
            let priceRange1 = String(priceRange[1]);
            let priceRange2 = String(priceRange[0]);

            if (priceRange1.includes('.') || priceRange2.includes('.')) {
                decimalPlaces = 2;
            }

            return (
                <>
                    <Price {...subProps.price} value={Number(priceRange[1])} decimalPlaces={decimalPlaces} />
                    <span class="em-dash">&#8211;</span>
                    <Price {...subProps.price} value={Number(priceRange[0])} decimalPlaces={decimalPlaces} />
                </>
            )
        }

        //otherwise, return core price
        return (
            <>
               {core.price < core.msrp ? (
                    <>
                        <Price {...subProps.price} value={core.msrp} lineThrough={true} decimalPlaces={decimalPlaces} />
                        &nbsp;
                        <Price {...subProps.price} value={core.price} decimalPlaces={decimalPlaces} />
                    </>
                ) : (
                    <Price {...subProps.price} value={core.price} decimalPlaces={decimalPlaces} />
                )}
            </>
        )
    }

    return (
        <CacheProvider>
            <article
                {...styling}
                className={classnames('ss__result', (typeof hoverImage != "undefined" && 'ss__result__hover'), `ss__result--${layout}`, className)}
            >
                <a
                    href={core.url + queryParam}
                    onMouseDown={e => {
                        controller?.track?.product?.click(e, result)
                    }}
                    className="ss__result-link"
                    aria-label={core.name}
                >
                    <div className="product-card-top-wrapper">
                        <div className="ss__result__image-wrapper">
                            {!hideBadge && (
                                <div className="ss__badge ss__result__badge">
                                    {badge}
                                </div>
                            )}
                            {!hideWishlist && (
                                <div ref={ref} id="" class="swym-button--wrap" data-variant-id={queryParamVariantID}>
                                    <a class={`swym-button swym-add-to-wishlist-view-product product_${result.id}`}
                                        data-with-epi="true"
                                        data-swaction="addToWishlist"
                                        data-product-id={result.id}
                                        data-product-url={core.url + queryParamVariantIdUrl}
                                        data-variant-id={queryParamVariantID}
                                        onClick={onItemClick}
                                        >
                                    </a>
                                </div>
                            )}
                            <div
                                {...styling}
                                className={classnames('ss__image', 'ss__result__image')}
                            >

                                <img
                                  id={`ProductImage-${result.id}`}
                                  alt={core.name}
                                  class="product__img product__img--main lazyload"
                                  data-aspectratio="1.4967637540453074"
                                  data-sizes="auto"
                                  data-image
                                  src={[...swatches][swatchIndex]?.thumbnail ? [...swatches][swatchIndex]?.thumbnail : core.imageUrl}
                                />

                                {typeof hoverImage != "undefined" &&
                                    <img
                                    id={`ProductImage-${result.id}`}
                                    alt={core.name}
                                    class="product__img product__img--hover lazyload"
                                    data-aspectratio="1.4967637540453074"
                                    data-sizes="auto"
                                    data-image
                                    src={hoverImage}
                                  />
                                }
                            </div>
                        </div>
                        <div className="ss__result__details">
                            {!hideReviews && (
                                <div className="ss__result__details__review">
                                    {/* Leaving this comment below for now */}
                                    {/* <div class="yotpo bottomLine" data-product-id={ core.uid }></div> */}

                                    {reviewScore == 5 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                        </>
                                    }
                                    
                                    {reviewScore > 4 && reviewScore < 5 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarHalf/>
                                        </>
                                    }
                                    
                                    {reviewScore == 4 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore > 3 && reviewScore < 4 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarHalf/>
                                            <StarEmpty/>
                                        </>
                                    }

                                    {reviewScore == 3 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore > 2 && reviewScore < 3 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarHalf/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }

                                    {reviewScore == 2 &&
                                        <>
                                            <StarFull/>
                                            <StarFull/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore > 1 && reviewScore < 2 &&
                                        <>
                                            <StarFull/>
                                            <StarHalf/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore == 1 &&
                                        <>
                                            <StarFull/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore > 0 && reviewScore < 1 &&
                                        <>
                                            <StarHalf/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore == 0 &&
                                        <>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                            <StarEmpty/>
                                        </>
                                    }
                                    
                                    {reviewScore == undefined &&
                                        <div className="ss__results__no-reviews">{/* {window.Resources.searchspring.results.noReviews} */}</div>
                                    }
                                </div>
                            )}
                            {!hideTitle && (
                                <div
                                    className="ss__result__details__title"
                                    dangerouslySetInnerHTML={{
                                        __html: core.name,
                                    }}
                                />
                            )}
                            {!hidePricing && (
                                <div className="ss__result__details__pricing">
                                    {displayPrices(priceRange)}
                                </div>
                            )}
                            {cloneWithProps(detailSlot, { result })}
                        </div>
                    </div>
                    </a>
                    <div className="product-card-bottom-wrapper">
                        {!hideSwatches && swatches.size > 1 ? (
                            <ColorSwatches
                                swatches={swatches}
                                setSwatchIndex={setSwatchIndex}
                                swatchIndex={swatchIndex}
                            />
                        ) : null}
                    </div>
            </article>
        </CacheProvider>
    )
})

const ColorSwatches = ({ swatches, setSwatchIndex, swatchIndex }) => {
    const breakNumber = 4
    const swatchList = [...swatches];

    return (
        <div className="ss__result__swatches">
            {swatchList.map((swatch, index) => {
                if (index > breakNumber) return null
                return (
                    <>
                        {index === breakNumber ? (
                            <IconMore
                                count = {swatchList.length}
                                breakpoint = {breakNumber}
                            />
                        ) : (
                            <div
                                className={classnames('swatch-image', {
                                    'swatch-image-selected': swatchIndex === index,
                                })}
                                title={swatch.color}
                                data-index={index}
                                data-thumbnail={swatch.thumbnail}
                            >

                            {swatch.swatch_image ? (
                                <img
                                    src={swatch.swatch_image}
                                    onClick={e => {
                                        e.preventDefault()
                                        setSwatchIndex(index)
                                    }}
                                    alt={swatch.color}
                                    width={25}
                                    height={25}
                                    loading="lazy"
                                />
                            ) : null}

                            </div>
                        )}
                    </>
                )
            })}
        </div>
    )
}
