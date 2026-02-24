import { useEffect } from 'react'
import { register } from '@adobe/uix-guest'

export const extensionId = 'review'

export default function ExtensionRegistration() {
    useEffect(() => {
        const init = async () => {
            const ancestorOrigins = window.location?.ancestorOrigins || []
            const referrer = document.referrer || ''
            const isShell = Array.from(ancestorOrigins).some((origin) => origin.includes('experience.adobe.com')) ||
                referrer.includes('experience.adobe.com')
            if (isShell) {
                return
            }
            console.warn('[auth] registering UIX guest', { extensionId })
            const connection = await register({
                id: extensionId,
                methods: {}
            })
            // Create a helper to check for the token
            console.warn('[auth] UIX guest registered', {
                hasSharedContext: Boolean(connection?.sharedContext),
                sharedContextKeys: connection?.sharedContext?.keys ? Array.from(connection.sharedContext.keys()) : []
            })
            if (connection?.sharedContext?.on) {
                connection.sharedContext.on('change', (context) => {
                    console.warn('[Debug] SharedContext Changed!', Array.from(context.keys()))
                })
            }
            if (connection?.sharedContext?.keys) {
                console.warn('[Discovery] SharedContext Keys:', Array.from(connection.sharedContext.keys()))
            }
        }
        init().catch(console.error)
    }, [])

    return null;
}
