/*
* <license header>
*/

/* global fetch */
import actions from './src/config.json'

export const isCommerceAdminContext = () => {
    if (typeof window === 'undefined') {
        return false
    }
    const ancestorOrigins = window.location?.ancestorOrigins || []
    const referrer = document.referrer || ''
    return Array.from(ancestorOrigins).some((origin) => origin.includes('admin.commerce.adobe.com')) ||
        referrer.includes('admin.commerce.adobe.com')
}

async function invokeAction (actionName, _headers, _params, props) {
    const action = getAction(actionName, actions)
    const headers = _headers || {}
    const params = _params || {}

    // Lowercase all headers (Adobe Gateway requirement)
    Object.keys(headers).forEach((h) => {
        const lowercase = h.toLowerCase()
        if (lowercase !== h) {
            headers[lowercase] = headers[h]
            delete headers[h]
        }
    })

    const result = await actionWebInvoke(action[1], headers, params)
    return result
}

/**
 *
 * Invokes a web action
 *
 * @param  {string} actionUrl
 * @param {object} headers
 * @param  {object} params
 *
 * @returns {Promise<string|object>} the response
 *
 */
async function actionWebInvoke (actionUrl, headers = {}, params = {}, method = 'post') {
    const actionHeaders = {
        'Content-Type': 'application/json',
        ...headers
    }

    const fetchConfig = {
        headers: actionHeaders
    }

    if (window.location.hostname === 'localhost') {
        actionHeaders['x-ow-extra-logging'] = 'on'
    }

    fetchConfig.method = method.toUpperCase()

    if (fetchConfig.method === 'GET') {
        actionUrl = new URL(actionUrl)
        Object.keys(params).forEach(key => actionUrl.searchParams.append(key, params[key]))
    } else if (fetchConfig.method === 'POST' || fetchConfig.method === 'PUT') {
        fetchConfig.body = JSON.stringify(params)
    }

    const response = await fetch(actionUrl, fetchConfig)

    let content = await response.text()

    if (!response.ok) {
        throw new Error(`failed request to '${actionUrl}' with status: ${response.status} and message: ${content}`)
    }
    try {
        content = JSON.parse(content)
    } catch (e) {
        // response is not json
    }
    return content
}

export default actionWebInvoke

module.exports = {
    actionWebInvoke,
    invokeAction,
    isCommerceAdminContext
}
