using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Interfaces;
using CiberCheck.Features.Users.Entities;
using CiberCheck.Features.Users.Dtos;
using CiberCheck.Features.Users.Security;
using CiberCheck.Swagger.Examples;
using System.Text.RegularExpressions;
using CiberCheck.Features.Common.Authorization;
using System.Security.Claims;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/users")]
    public class UserController : ControllerBase
    {
        public class ChangePasswordBody { public string CurrentPassword { get; set; } = string.Empty; public string NewPassword { get; set; } = string.Empty; }
    public class UpdateProfileBody { public string? FirstName { get; set; } public string? LastName { get; set; } public string? ProfileImageUrl { get; set; } }
        private readonly IUserService _service;
        private readonly IMapper _mapper;
        private readonly JwtService _jwtService;

        public UserController(IUserService service, IMapper mapper, JwtService jwtService)
        {
            _service = service;
            _mapper = mapper;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        [SwaggerOperation(Summary = "Iniciar sesión", Description = "Autentica un usuario y retorna un token JWT.")]
        [SwaggerRequestExample(typeof(LoginDto), typeof(LoginDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(LoginResponseDtoExample))]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
        {
            var user = await _service.GetByEmailAsync(dto.Email);
            if (user == null || !PasswordHasher.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Credenciales inválidas",
                    Detail = "El email o la contraseña son incorrectos.",
                    Status = StatusCodes.Status401Unauthorized
                });
            }

            var token = _jwtService.GenerateToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            return Ok(new LoginResponseDto
            {
                Token = token,
                User = userDto
            });
        }

        private static bool IsValidPassword(string password)
        {
            var regex = new Regex("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])\\S{8,50}$");
            return regex.IsMatch(password);
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Listar usuarios", Description = "Obtiene todos los usuarios.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(UserDtoListExample))]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _service.GetAllAsync();
            return Ok(_mapper.Map<List<UserDto>>(users));
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(Summary = "Obtener usuario por Id", Description = "Retorna un usuario por su identificador.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(UserDtoExample))]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(_mapper.Map<UserDto>(user));
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Crear usuario", Description = "Crea un nuevo usuario.")]
        [SwaggerRequestExample(typeof(CreateUserDto), typeof(CreateUserDtoExample))]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
        {
            if (await _service.EmailExistsAsync(dto.Email))
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Email ya registrado",
                    Detail = "El email proporcionado ya existe.",
                    Status = StatusCodes.Status409Conflict
                });
            }

            if (!IsValidPassword(dto.Password))
            {
                return BadRequest(new { message = "La contraseña no cumple la política: mínimo 8 caracteres, sin espacios, e incluir minúscula, mayúscula, número y un carácter especial (@$!%*?&)." });
            }

            var entity = _mapper.Map<User>(dto);
            entity.PasswordHash = PasswordHasher.Hash(dto.Password);

            var created = await _service.CreateAsync(entity);
            var result = _mapper.Map<UserDto>(created);
            return CreatedAtAction(nameof(GetById), new { id = result.UserId }, result);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(Summary = "Actualizar usuario", Description = "Actualiza un usuario existente.")]
        [SwaggerRequestExample(typeof(UpdateUserDto), typeof(UpdateUserDtoExample))]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            _mapper.Map(dto, existing);

            var ok = await _service.UpdateAsync(id, existing);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(Summary = "Eliminar usuario", Description = "Elimina un usuario por su identificador.")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        // --- perfil y contraseña ---
        [HttpPost("{id:int}/change-password")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Cambiar contraseña", Description = "Permite al usuario cambiar su contraseña validando la actual.")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordBody dto)
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Usuario no encontrado" });

            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var requesterId))
                return Unauthorized(new { message = "Token inválido" });
            var isAdmin = string.Equals(roleClaim, "administrador", System.StringComparison.OrdinalIgnoreCase);
            if (!isAdmin && requesterId != user.UserId)
                return StatusCode(403, new { message = "No tienes permiso para cambiar esta contraseña" });

            if (!PasswordHasher.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "La contraseña actual no es válida" });
            }

            if (!IsValidPassword(dto.NewPassword))
            {
                return BadRequest(new { message = "La contraseña nueva no cumple la política: mínimo 8 caracteres, sin espacios, e incluir minúscula, mayúscula, número y un carácter especial (@$!%*?&)." });
            }

            if (dto.NewPassword == dto.CurrentPassword)
            {
                return BadRequest(new { message = "La nueva contraseña no puede ser igual a la actual" });
            }

            user.PasswordHash = PasswordHasher.Hash(dto.NewPassword);
            var ok = await _service.UpdateAsync(user.UserId, user);
            if (!ok) return NotFound();
            return Ok(new { message = "Contraseña cambiada exitosamente" });
        }

        [HttpPut("{id:int}/profile")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Actualizar perfil", Description = "Actualiza datos de perfil (nombre y apellido). El correo no se puede modificar aquí.")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileBody dto)
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Usuario no encontrado" });

            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var requesterId))
                return Unauthorized(new { message = "Token inválido" });
            var isAdmin = string.Equals(roleClaim, "administrador", System.StringComparison.OrdinalIgnoreCase);
            if (!isAdmin && requesterId != user.UserId)
                return StatusCode(403, new { message = "No tienes permiso para actualizar este perfil" });

            if (dto.FirstName != null) user.FirstName = dto.FirstName;
            if (dto.LastName != null) user.LastName = dto.LastName;
            // Allow clearing the profile image by sending null or empty string
            if (dto.ProfileImageUrl == "") dto.ProfileImageUrl = null;
            user.ProfileImageUrl = dto.ProfileImageUrl;

            var ok = await _service.UpdateAsync(user.UserId, user);
            if (!ok) return NotFound();
            return Ok(new { message = "Perfil actualizado exitosamente" });
        }
    }
}
