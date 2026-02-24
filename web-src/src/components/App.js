import React from 'react'
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
        <ErrorBoundary FallbackComponent={fallbackComponent}>
            <HashRouter>
                <Provider theme={defaultTheme} colorScheme={'light'}>
                    <ExtensionRegistration />
                    <Routes>
                        <Route index element={<ReviewManager ims={props.ims} runtime={props.runtime} />} />
                        {/* Admin UI SDK path (referenced in ExtensionRegistration.js) */}
                        <Route path='review-manager' element={<ReviewManager ims={props.ims} runtime={props.runtime} />} />
                        <Route path='index.html' element={<div />} /> {/* Silence registration page */}
                    </Routes>
                </Provider>
            </HashRouter>
        </ErrorBoundary>
    )

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
