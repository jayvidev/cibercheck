using Microsoft.AspNetCore.Mvc;
using CiberCheck.Interfaces;
using CiberCheck.Features.Sections.Entities;
using CiberCheck.Features.Sections.Dtos;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Swagger.Examples;
using CiberCheck.Features.Common.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/sections")]
    public class SectionController : ControllerBase
    {
        private readonly ISectionService _service;
        private readonly ICourseService _courseService;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _db;

        public SectionController(ISectionService service, ICourseService courseService, ApplicationDbContext db, IMapper mapper)
        {
            _service = service;
            _courseService = courseService;
            _db = db;
            _mapper = mapper;
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(Summary = "Obtener sección por Id", Description = "Retorna una sección por su identificador numérico (para CRUD).")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SectionDtoExample))]
        public async Task<ActionResult<SectionDto>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<SectionDto>(item));
        }

        [HttpGet("course/{courseSlug}")]
        [RequireTeacher]
        [SwaggerOperation(Summary = "Listar secciones por slug de curso", Description = "Obtiene todas las secciones de un curso con estadísticas (sesiones y estudiantes). Solo profesores pueden acceder a las secciones que imparten.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(SectionStatsDtoListExample))]
        public async Task<ActionResult<IEnumerable<SectionStatsDto>>> GetSectionsByCourseSlug(string courseSlug)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var teacherId))
                return Unauthorized(new { message = "Token inválido o sin identificador de usuario" });

            var course = await _courseService.GetBySlugAsync(courseSlug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var sections = course.Sections
                .Where(s => s.TeacherId == teacherId)
                .Select(s => new SectionStatsDto
                {
                    SectionSlug = s.Slug,
                    SectionName = s.Name,
                    TotalSessions = s.Sessions?.Count ?? 0,
                    TotalStudents = s.Students?.Count ?? 0,
                    IsVirtual = s.IsVirtual
                })
                .ToList();

            if (!sections.Any()) 
                return StatusCode(403, new { message = "No tienes permiso para acceder a estas secciones" });

            return Ok(sections);
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Crear sección", Description = "Crea una nueva sección.")]
        [SwaggerRequestExample(typeof(CreateSectionDto), typeof(CreateSectionDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(SectionDtoExample))]
        public async Task<ActionResult<SectionDto>> Create([FromBody] CreateSectionDto dto)
        {
            var entity = _mapper.Map<Section>(dto);
            var created = await _service.CreateAsync(entity);
            var result = _mapper.Map<SectionDto>(created);
            return CreatedAtAction(nameof(GetById), new { id = result.SectionId }, result);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(Summary = "Actualizar sección", Description = "Actualiza una sección existente.")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSectionDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            _mapper.Map(dto, existing);
            var ok = await _service.UpdateAsync(id, existing);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(Summary = "Eliminar sección", Description = "Elimina una sección por su identificador.")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        // --- Matrícula ---

        [HttpGet("student/{studentId:int}")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Listar secciones por alumno", Description = "Obtiene todas las secciones en las que está matriculado un alumno, incluyendo datos del curso.")]
        public async Task<ActionResult> GetSectionsByStudent(int studentId)
        {
            var sections = await _db.Sections
                .AsNoTracking()
                .Include(s => s.Course)
                .Where(s => s.Students.Any(st => st.UserId == studentId))
                .Select(s => new
                {
                    sectionId = s.SectionId,
                    name = s.Name,
                    slug = s.Slug,
                    isVirtual = s.IsVirtual,
                    teacherId = s.TeacherId,
                    courseId = s.CourseId,
                    courseName = s.Course.Name,
                    courseSlug = s.Course.Slug
                })
                .ToListAsync();

            return Ok(sections);
        }

        public class EnrollDto { public int StudentId { get; set; } }

        [HttpPost("{sectionId:int}/enroll")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Matricular alumno en sección", Description = "Agrega la relación alumno-sección si no existe.")]
        public async Task<IActionResult> EnrollStudent(int sectionId, [FromBody] EnrollDto dto)
        {
            var section = await _db.Sections
                .Include(s => s.Students)
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
            if (section == null) return NotFound(new { message = "Sección no encontrada" });

            var student = await _db.Users.FirstOrDefaultAsync(u => u.UserId == dto.StudentId);
            if (student == null) return NotFound(new { message = "Alumno no encontrado" });

            // Validación: no permitir que un alumno esté en dos secciones del mismo curso
            var existingInSameCourse = await _db.Sections
                .AsNoTracking()
                .Include(s => s.Course)
                .Where(s => s.CourseId == section.CourseId && s.Students.Any(u => u.UserId == dto.StudentId))
                .FirstOrDefaultAsync();

            if (existingInSameCourse != null && existingInSameCourse.SectionId != section.SectionId)
            {
                return Conflict(new
                {
                    message = $"El alumno ya está matriculado en el curso '{existingInSameCourse.Course.Name}' en la sección '{existingInSameCourse.Name}'"
                });
            }

            if (!section.Students.Any(u => u.UserId == dto.StudentId))
            {
                section.Students.Add(student);
                await _db.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpDelete("{sectionId:int}/enroll/{studentId:int}")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Desmatricular alumno de sección", Description = "Elimina la relación alumno-sección si existe.")]
        public async Task<IActionResult> UnenrollStudent(int sectionId, int studentId)
        {
            var section = await _db.Sections
                .Include(s => s.Students)
                .FirstOrDefaultAsync(s => s.SectionId == sectionId);
            if (section == null) return NotFound(new { message = "Sección no encontrada" });

            var student = section.Students.FirstOrDefault(u => u.UserId == studentId);
            if (student == null)
            {
                // Idempotente: no hay relación, devolver NoContent
                return NoContent();
            }

            section.Students.Remove(student);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
