using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace CiberCheck.Features.Courses.Dtos
{
    [SwaggerSchema(Description = "Curso disponible para inscripción")]
    public class CourseDto
    {
        [SwaggerSchema(Description = "Identificador del curso")]
        public int CourseId { get; set; }
        [SwaggerSchema(Description = "Nombre del curso")]
        public string Name { get; set; } = null!;
        [SwaggerSchema(Description = "Código único del curso")]
        public string Code { get; set; } = null!;
        [SwaggerSchema(Description = "Slug único del curso para URLs amigables")]
        public string Slug { get; set; } = null!;
        [SwaggerSchema(Description = "Color del curso en formato hex")]
        public string Color { get; set; } = null!;
    }

    [SwaggerSchema(Description = "Curso del profesor con total de secciones")]
    public class TeacherCourseDto
    {
        [SwaggerSchema(Description = "Nombre del curso")]
        public string Name { get; set; } = null!;
        [SwaggerSchema(Description = "Código único del curso")]
        public string Code { get; set; } = null!;
        [SwaggerSchema(Description = "Slug del curso para URLs amigables")]
        public string CourseSlug { get; set; } = null!;
        [SwaggerSchema(Description = "Color del curso en formato hex")]
        public string Color { get; set; } = null!;
        [SwaggerSchema(Description = "Total de secciones del curso")]
        public int TotalSections { get; set; }
    }

    [SwaggerSchema(Description = "Payload para crear un curso")]
    public class CreateCourseDto
    {
        [Required]
        [MaxLength(100)]
        [SwaggerSchema(Description = "Nombre del curso")]
        public string Name { get; set; } = null!;
        [Required]
        [MaxLength(20)]
        [SwaggerSchema(Description = "Código único del curso")]
        public string Code { get; set; } = null!;
        [Required]
        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "El color debe ser un código hex válido")]
        [SwaggerSchema(Description = "Color del curso en formato hex (ej: #dc2626)")]
        public string Color { get; set; } = null!;
    }

    [SwaggerSchema(Description = "Payload para actualizar un curso")]
    public class UpdateCourseDto
    {
        [Required]
        [MaxLength(100)]
        [SwaggerSchema(Description = "Nombre del curso")]
        public string Name { get; set; } = null!;
        [Required]
        [MaxLength(20)]
        [SwaggerSchema(Description = "Código único del curso")]
        public string Code { get; set; } = null!;
        [Required]
        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "El color debe ser un código hex válido")]
        [SwaggerSchema(Description = "Color del curso en formato hex (ej: #dc2626)")]
        public string Color { get; set; } = null!;
    }
}
