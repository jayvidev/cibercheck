using CiberCheck.Data;
using CiberCheck.Features.Otps.Entities;
using CiberCheck.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Collections.Generic;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _db;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public OtpService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _jwtSecret = config["Jwt:Secret"]; // Lee el secret desde appsettings.json
        _jwtIssuer = config["Jwt:Issuer"] ?? "CiberCheckAPI";
        _jwtAudience = config["Jwt:Audience"] ?? "CiberCheckClients";
    }

    public async Task<Otp> GenerateOtpAsync(string email, string? ipAddress = null, string? deviceId = null)
    {
        // Debug: imprimir email recibido
        Console.WriteLine($"[OtpService] GenerateOtpAsync email: {email}");

        // Validar que el usuario exista
        var userExists = await _db.Users.AnyAsync(u => u.Email == email);
        if (!userExists)
        {
            throw new KeyNotFoundException("No se encontro el usuario con ese email");
        }

        var lastOtp = await _db.Otp
            .Where(o => o.Email == email)
            .OrderByDescending(o => o.FechaCreacion)
            .FirstOrDefaultAsync();

        if (lastOtp != null && (DateTime.UtcNow - lastOtp.FechaCreacion).TotalSeconds < 30)
            throw new InvalidOperationException("Espere 30 segundos antes de generar un nuevo código.");

        // Invalida OTPs anteriores
        var oldOtps = await _db.Otp.Where(o => o.Email == email && !o.Usado).ToListAsync();
        foreach (var otp in oldOtps) otp.Usado = true;

        var codigo = GenerateSecureOtp();

        var newOtp = new Otp
        {
            Email = email,
            Codigo = codigo,
            FechaCreacion = DateTime.UtcNow,
            FechaExpiracion = DateTime.UtcNow.AddMinutes(5),
            Usado = false
        };

        _db.Otp.Add(newOtp);
        await _db.SaveChangesAsync();

        // Solo para pruebas: mostrar OTP en consola
        Console.WriteLine($"OTP para {email}: {codigo}");

        return newOtp;
    }

    // Verifica OTP y retorna objeto con jwt_token y student_id
    public async Task<Dictionary<string, object>?> VerifyOtpAsync(string email, string codigo)
    {
        var otp = await _db.Otp
            .Where(o => o.Email == email && o.Codigo == codigo && !o.Usado && o.FechaExpiracion >= DateTime.UtcNow)
            .OrderByDescending(o => o.FechaCreacion)
            .FirstOrDefaultAsync();

        if (otp == null) return null;

        otp.Usado = true;
        await _db.SaveChangesAsync();

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            throw new KeyNotFoundException("No se encontro el usuario con ese email");
        }

        var token = await GenerateJwtTokenAsync(user);

        var isStudent = string.Equals(user.Role, "estudiante", StringComparison.OrdinalIgnoreCase);
        return new Dictionary<string, object>
        {
            { "token", token },
            { "studentId", isStudent ? user.UserId : 0 }
        };
    }

    public async Task<Otp?> GetLastOtpByEmailAsync(string email)
    {
        return await _db.Otp
            .Where(o => o.Email == email)
            .OrderByDescending(o => o.FechaCreacion)
            .FirstOrDefaultAsync();
    }

    private string GenerateSecureOtp()
    {
        using var rng = RandomNumberGenerator.Create();
        byte[] bytes = new byte[4];
        rng.GetBytes(bytes);
        int value = BitConverter.ToInt32(bytes, 0) % 1000000;
        value = Math.Abs(value);
        return value.ToString("D6");
    }

    private async Task<string> GenerateJwtTokenAsync(CiberCheck.Features.Users.Entities.User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString())
        };
        if (!string.IsNullOrWhiteSpace(user.Role))
        {
            claims.Add(new Claim(ClaimTypes.Role, user.Role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _jwtIssuer,
            Audience = _jwtAudience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
