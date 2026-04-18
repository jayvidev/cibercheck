using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;
using CiberCheck.Features.Attendance.Entities;

namespace CiberCheck.Services
{
    public class SessionQrTokenService : ISessionQrTokenService
    {
        private readonly ApplicationDbContext _db;
        private const int TOKEN_EXPIRATION_SECONDS = 12;

        public SessionQrTokenService(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Genera un nuevo token QR para una sesión
        /// </summary>
        public async Task<SessionQrToken> GenerateTokenAsync(int sessionId)
        {
            var session = await _db.Sessions.FindAsync(sessionId);
            if (session == null)
                throw new InvalidOperationException("Sesión no encontrada");

            // Eliminar token anterior si existe
            var existingToken = await _db.SessionQrTokens
                .FirstOrDefaultAsync(t => t.SessionId == sessionId);
            
            if (existingToken != null)
            {
                _db.SessionQrTokens.Remove(existingToken);
            }

            // Generar nuevo token único
            string token = GenerateUniqueToken();
            var now = DateTime.UtcNow;
            var expiresAt = now.AddSeconds(TOKEN_EXPIRATION_SECONDS);

            var newToken = new SessionQrToken
            {
                SessionId = sessionId,
                Token = token,
                CreatedAt = now,
                ExpiresAt = expiresAt
            };

            _db.SessionQrTokens.Add(newToken);
            await _db.SaveChangesAsync();

            return newToken;
        }

        /// <summary>
        /// Obtiene el token actual válido de una sesión
        /// </summary>
        public async Task<SessionQrToken?> GetCurrentTokenAsync(int sessionId)
        {
            var token = await _db.SessionQrTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.SessionId == sessionId);

            if (token == null || token.IsExpired)
                return null;

            return token;
        }

        /// <summary>
        /// Valida un token QR y lo retorna si es válido
        /// </summary>
        public async Task<SessionQrToken?> ValidateAndGetTokenAsync(string token)
        {
            var qrToken = await _db.SessionQrTokens
                .AsNoTracking()
                .Include(t => t.Session)
                    .ThenInclude(s => s.Section)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (qrToken == null || qrToken.IsExpired)
                return null;

            return qrToken;
        }

        /// <summary>
        /// Regenera el token QR para una sesión (válido por 10 segundos)
        /// </summary>
        public async Task<SessionQrToken> RegenerateTokenAsync(int sessionId)
        {
            return await GenerateTokenAsync(sessionId);
        }

        /// <summary>
        /// Valida si un token es válido y no ha expirado
        /// </summary>
        public async Task<bool> IsTokenValidAsync(string token)
        {
            var qrToken = await _db.SessionQrTokens
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Token == token);

            return qrToken != null && !qrToken.IsExpired;
        }

        /// <summary>
        /// Genera un token único basado en GUID
        /// </summary>
        private string GenerateUniqueToken()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 16).ToUpper();
        }
    }
}
