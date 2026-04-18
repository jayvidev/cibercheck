namespace CiberCheck.Features.Common.Options
{
    public class GoogleOptions
    {
        // OAuth2 Installed Client
        public string? InstalledClientJson { get; set; }
        public string? OAuthRefreshToken { get; set; }
        public string? OAuthUserId { get; set; }

        public string AppName { get; set; } = "CiberCheck";
    }
}
