using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CiberCheck.Interfaces;
using CiberCheck.Features.Otps.Dtos;
using CiberCheck.Features.Otps.Entities;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Swagger.Examples;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/otps")]
    public class OtpController : ControllerBase
    {
        private readonly IOtpService _service;
        private readonly IMapper _mapper;
        private readonly IEmailSender _emailSender;

        public OtpController(IOtpService service, IMapper mapper, IEmailSender emailSender)
        {
            _service = service;
            _mapper = mapper;
            _emailSender = emailSender;
        }

        /// <summary>
        /// Genera un nuevo OTP para un correo.
        /// </summary>
        [HttpPost("generate-otp")]
        [SwaggerOperation(Summary = "Generar OTP", Description = "Genera un nuevo código OTP para el correo indicado.")]
        [SwaggerRequestExample(typeof(CreateOtpDto), typeof(CreateOtpDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(OtpDtoExample))]
        public async Task<ActionResult<OtpDto>> Generate([FromBody] CreateOtpDto dto)
        {
            try
            {
                var otp = await _service.GenerateOtpAsync(dto.Email);
                var result = _mapper.Map<OtpDto>(otp);

                // Enviar OTP usando el servicio inyectado
                try
                {
                    await _emailSender.SendEmailAsync(
                        dto.Email,
                        "Tu código OTP",
                        $"Tu código OTP es: {result.Codigo}"
                    );
                }
                catch (System.Exception ex)
                {
                    return StatusCode(StatusCodes.Status202Accepted, new
                    {
                        email = result.Email,
                        codigo = result.Codigo, // solo para pruebas
                        message = "OTP generado, pero falló el envío de correo.",
                        error = ex.Message
                    });
                }

                return Created(string.Empty, new
                {
                    email = result.Email,
                    codigo = result.Codigo // solo para pruebas
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Verifica un OTP y devuelve jwt_token y student_id si es válido.
        /// </summary>
        [HttpPost("verify-otp")]
        [SwaggerOperation(Summary = "Verificar OTP", Description = "Verifica que el código OTP ingresado sea válido y devuelve jwt_token y student_id.")]
        [SwaggerRequestExample(typeof(VerifyOtpDto), typeof(VerifyOtpDtoExample))]
        [SwaggerResponse(StatusCodes.Status200OK, "OTP válido, devuelve jwt_token y student_id")]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "OTP inválido o expirado")]
        public async Task<IActionResult> Verify([FromBody] VerifyOtpDto dto)
        {
            var result = await _service.VerifyOtpAsync(dto.Email, dto.Codigo);
            if (result == null) return BadRequest(new { message = "OTP inválido o expirado" });

            return Ok(result);
        }

        /// <summary>
        /// Obtiene el último OTP generado para un correo.
        /// </summary>
        [HttpGet("{email}")]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(Summary = "Obtener último OTP", Description = "Devuelve el último OTP generado para un correo.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(OtpDtoExample))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "No se encontró OTP para este correo")]
        public async Task<ActionResult<OtpDto>> GetLastByEmail(string email)
        {
            var otp = await _service.GetLastOtpByEmailAsync(email);
            if (otp == null) return NotFound(new { message = "No se encontró OTP para este correo" });

            return Ok(_mapper.Map<OtpDto>(otp));
        }

        
    }
}
