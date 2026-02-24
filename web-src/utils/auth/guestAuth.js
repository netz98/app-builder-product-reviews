export const getGuestAuth = (connection) => {
    if (!connection?.sharedContext) return { token: null, orgId: null };

  const imsContext = connection.sharedContext.get('ims') || null;
  const token =
    connection.sharedContext.get('imsToken') ||
    connection.sharedContext.get('imsAccessToken') ||
    connection.sharedContext.get('accessToken') ||
    connection.sharedContext.get('token') ||
    connection.sharedContext.get('authorization') ||
    imsContext?.imsToken ||
    imsContext?.accessToken ||
    imsContext?.token ||
    imsContext?.authorization ||
    null;
  const orgId =
    connection.sharedContext.get('imsOrgId') ||
    connection.sharedContext.get('imsOrg') ||
    connection.sharedContext.get('orgId') ||
    connection.sharedContext.get('org') ||
    imsContext?.imsOrgId ||
    imsContext?.imsOrg ||
    imsContext?.orgId ||
    imsContext?.org ||
    null;

  return {
    token,
    orgId
  };
}
