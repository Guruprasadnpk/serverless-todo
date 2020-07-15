// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'orsm5fhrqi'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-nkoq-jta.us.auth0.com',            // Auth0 domain
  clientId: 'sM4dyiPGKRewaOkm2LIske61UQDA1v4l',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback/'
}
