using System;
using System.Collections.Generic;
using CiberCheck.Features.Otps.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    // Ejemplo para crear un OTP
    public class CreateOtpDtoExample : IExamplesProvider<CreateOtpDto>
    {
        public CreateOtpDto GetExamples() => new CreateOtpDto
        {
            Email = "usuario@correo.com"
        };
    }

    // Ejemplo para verificar un OTP
    public class VerifyOtpDtoExample : IExamplesProvider<VerifyOtpDto>
    {
        public VerifyOtpDto GetExamples() => new VerifyOtpDto
        {
            Email = "usuario@correo.com",
            Codigo = "123456"
        };
    }

    // Ejemplo de un OTP completo
    public class OtpDtoExample : IExamplesProvider<OtpDto>
    {
        public OtpDto GetExamples() => new OtpDto
        {
            Email = "usuario@correo.com",
            Codigo = "123456",
            FechaCreacion = DateTime.UtcNow,
            FechaExpiracion = DateTime.UtcNow.AddMinutes(5),
            Usado = false
        };
    }

    // Ejemplo de lista de OTPs
    public class OtpDtoListExample : IExamplesProvider<IEnumerable<OtpDto>>
    {
        public IEnumerable<OtpDto> GetExamples() => new List<OtpDto>
        {
            new OtpDto
            {
                Email = "usuario1@correo.com",
                Codigo = "654321",
                FechaCreacion = DateTime.UtcNow.AddMinutes(-3),
                FechaExpiracion = DateTime.UtcNow.AddMinutes(2),
                Usado = false
            },
            new OtpDto
            {
                Email = "usuario2@correo.com",
                Codigo = "123456",
                FechaCreacion = DateTime.UtcNow.AddMinutes(-10),
                FechaExpiracion = DateTime.UtcNow.AddMinutes(-5),
                Usado = true
            }
        };
    }
}
