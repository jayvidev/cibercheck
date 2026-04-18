using Microsoft.AspNetCore.Mvc;
using CiberCheck.Interfaces;
using CiberCheck.Features.Sessions.Entities;
using CiberCheck.Features.Sessions.Dtos;
using CiberCheck.Features.Common.Authorization;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Swagger.Examples;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/sessions")]
    public class SessionController : ControllerBase
    {
        private readonly ISessionService _service;
        private readonly ICourseService _courseService;
        private readonly ISectionService _sectionService;
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public SessionController(
            ISessionService service, 
            ICourseService courseService,
            ISectionService sectionService,
            ApplicationDbContext db,
            IMapper mapper)
        {
            _service = service;
            _courseService = courseService;
            _sectionService = sectionService;
            _db = db;
            _mapper = mapper;
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(Summary = "Obtener sesión por Id", Description = "Retorna una sesión por su identificador (para CRUD).")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionDtoExample))]
        public async Task<ActionResult<SessionDto>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<SessionDto>(item));
        }

        [HttpGet("course/{courseSlug}/section/{sectionSlug}")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(
            Summary = "Listar sesiones por slugs", 
            Description = "Obtiene todas las sesiones de una sección del profesor o administrador autenticado usando slugs con estadísticas de asistencia."
        )]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionWithStatsExample))]
        public async Task<ActionResult> GetSessionsBySlugs(string courseSlug, string sectionSlug)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var userId))
                return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            var course = await _courseService.GetBySlugAsync(courseSlug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
            if (section == null) return NotFound(new { message = "Sección no encontrada" });

            if (userRole != "administrador" && section.TeacherId != userId)
                return StatusCode(403, new { message = "No tienes permiso para acceder a las sesiones de esta sección" });

            var studentIds = await _db.Users
                .Where(u => u.SectionsNavigation.Any(s => s.SectionId == section.SectionId))
                .Select(u => u.UserId)
                .ToListAsync();

            int totalStudents = studentIds.Count;

            var sessions = await _db.Sessions
                .Where(s => s.SectionId == section.SectionId)
                .GroupJoin(
                    _db.Attendances.Where(a => studentIds.Contains(a.StudentId)),
                    session => session.SessionId,
                    attendance => attendance.SessionId,
                    (session, attendances) => new
                    {
                        courseSlug,
                        sectionSlug,
                        sessionNumber = session.SessionNumber,
                        date = session.Date,
                        startTime = session.StartTime,
                        endTime = session.EndTime,
                        topic = session.Topic,
                        attendanceStats = new
                        {
                            presente = attendances.Count(a => a.Status == "presente"),
                            ausente = attendances.Count(a => a.Status == "ausente"),
                            tarde = attendances.Count(a => a.Status == "tarde"),
                            justificado = attendances.Count(a => a.Status == "justificado"),
                            no_registrado = totalStudents - attendances.Select(a => a.StudentId).Distinct().Count()
                        }
                    })
                .OrderBy(s => s.sessionNumber)
                .AsNoTracking()
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("course/{courseSlug}/section/{sectionSlug}/number/{sessionNumber:int}")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(
            Summary = "Obtener sesión por slugs y número",
            Description = "Resuelve y retorna una sesión incluyendo su SessionId usando courseSlug, sectionSlug y sessionNumber.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionDtoExample))]
        public async Task<ActionResult<SessionDto>> GetSessionBySlugsAndNumber(string courseSlug, string sectionSlug, int sessionNumber)
        {
            var course = await _courseService.GetBySlugAsync(courseSlug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
            if (section == null) return NotFound(new { message = "Sección no encontrada" });

            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SectionId == section.SectionId && s.SessionNumber == sessionNumber);

            if (session == null) return NotFound(new { message = "Sesión no encontrada" });

            return Ok(_mapper.Map<SessionDto>(session));
        }

        [HttpGet("student/day")]
        [Authorize(Roles = "estudiante")]
        [SwaggerOperation(Summary = "Sesiones del día para el alumno autenticado", Description = "Retorna cursos, sección, horas y tópico de las sesiones del día para el alumno del token. Parámetro opcional 'date' (yyyy-MM-dd).")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(StudentDailyCourseListExample))]
        public async Task<ActionResult<List<StudentDailyCourseDto>>> GetStudentDailySessions([FromQuery] DateOnly? date)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var studentId))
                return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

            var result = await _service.GetStudentCoursesByDateAsync(studentId, date);
            return Ok(result);
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Crear sesión", Description = "Crea una nueva sesión.")]
        [SwaggerRequestExample(typeof(CreateSessionDto), typeof(CreateSessionDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(SessionDtoExample))]
        public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionDto dto)
        {
            var entity = _mapper.Map<Session>(dto);
            var created = await _service.CreateAsync(entity);
            var result = _mapper.Map<SessionDto>(created);
            return CreatedAtAction(nameof(GetById), new { id = result.SessionId }, result);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(Summary = "Actualizar sesión", Description = "Actualiza una sesión existente.")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSessionDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            _mapper.Map(dto, existing);
            var ok = await _service.UpdateAsync(id, existing);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(Summary = "Eliminar sesión", Description = "Elimina una sesión por su identificador.")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
