export const getWindowAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, orgId: null }
  }

  try {
    const imsConfig = window.imsConfig || {}
    const creds = window.imsCredentials || window.adobeIMS || {}
    const token =
      creds.token ||
      creds.accessToken ||
      creds.authorization ||
      creds.imsToken ||
      creds.imsAccessToken ||
      imsConfig.imsToken ||
      imsConfig.accessToken ||
      imsConfig.token ||
      null
    const orgId =
      creds.org ||
      creds.imsOrg ||
      creds.imsOrgId ||
      creds.orgId ||
      imsConfig.imsOrgId ||
      imsConfig.imsOrg ||
      imsConfig.orgId ||
      null

    return { token, orgId }
  } catch (error) {
    console.debug('[windowAuth] Cross-origin access blocked, skipping window check.')
    return { token: null, orgId: null }
  }
}

export const setWindowImsCredentials = ({ token, orgId }) => {
  if (typeof window === 'undefined' || !token) {
    return
  }

  window.imsCredentials = {
    token,
    org: orgId || null
  }
}
