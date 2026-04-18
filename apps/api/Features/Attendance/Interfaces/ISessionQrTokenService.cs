using System.Threading.Tasks;
using CiberCheck.Features.Attendance.Entities;

namespace CiberCheck.Interfaces
{
    public interface ISessionQrTokenService
    {
        Task<SessionQrToken> GenerateTokenAsync(int sessionId);
        Task<SessionQrToken?> GetCurrentTokenAsync(int sessionId);
        Task<SessionQrToken?> ValidateAndGetTokenAsync(string token);
        Task<SessionQrToken> RegenerateTokenAsync(int sessionId);
        Task<bool> IsTokenValidAsync(string token);
    }
}
