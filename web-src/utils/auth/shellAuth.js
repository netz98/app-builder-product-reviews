export const getShellAuth = (ims = {}) => {
  const token = ims?.token || ims?.accessToken || ims?.authorization || null
  const orgId = ims?.org || ims?.imsOrg || ims?.imsOrgId || null
  return { token, orgId }
}
