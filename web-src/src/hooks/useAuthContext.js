import { useEffect, useMemo, useState } from 'react'
import { attach } from '@adobe/uix-guest'
import { getAuthHeaders, hasAuthContext } from '../../utils/auth'
import { isCommerceAdminContext } from '../../utils'
import { logger } from '../../utils/log'

export const useAuthContext = ({ ims, extensionId, setIsLoading }) => {
  const [connection, setConnection] = useState(null)

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!isCommerceAdminContext()) {
        if (typeof setIsLoading === 'function') {
          setIsLoading(false)
        }
        return
      }
      if (!ims?.token) {
        const guestConnection = await attach({ id: extensionId })
        ims.token = guestConnection?.sharedContext?.get('imsToken')
        ims.org = guestConnection?.sharedContext?.get('imsOrgId')
        setConnection(guestConnection || null)
      }
      if (typeof setIsLoading === 'function') {
        setIsLoading(false)
      }
    }

    fetchCredentials().catch((error) => {
      logger.warn('[auth] Failed to attach guest connection', error)
      if (typeof setIsLoading === 'function') {
        setIsLoading(false)
      }
    })
  }, [ims, extensionId, setIsLoading])

  useEffect(() => {
    if (!connection?.sharedContext?.on) {
      return
    }
    const logSharedContextSnapshot = () => {
      if (!connection?.sharedContext?.get || !connection?.sharedContext?.keys) {
        return
      }
      const keys = Array.from(connection.sharedContext.keys())
      const hasIms = Boolean(connection.sharedContext.get('ims'))
      const hasImsToken = Boolean(connection.sharedContext.get('imsToken'))
      const hasImsAccessToken = Boolean(connection.sharedContext.get('imsAccessToken'))
      const hasAccessToken = Boolean(connection.sharedContext.get('accessToken'))
      const hasToken = Boolean(connection.sharedContext.get('token'))
      const hasAuthorization = Boolean(connection.sharedContext.get('authorization'))
      const hasImsOrgId = Boolean(connection.sharedContext.get('imsOrgId'))
      const hasImsOrg = Boolean(connection.sharedContext.get('imsOrg'))
      const hasOrgId = Boolean(connection.sharedContext.get('orgId'))
      const hasOrg = Boolean(connection.sharedContext.get('org'))
      logger.debug('[auth] sharedContext keys', keys)
      logger.debug('[auth] sharedContext token flags', {
        hasIms,
        hasImsToken,
        hasImsAccessToken,
        hasAccessToken,
        hasToken,
        hasAuthorization,
        hasImsOrgId,
        hasImsOrg,
        hasOrgId,
        hasOrg
      })
    }

    logSharedContextSnapshot()
    const handleSharedContextChange = () => {
      logSharedContextSnapshot()
    }
    connection.sharedContext.on('change', handleSharedContextChange)
    return () => {
      if (connection?.sharedContext?.off) {
        connection.sharedContext.off('change', handleSharedContextChange)
      }
    }
  }, [connection])

  const authContext = useMemo(() => ({
    ims,
    connection
  }), [ims, connection])

  const authHeaders = getAuthHeaders(authContext)
  const isAuthAvailable = hasAuthContext(authContext)

  return {
    connection,
    authContext,
    authHeaders,
    isAuthAvailable
  }
}
