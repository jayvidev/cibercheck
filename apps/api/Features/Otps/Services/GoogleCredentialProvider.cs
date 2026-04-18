using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Microsoft.Extensions.Options;
using CiberCheck.Features.Common.Options;
using Google.Apis.Util.Store;

namespace CiberCheck.Features.Otps.Services
{
    public interface IGoogleCredentialProvider
    {
        GoogleCredential GetCredential();
    }

    public class GoogleCredentialProvider : IGoogleCredentialProvider
    {
        private readonly GoogleOptions _options;

        public GoogleCredentialProvider(IOptions<GoogleOptions> options)
        {
            _options = options.Value;
        }

        public GoogleCredential GetCredential()
        {
            if (string.IsNullOrWhiteSpace(_options.InstalledClientJson) || string.IsNullOrWhiteSpace(_options.OAuthRefreshToken))
            {
                throw new InvalidOperationException("Google OAuth2 not configured. Provide Google:InstalledClientJson and Google:OAuthRefreshToken.");
            }

            var clientSecrets = GoogleClientSecrets.FromStream(new MemoryStream(System.Text.Encoding.UTF8.GetBytes(_options.InstalledClientJson))).Secrets;
            var flow = new Google.Apis.Auth.OAuth2.Flows.GoogleAuthorizationCodeFlow(new Google.Apis.Auth.OAuth2.Flows.GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = clientSecrets,
                Scopes = new[] { GmailService.Scope.GmailSend },
                DataStore = new NullDataStore()
            });

            var token = new Google.Apis.Auth.OAuth2.Responses.TokenResponse
            {
                RefreshToken = _options.OAuthRefreshToken
            };

            var userId = _options.OAuthUserId ?? "gmail-user";
            var credential = new UserCredential(flow, userId, token);
            var _ = credential.GetAccessTokenForRequestAsync().GetAwaiter().GetResult();

            return GoogleCredential.FromAccessToken(credential.Token.AccessToken);
        }
    }
}
