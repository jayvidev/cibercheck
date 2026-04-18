using CiberCheck.Interfaces;
using MimeKit;
using Google.Apis.Services;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using CiberCheck.Features.Otps.Services;
using Microsoft.Extensions.Options;
using CiberCheck.Features.Common.Options;

public class GmailServiceSender : IEmailSender
{
    private readonly GmailService _service;
    private readonly GoogleOptions _options;

    public GmailServiceSender(IGoogleCredentialProvider credentialProvider, IOptions<GoogleOptions> options)
    {
        _options = options.Value;
        var credential = credentialProvider.GetCredential();
        _service = new GmailService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = credential,
            ApplicationName = _options.AppName
        });
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        // Gmail API usa "me" como remitente asociado a las credenciales
        message.From.Add(new MailboxAddress(_options.AppName, "me"));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var ms = new MemoryStream();
        await message.WriteToAsync(ms);
        var rawMessage = Convert.ToBase64String(ms.ToArray())
            .Replace('+', '-').Replace('/', '_').Replace("=", "");

        var gmailMessage = new Message { Raw = rawMessage };
        await _service.Users.Messages.Send(gmailMessage, "me").ExecuteAsync();
    }
}
