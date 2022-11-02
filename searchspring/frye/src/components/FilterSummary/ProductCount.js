/** @jsx jsx */
import { Component, h } from 'preact'
import { useMemo } from 'preact/hooks'
import { observer } from 'mobx-react-lite'
import { jsx, css } from '@emotion/react'

import { useController } from '@searchspring/snap-preact-components'

import './productcount.css'

export const ProductCount = () => {
    const controller = useController()

    const inlineCount = useMemo(
        () => controller.store.data.merchandising?.content?.inline?.length ?? 0,
        [controller.store.data.merchandising?.content?.inline?.length]
    )

    const resultCount = useMemo(
        () => controller.store.data.pagination.totalResults - inlineCount,
        [controller.store.data.pagination.totalResults, inlineCount]
    )

    return (
        <div class="product-count page-width">
            <div class="number-of-products">
                <hr class="large-up-hide" /><div className="number-of-products__count">{resultCount} Products</div><hr class="large-up-hide" />
            </div>
        </div>
    )
}
