// IEmailSender.cs
using System.Threading.Tasks;

namespace CiberCheck.Interfaces 
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
