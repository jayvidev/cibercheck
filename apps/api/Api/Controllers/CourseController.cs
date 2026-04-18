using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CiberCheck.Interfaces;
using CiberCheck.Features.Courses.Entities;
using CiberCheck.Features.Courses.Dtos;
using CiberCheck.Features.Common.Authorization;
using AutoMapper;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Filters;
using CiberCheck.Swagger.Examples;
using System.Linq;

namespace CiberCheck.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/courses")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _service;
        private readonly ISectionService _sectionService;
        private readonly IMapper _mapper;

        public CourseController(ICourseService service, ISectionService sectionService, IMapper mapper)
        {
            _service = service;
            _sectionService = sectionService;
            _mapper = mapper;
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Listar cursos", Description = "Obtiene todos los cursos disponibles.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(CourseDtoListExample))]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(_mapper.Map<List<CourseDto>>(items));
        }

        [HttpGet("teacher/{teacherId:int}")]
        [SwaggerOperation(Summary = "Listar cursos del profesor", Description = "Obtiene todos los cursos de un profesor agrupados por curso.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(TeacherCourseDtoListExample))]
        public async Task<ActionResult<IEnumerable<TeacherCourseDto>>> GetCoursesByTeacher(int teacherId)
        {
            var courses = await _service.GetCoursesByTeacherIdAsync(teacherId);

            var result = courses
                .Where(c => c.Sections.Any(s => s.TeacherId == teacherId))
                .Select(c => new TeacherCourseDto
                {
                    Name = c.Name,
                    Code = c.Code,
                    CourseSlug = c.Slug,
                    Color = c.Color,
                    TotalSections = c.Sections.Count(s => s.TeacherId == teacherId)
                })
                .ToList();

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(Summary = "Obtener curso por Id", Description = "Retorna un curso por su identificador numérico.")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(CourseDtoExample))]
        public async Task<ActionResult<CourseDto>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<CourseDto>(item));
        }

        [HttpGet("{slug}")]
        [SwaggerOperation(Summary = "Obtener curso por Slug", Description = "Retorna un curso por su slug URL-friendly (ej: introduccion-programacion).")]
        [SwaggerResponseExample(StatusCodes.Status200OK, typeof(CourseDtoExample))]
        public async Task<ActionResult<CourseDto>> GetBySlug(string slug)
        {
            var item = await _service.GetBySlugAsync(slug);
            if (item == null) return NotFound();
            return Ok(_mapper.Map<CourseDto>(item));
        }

        [HttpGet("{slug}/sections")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Listar secciones de un curso por slug", Description = "Obtiene todas las secciones de un curso del profesor o administrador autenticado.")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourseSections(string slug)
        {
            var course = await _service.GetBySlugAsync(slug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });
            
            return Ok(new 
            { 
                courseId = course.CourseId,
                courseName = course.Name,
                courseSlug = course.Slug,
                sections = course.Sections.Select(s => new 
                {
                    sectionId = s.SectionId,
                    name = s.Name,
                    slug = s.Slug,
                    teacherId = s.TeacherId,
                    isVirtual = s.IsVirtual
                })
            });
        }

        [HttpGet("{slug}/sections/stats")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Listar secciones de un curso con estadísticas", Description = "Obtiene las secciones de un curso junto con conteos de estudiantes y sesiones para dashboard.")]
        public async Task<ActionResult> GetCourseSectionsWithStats(string slug)
        {
            var course = await _service.GetBySlugAsync(slug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var sections = course.Sections.Select(s => new
            {
                sectionId = s.SectionId,
                name = s.Name,
                slug = s.Slug,
                teacherId = s.TeacherId,
                isVirtual = s.IsVirtual,
                studentsCount = s.Students.Count,
                sessionsCount = s.Sessions.Count,
                courseName = course.Name,
                courseSlug = course.Slug
            });

            return Ok(new
            {
                courseId = course.CourseId,
                courseName = course.Name,
                courseSlug = course.Slug,
                sections
            });
        }

        [HttpPost("{slug}/sections")]
        [RequireTeacherOrAdmin]
        [SwaggerOperation(Summary = "Crear sección en curso (por slug)", Description = "Crea una sección dentro de un curso dado su slug de ruta.")]
        public async Task<ActionResult> CreateSectionForCourse(string slug, [FromBody] CiberCheck.Features.Sections.Dtos.CreateSectionForCourseDto dto)
        {
            var course = await _service.GetBySlugAsync(slug);
            if (course == null) return NotFound(new { message = "Curso no encontrado" });

            var entity = new CiberCheck.Features.Sections.Entities.Section
            {
                CourseId = course.CourseId,
                TeacherId = dto.TeacherId,
                Name = dto.Name,
                Slug = string.Empty // dejar que el servicio lo genere si aplica
            };

            var created = await _sectionService.CreateAsync(entity);
            var result = _mapper.Map<CiberCheck.Features.Sections.Dtos.SectionDto>(created);
            return CreatedAtAction(nameof(SectionController.GetById), "Section", new { id = result.SectionId }, result);
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Crear curso", Description = "Crea un nuevo curso.")]
        [SwaggerRequestExample(typeof(CreateCourseDto), typeof(CreateCourseDtoExample))]
        [SwaggerResponseExample(StatusCodes.Status201Created, typeof(CourseDtoExample))]
        public async Task<ActionResult<CourseDto>> Create([FromBody] CreateCourseDto dto)
        {
            var entity = _mapper.Map<Course>(dto);
            var created = await _service.CreateAsync(entity);
            var result = _mapper.Map<CourseDto>(created);
            return CreatedAtAction(nameof(GetById), new { id = result.CourseId }, result);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(Summary = "Actualizar curso", Description = "Actualiza un curso existente.")]
        [SwaggerRequestExample(typeof(UpdateCourseDto), typeof(UpdateCourseDtoExample))]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            _mapper.Map(dto, existing);
            var ok = await _service.UpdateAsync(id, existing);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(Summary = "Eliminar curso", Description = "Elimina un curso por su identificador.")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
