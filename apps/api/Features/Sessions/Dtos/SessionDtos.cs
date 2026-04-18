using System;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace CiberCheck.Features.Sessions.Dtos
{
    [SwaggerSchema(Description = "Sesión de un curso")]
    public class SessionDto
    {
        [SwaggerSchema(Description = "Identificador de la sesión")]
        public int SessionId { get; set; }
        [SwaggerSchema(Description = "Identificador de la sección")]
        public int SectionId { get; set; }
        [SwaggerSchema(Description = "Número de la sesión dentro de la sección")]
        public int SessionNumber { get; set; }
        [SwaggerSchema(Description = "Fecha de la sesión")]
        public DateOnly Date { get; set; }
        [SwaggerSchema(Description = "Hora de inicio")]
        public TimeOnly? StartTime { get; set; }
        [SwaggerSchema(Description = "Hora de fin")]
        public TimeOnly? EndTime { get; set; }
        [SwaggerSchema(Description = "Tema de la sesión")]
        public string? Topic { get; set; }
    }

    [SwaggerSchema(Description = "Payload para crear una sesión")]
    public class CreateSessionDto
    {
        [Required]
        [SwaggerSchema(Description = "ID de la sección")]
        public int SectionId { get; set; }
        [Required]
        [SwaggerSchema(Description = "Número de sesión (1, 2, 3...)")]
        public int SessionNumber { get; set; }
        [Required]
        [SwaggerSchema(Description = "Fecha de la sesión")]
        public DateOnly Date { get; set; }
        [SwaggerSchema(Description = "Hora de inicio (opcional)")]
        public TimeOnly? StartTime { get; set; }
        [SwaggerSchema(Description = "Hora de fin (opcional)")]
        public TimeOnly? EndTime { get; set; }
        [SwaggerSchema(Description = "Tema o título de la sesión")]
        public string? Topic { get; set; }
    }

    [SwaggerSchema(Description = "Payload para actualizar una sesión")]
    public class UpdateSessionDto
    {
        [Required]
        [SwaggerSchema(Description = "Número de sesión")]
        public int SessionNumber { get; set; }
        [Required]
        [SwaggerSchema(Description = "Fecha de la sesión")]
        public DateOnly Date { get; set; }
        [SwaggerSchema(Description = "Hora de inicio")]
        public TimeOnly? StartTime { get; set; }
        [SwaggerSchema(Description = "Hora de fin")]
        public TimeOnly? EndTime { get; set; }
        [SwaggerSchema(Description = "Tema o título de la sesión")]
        public string? Topic { get; set; }
    }
}
