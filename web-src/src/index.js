/* global window, document */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import './ac-backend-theme.css'
import { logger } from '../utils/log'

window.React = require('react')

const isLocal = window.location.hostname === 'localhost'
const isInIframe = (() => {
    try {
        return window.self !== window.top
    } catch (e) {
        return true
    }
})()
const isTopLevel = !isInIframe
const ancestorOrigins = window.location.ancestorOrigins || []
const referrer = document.referrer || ''

const isCommerceAdmin = Array.from(ancestorOrigins).some((origin) => origin.includes('admin.commerce.adobe.com')) ||
    referrer.includes('admin.commerce.adobe.com')

// Detect if we are in the Experience Cloud Shell (Prod or Local Dev via Shell)
const isShell = Array.from(ancestorOrigins).some((origin) => origin.includes('experience.adobe.com')) ||
    referrer.includes('experience.adobe.com')

logger.debug('[bootstrap] isLocal:', isLocal)
logger.debug('[bootstrap] isTopLevel:', isTopLevel)
logger.debug('[bootstrap] isInIframe:', isInIframe)
logger.debug('[bootstrap] isShell:', isShell)
logger.debug('[bootstrap] isCommerceAdmin:', isCommerceAdmin)
logger.debug('[bootstrap] ancestorOrigins:', Array.from(ancestorOrigins))
logger.debug('[bootstrap] referrer:', referrer)

if (isTopLevel && !isLocal && !isCommerceAdmin) {
    // Force redirect to Shell for Production standalone access
    const encodedUrl = encodeURIComponent(window.location.href)
    window.location.href = `https://experience.adobe.com/?devMode=true#/custom-apps/?localDevUrl=${encodedUrl}`
} else {
    bootstrapApp()
}

function bootstrapApp() {
    const root = createRoot(document.getElementById('root'))

    if (isCommerceAdmin) {
        root.render(<App runtime={{ on: () => {}, off: () => {} }} ims={{}} />)
    } else if (isShell && isInIframe) {
        // Use dynamic require so it doesn't crash in Magento
        try {
            require('./exc-runtime')
        } catch (e) {
            logger.warn('[bootstrap] exc-runtime load failed', e)
        }
        const { default: Runtime, init } = require('@adobe/exc-app')
        init(() => {
            const runtime = Runtime()
            const readyTimeout = setTimeout(() => {
                logger.warn('[bootstrap] runtime ready timeout')
            }, 10000)
            runtime.on('ready', (ims) => {
                clearTimeout(readyTimeout)
                runtime.done() // This MUST be called to stop the 408 timeout
                logger.debug('[bootstrap] runtime ready', {
                    hasIms: Boolean(ims),
                    imsKeys: ims ? Object.keys(ims) : []
                })
                const normalizedIms = {
                    ...ims,
                    token: ims.imsToken || ims.token,
                    org: ims.imsOrg || ims.org
                }
                logger.debug('[bootstrap] normalized IMS', {
                    hasToken: Boolean(normalizedIms.token),
                    hasOrg: Boolean(normalizedIms.org)
                })
                root.render(<App runtime={runtime} ims={normalizedIms} />)
            })
        })
    } else {
        // Local non-shell or unknown host
        root.render(<App runtime={{ on: () => {}, off: () => {} }} ims={{}} />)
    }
}
