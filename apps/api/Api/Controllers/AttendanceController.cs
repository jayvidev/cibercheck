using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Interfaces;
using CiberCheck.Features.Attendance.Entities;
using CiberCheck.Features.Attendance.Dtos;
using CiberCheck.Features.Common.Authorization;
using CiberCheck.Data;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Swagger.Examples;
using System.Linq;
using System.Security.Claims;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/attendances")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;
        private readonly ICourseService _courseService;
        private readonly ISectionService _sectionService;
        private readonly ISessionQrTokenService _qrTokenService;
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public AttendanceController(
            IAttendanceService service,
            ICourseService courseService,
            ISectionService sectionService,
            ISessionQrTokenService qrTokenService,
            ApplicationDbContext db,
            IMapper mapper)
        {
            _service = service;
            _courseService = courseService;
            _sectionService = sectionService;
            _qrTokenService = qrTokenService;
            _db = db;
            _mapper = mapper;
        }

        [HttpGet("course/{courseSlug}/section/{sectionSlug}/session/{sessionNumber:int}")]
        [RequireTeacher]
        [SwaggerOperation(
            Summary = "Ver asistencia de una sesión",
            Description = "Obtiene la lista de estudiantes de la sección con su asistencia para una sesión específica. Solo el profesor de esa sección puede acceder."
        )]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionAttendanceDtoExample))]
        public async Task<ActionResult<SessionAttendanceDto>> GetSessionAttendance(string courseSlug, string sectionSlug, int sessionNumber)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

            var course = await _courseService.GetBySlugAsync(courseSlug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
            if (section == null) return NotFound(new { message = "Sección no encontrada" });

            if (section.TeacherId != teacherId)
                return StatusCode(403, new { message = "No tienes permiso para acceder a esta sección" });

            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SectionId == section.SectionId && s.SessionNumber == sessionNumber);

            if (session == null) return NotFound(new { message = "Sesión no encontrada" });

            var sectionStudents = await _db.Users
                .Where(u => u.SectionsNavigation.Any(s => s.SectionId == section.SectionId))
                .ToListAsync();

            var attendanceRecords = await _db.Attendances
                .Where(a => a.SessionId == session.SessionId && 
                           sectionStudents.Select(s => s.UserId).Contains(a.StudentId))
                .ToListAsync();

            var studentsWithAttendance = sectionStudents
                .Select(student => 
                {
                    var attendance = attendanceRecords
                        .FirstOrDefault(a => a.StudentId == student.UserId);
                    
                    return new StudentAttendanceDto
                    {
                        StudentId = student.UserId,
                        FirstName = student.FirstName,
                        LastName = student.LastName,
                        Email = student.Email,
                        Status = attendance?.Status ?? "no_registrado",
                        Notes = attendance?.Notes
                    };
                })
                .OrderBy(s => s.LastName)
                .ThenBy(s => s.FirstName)
                .ToList();

            var result = new SessionAttendanceDto
            {
                SessionId = session.SessionId,
                CourseSlug = course.Slug,
                CourseName = course.Name,
                CourseCode = course.Code,
                SectionSlug = section.Slug,
                SectionName = section.Name,
                IsVirtual = section.IsVirtual,
                Date = session.Date,
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                SessionDate = session.Date,
                Students = studentsWithAttendance
            };

            return Ok(result);
        }

        [HttpGet("{studentId:int}/{sessionId:int}")]
        [SwaggerOperation(Summary = "Obtener asistencia por claves", Description = "Retorna una asistencia por StudentId y SessionId.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(AttendanceDtoExample))]
        public async Task<ActionResult<AttendanceDto>> GetById(int studentId, int sessionId)
        {
            var item = await _service.GetByIdAsync(studentId, sessionId);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<AttendanceDto>(item));
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Crear asistencia", Description = "Crea un registro de asistencia.")]
        [SwaggerRequestExample(typeof(CreateAttendanceDto), typeof(CreateAttendanceDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(AttendanceDtoExample))]
        public async Task<ActionResult<AttendanceDto>> Create([FromBody] CreateAttendanceDto dto)
        {
            var entity = _mapper.Map<Attendance>(dto);
            var created = await _service.CreateAsync(entity);
            var result = _mapper.Map<AttendanceDto>(created);
            return CreatedAtAction(nameof(GetById), new { studentId = result.StudentId, sessionId = result.SessionId }, result);
        }

        [HttpPut("{studentId:int}/{sessionId:int}")]
        [SwaggerOperation(Summary = "Actualizar asistencia", Description = "Actualiza un registro de asistencia.")]
        public async Task<IActionResult> Update(int studentId, int sessionId, [FromBody] UpdateAttendanceDto dto)
        {
            var existing = await _service.GetByIdAsync(studentId, sessionId);
            if (existing == null) return NotFound();
            _mapper.Map(dto, existing);
            var ok = await _service.UpdateAsync(studentId, sessionId, existing);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{studentId:int}/{sessionId:int}")]
        [SwaggerOperation(Summary = "Eliminar asistencia", Description = "Elimina un registro de asistencia.")]
        public async Task<IActionResult> Delete(int studentId, int sessionId)
        {
            var ok = await _service.DeleteAsync(studentId, sessionId);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("qr/course/{courseSlug}/section/{sectionSlug}/session/{sessionNumber:int}/generate")]
        [RequireTeacher]
        [SwaggerOperation(
            Summary = "Generar token QR",
            Description = "Genera un nuevo token QR que expira en 10 segundos. Solo el profesor de esa sección puede generar QRs."
        )]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionQrTokenDtoExample))]
        public async Task<ActionResult<SessionQrTokenDto>> GenerateQrToken(string courseSlug, string sectionSlug, int sessionNumber)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                    return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

                var course = await _courseService.GetBySlugAsync(courseSlug);
                if (course == null) return NotFound(new { message = "Curso no encontrado" });

                var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
                if (section == null) return NotFound(new { message = "Sección no encontrada" });

                if (section.TeacherId != teacherId)
                    return StatusCode(403, new { message = "No tienes permiso para generar QR en esta sección" });

                var session = await _db.Sessions
                    .Include(s => s.Section)
                    .FirstOrDefaultAsync(s => s.SectionId == section.SectionId && s.SessionNumber == sessionNumber);

                if (session == null) return NotFound(new { message = "Sesión no encontrada" });

                var token = await _qrTokenService.GenerateTokenAsync(session.SessionId);
                var result = _mapper.Map<SessionQrTokenDto>(token);
                result.IsVirtual = session.Section.IsVirtual;

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("qr/course/{courseSlug}/section/{sectionSlug}/session/{sessionNumber:int}/current")]
        [RequireTeacher]
        [SwaggerOperation(
            Summary = "Obtener token QR actual",
            Description = "Obtiene el token QR actual válido de una sesión. Solo el profesor de esa sección puede obtenerlo. Retorna null si ha expirado o no existe."
        )]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionQrTokenDtoExample))]
        public async Task<ActionResult<SessionQrTokenDto?>> GetCurrentQrToken(string courseSlug, string sectionSlug, int sessionNumber)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                    return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

                var course = await _courseService.GetBySlugAsync(courseSlug);
                if (course == null) return NotFound(new { message = "Curso no encontrado" });

                var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
                if (section == null) return NotFound(new { message = "Sección no encontrada" });

                if (section.TeacherId != teacherId)
                    return StatusCode(403, new { message = "No tienes permiso para acceder a esta sección" });

                var session = await _db.Sessions
                    .Include(s => s.Section)
                    .FirstOrDefaultAsync(s => s.SectionId == section.SectionId && s.SessionNumber == sessionNumber);

                if (session == null) return NotFound(new { message = "Sesión no encontrada" });

                var token = await _qrTokenService.GetCurrentTokenAsync(session.SessionId);
                if (token == null) return Ok(new { message = "No hay token válido" });

                var result = _mapper.Map<SessionQrTokenDto>(token);
                result.IsVirtual = session.Section.IsVirtual;
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("qr/scan")]
        [RequireStudent]
        [SwaggerOperation(
            Summary = "Marcar asistencia por QR",
            Description = "El estudiante escanea un QR y marca su asistencia en la sesión. El token debe ser válido y no haber expirado."
        )]
        [SwaggerRequestExample(typeof(AttendanceByQrDto), typeof(AttendanceByQrDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(AttendanceDtoExample))]
        public async Task<ActionResult<AttendanceDto>> MarkAttendanceByQr([FromBody] AttendanceByQrDto dto)
        {
            try
            {
                // Obtener el usuario autenticado
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int studentId))
                {
                    return Unauthorized(new { message = "Usuario no autenticado" });
                }

                // Validar que sea estudiante
                var user = await _db.Users.FindAsync(studentId);
                if (user == null || user.Role != "estudiante")
                {
                    return Forbid();
                }

                // Validar y obtener el token QR
                var qrToken = await _qrTokenService.ValidateAndGetTokenAsync(dto.Token);
                if (qrToken == null)
                {
                    return BadRequest(new { message = "Token QR inválido o expirado" });
                }

                var session = qrToken.Session;
                var section = session.Section;

                // Verificar que el estudiante pertenezca a la sección
                var isStudentInSection = await _db.Users
                    .Where(u => u.UserId == studentId)
                    .SelectMany(u => u.SectionsNavigation)
                    .AnyAsync(s => s.SectionId == section.SectionId);

                if (!isStudentInSection)
                {
                    return BadRequest(new { message = "No estás inscrito en esta sección" });
                }

                // Verificar si el estudiante ya marcó "presente" por QR
                var existingAttendance = await _db.Attendances
                    .FirstOrDefaultAsync(a => a.StudentId == studentId && a.SessionId == session.SessionId);

                if (existingAttendance != null && existingAttendance.Status == "presente")
                {
                    return BadRequest(new { message = "Ya has marcado asistencia en esta sesión" });
                }

                // Si hay registro con otro estado (ausente, tarde, justificado), eliminarlo para reemplazarlo
                if (existingAttendance != null && existingAttendance.Status != "presente")
                {
                    _db.Attendances.Remove(existingAttendance);
                    await _db.SaveChangesAsync();
                }

                // Crear nuevo registro de asistencia con estado "presente"
                var attendance = new Attendance
                {
                    StudentId = studentId,
                    SessionId = session.SessionId,
                    Status = "presente",
                    Notes = $"Marcado por QR a las {DateTime.Now:HH:mm:ss}"
                };

                var created = await _service.CreateAsync(attendance);
                var result = _mapper.Map<AttendanceDto>(created);

                return CreatedAtAction(nameof(GetById), new { studentId = result.StudentId, sessionId = result.SessionId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("qr/course/{courseSlug}/section/{sectionSlug}/session/{sessionNumber:int}/regenerate")]
        [RequireTeacher]
        [SwaggerOperation(
            Summary = "Regenerar token QR",
            Description = "Regenera un nuevo token QR para la sesión. Solo el profesor de esa sección puede regenerarlo. El anterior expira y se genera uno nuevo válido por 10 segundos."
        )]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SessionQrTokenDtoExample))]
        public async Task<ActionResult<SessionQrTokenDto>> RegenerateQrToken(string courseSlug, string sectionSlug, int sessionNumber)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                    return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

                var course = await _courseService.GetBySlugAsync(courseSlug);
                if (course == null) return NotFound(new { message = "Curso no encontrado" });

                var section = await _sectionService.GetBySlugAsync(course.CourseId, sectionSlug);
                if (section == null) return NotFound(new { message = "Sección no encontrada" });

                // Validar que el profesor sea el dueño de la sección
                if (section.TeacherId != teacherId)
                    return StatusCode(403, new { message = "No tienes permiso para regenerar QR en esta sección" });

                var session = await _db.Sessions
                    .Include(s => s.Section)
                    .FirstOrDefaultAsync(s => s.SectionId == section.SectionId && s.SessionNumber == sessionNumber);

                if (session == null) return NotFound(new { message = "Sesión no encontrada" });

                var token = await _qrTokenService.RegenerateTokenAsync(session.SessionId);
                var result = _mapper.Map<SessionQrTokenDto>(token);
                result.IsVirtual = session.Section.IsVirtual;

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("student/{studentId:int}/history")]
        [SwaggerOperation(
            Summary = "Filtrar por estudiante",
            Description = "historial de asistencias por estudiante"
        )]
        public async Task<ActionResult<List<StudentAttendanceViewDto>>> GetStudentHistory(int studentId)
        {
            var history = await _service.GetStudentHistoryAsync(studentId);
            if (history == null || !history.Any())
                return NotFound(new { message = "No se encontraron registros de asistencia para este estudiante" });

            return Ok(history);
        }

        [HttpGet("student/{studentId:int}/history/by-date")]
        [SwaggerOperation(
            Summary = "Filtrar por fecha",
            Description = "historial de asistencias por estudiante filtrado por fecha"
        )]
        public async Task<ActionResult<List<StudentAttendanceViewDto>>> GetHistoryByDate(
    int studentId, [FromQuery] DateOnly date)
        {
            var result = await _service.GetHistoryByDateAsync(studentId, date);
            return Ok(result);
        }

        
        [HttpGet("student/{studentId:int}/history/by-status")]
        [SwaggerOperation(
            Summary = "Filtrar por estado",
            Description = "historial de asistencias por estudiante filtrado por estado"
        )]
        public async Task<ActionResult<List<StudentAttendanceViewDto>>> GetHistoryByStatus(
    int studentId, [FromQuery] string status)
        {
            var result = await _service.GetHistoryByStatusAsync(studentId, status);
            return Ok(result);
        }

        
        [HttpGet("student/{studentId:int}/history/filter")]
        [SwaggerOperation(
            Summary = "Filtrar por fecha y estado de estudiante",
            Description = "historial de asistencias por estudiante con filtros combinados"
        )]
        public async Task<ActionResult<List<StudentAttendanceViewDto>>> FilterHistory(
    int studentId,
    [FromQuery] DateOnly? date,
    [FromQuery] string? status)
        {
            var result = await _service.FilterHistoryAsync(studentId, date, status);
            return Ok(result);
        }

        [HttpPost("bulk-mark")]
        [RequireTeacher]
        [SwaggerOperation(
            Summary = "Marcar asistencias en lote (profesor)",
            Description = "Permite al profesor enviar el estado de varios estudiantes para una sesión en una sola petición."
        )]
        public async Task<IActionResult> BulkMark([FromBody] BulkAttendanceDto dto)
        {
            try
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                    return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

                var session = await _db.Sessions.Include(s => s.Section).FirstOrDefaultAsync(s => s.SessionId == dto.SessionId);
                if (session == null) return NotFound(new { message = "Sesión no encontrada" });

                var section = session.Section;
                if (section == null) return NotFound(new { message = "Sección vinculada a la sesión no encontrada" });

                if (section.TeacherId != teacherId)
                    return StatusCode(403, new { message = "No tienes permiso para marcar asistencia en esta sección" });

                var studentIds = dto.Items.Select(i => i.StudentId).Distinct().ToList();
                var studentsInSection = await _db.Users
                    .Where(u => studentIds.Contains(u.UserId) && u.SectionsNavigation.Any(s => s.SectionId == section.SectionId))
                    .Select(u => u.UserId)
                    .ToListAsync();

                var notInSection = studentIds.Except(studentsInSection).ToList();
                if (notInSection.Any())
                    return BadRequest(new { message = "Algunos estudiantes no pertenecen a la sección", students = notInSection });

                using var tx = await _db.Database.BeginTransactionAsync();
                try
                {
                    foreach (var item in dto.Items)
                    {
                        var existing = await _db.Attendances.FirstOrDefaultAsync(a => a.StudentId == item.StudentId && a.SessionId == dto.SessionId);
                        if (existing == null)
                        {
                            var newEntity = new Attendance
                            {
                                StudentId = item.StudentId,
                                SessionId = dto.SessionId,
                                Status = item.Status,
                                Notes = item.Notes
                            };
                            _db.Attendances.Add(newEntity);
                        }
                        else
                        {
                            existing.Status = item.Status;
                            existing.Notes = item.Notes;
                            _db.Attendances.Update(existing);
                        }
                    }

                    await _db.SaveChangesAsync();
                    await tx.CommitAsync();
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}