using System;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace CiberCheck.Features.Otps.Dtos
{
    [SwaggerSchema(Description = "Código OTP generado para verificación")]
    public class OtpDto
    {
        [SwaggerSchema(Description = "Identificador único del código OTP")]
        public int OtpId { get; set; }

        [SwaggerSchema(Description = "Correo electrónico asociado al OTP")]
        public string Email { get; set; } = null!;

        [SwaggerSchema(Description = "Código de verificación de 6 dígitos")]
        public string Codigo { get; set; } = null!;

        [SwaggerSchema(Description = "Fecha de creación del OTP")]
        public DateTime FechaCreacion { get; set; }

        [SwaggerSchema(Description = "Fecha de expiración del OTP")]
        public DateTime FechaExpiracion { get; set; }

        [SwaggerSchema(Description = "Indica si el OTP ya fue utilizado")]
        public bool Usado { get; set; }
    }

    [SwaggerSchema(Description = "Payload para solicitar un nuevo código OTP")]
    public class CreateOtpDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema(Description = "Correo electrónico al que se enviará el código")]
        public string Email { get; set; } = null!;
    }

    [SwaggerSchema(Description = "Payload para verificar un código OTP")]
    public class VerifyOtpDto
    {
        [Required]
        [EmailAddress]
        [SwaggerSchema(Description = "Correo electrónico del usuario")]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "El código debe tener exactamente 6 dígitos")]
        [SwaggerSchema(Description = "Código de verificación recibido")]
        public string Codigo { get; set; } = null!;
    }
}
