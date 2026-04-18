using System.Threading.Tasks;
using CiberCheck.Features.Otps.Entities;
using System.Collections.Generic;

namespace CiberCheck.Interfaces
{
    public interface IOtpService
    {
        Task<Otp> GenerateOtpAsync(string email, string? ipAddress = null, string? deviceId = null);

        
        /// Verifica un OTP y retorna un objeto con el JWT y el student_id
 
        Task<Dictionary<string, object>?> VerifyOtpAsync(string email, string codigo);


        /// Obtiene el último OTP generado para un correo.
       
        Task<Otp?> GetLastOtpByEmailAsync(string email);


    }
}
