# Authentication

To authenticate yourself with this api you will need to send a POST request to `http://api/auth/login`. With the data being:

```json
{
  "email": "<email of user",
  "password": "<password of user>"
}
```

If the credentials are correct you will receive the accesstoken in the response. The refresh token will aujtomatically set with cookies.

You can use access tokens to make authenticated calls to the API. The refresh tokens are used to generate new access tokens. Both are JSON web tokens (JWTs) and have expiration dates indicated using the exp claim.
Accesstokens are only valid for 15 minutes, so have to be refreshed. To do this, send a request to `http://api/auth/refresh/access`. This will automatically include your cookie, and will return a new valid accesstoken.

To login with a new provider you can send a request to the following route `http://api/auth/{provider_name}/login`. If you have a valid accesstoken, this will redirect you to their website and the provider will be connected with your account.
