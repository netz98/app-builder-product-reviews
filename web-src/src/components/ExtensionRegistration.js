import React, { useEffect } from 'react'
import { register } from '@adobe/uix-guest'
import ReviewManager from "./ReviewManager";

export const extensionId = 'review'

export default function ExtensionRegistration(props) {
    useEffect(() => {
        (async () => {
            await register({
                id: extensionId,
                methods: {}
            })
        })().catch(console.error)
    }, [])

    return <ReviewManager ims={props.ims} runtime={props.runtime} />
}
