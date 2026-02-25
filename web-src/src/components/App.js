import React, { useEffect } from 'react'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes, HashRouter } from 'react-router-dom'
import ExtensionRegistration from './ExtensionRegistration'
import ReviewManager from './ReviewManager'

function App (props) {
    console.warn('[App] render', {
        hasIms: Boolean(props?.ims),
        imsKeys: props?.ims ? Object.keys(props.ims) : [],
        hasRuntime: Boolean(props?.runtime)
    })
    return (
        <ErrorBoundary FallbackComponent={fallbackComponent} onError={onError}>
            <HashRouter>
                <Provider theme={defaultTheme} colorScheme={'light'}>
                    <Routes>
                        <Route index element={<ExtensionRegistration ims={props.ims} runtime={props.runtime} />} />
                        {/* Admin UI SDK path (referenced in ExtensionRegistration.js) */}
                    </Routes>
                </Provider>
            </HashRouter>
        </ErrorBoundary>
    )

    // error handler on UI rendering failure
    function onError(e, componentStack) {}

    function fallbackComponent({ componentStack, error }) {
        return (
            <div>
                <h1>Something went wrong :(</h1>
                <pre>{error.message}</pre>
            </div>
        )
    }
}

export default App
