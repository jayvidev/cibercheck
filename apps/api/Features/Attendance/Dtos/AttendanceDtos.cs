using System;
using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace CiberCheck.Features.Attendance.Dtos
{
    [SwaggerSchema(Description = "Registro de asistencia")]
    public class AttendanceDto
    {
        public int StudentId { get; set; }
        public int SessionId { get; set; }
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
    }

    [SwaggerSchema(Description = "Payload para crear asistencia")]
    public class CreateAttendanceDto
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public int SessionId { get; set; }
        [Required]
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
    }

    [SwaggerSchema(Description = "Payload para actualizar asistencia")]
    public class UpdateAttendanceDto
    {
        [Required]
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
    }

    [SwaggerSchema(Description = "Estudiante con asistencia en una sesión")]
    public class StudentAttendanceDto
    {
        [SwaggerSchema(Description = "Identificador del estudiante")]
        public int StudentId { get; set; }
        [SwaggerSchema(Description = "Nombre del estudiante")]
        public string FirstName { get; set; } = null!;
        [SwaggerSchema(Description = "Apellido del estudiante")]
        public string LastName { get; set; } = null!;
        [SwaggerSchema(Description = "Email del estudiante")]
        public string Email { get; set; } = null!;
        [SwaggerSchema(Description = "Estado de asistencia (presente, ausente, tarde, justificado, no_registrado)")]
        public string? Status { get; set; }
        [SwaggerSchema(Description = "Notas sobre la asistencia")]
        public string? Notes { get; set; }
    }

    [SwaggerSchema(Description = "Asistencia de una sesión completa")]
    public class SessionAttendanceDto
    {
        [SwaggerSchema(Description = "Identificador de la sesión")]
        public int SessionId { get; set; }

        [SwaggerSchema(Description = "Slug del curso")]
        public string CourseSlug { get; set; } = null!;
        [SwaggerSchema(Description = "Nombre del curso")]
        public string CourseName { get; set; } = null!;
        [SwaggerSchema(Description = "Código del curso")]
        public string CourseCode { get; set; } = null!;
        [SwaggerSchema(Description = "Slug de la sección")]
        public string SectionSlug { get; set; } = null!;
        [SwaggerSchema(Description = "Nombre de la sección")]
        public string SectionName { get; set; } = null!;
        [SwaggerSchema(Description = "Indica si la sección es virtual (true) o presencial (false)")]
        public bool? IsVirtual { get; set; }

        [SwaggerSchema(Description = "Fecha de la sesión")]
        public DateOnly? Date { get; set; }

        [SwaggerSchema(Description = "Hora de inicio de la sesión")]
        public TimeOnly? StartTime { get; set; }

        [SwaggerSchema(Description = "Hora de fin de la sesión")]
        public TimeOnly? EndTime { get; set; }

        [SwaggerSchema(Description = "Fecha de la sesión (duplicado opcional)")]
        public DateOnly? SessionDate { get; set; }

        [SwaggerSchema(Description = "Lista de estudiantes con asistencia")]
        public List<StudentAttendanceDto> Students { get; set; } = new();
    }

    public class StudentAttendanceViewDto
    {
        public string CourseName { get; set; } = null!;
        public string SectionName { get; set; } = null!;
        public string SessionName { get; set; } = null!; // opcional si quieres diferenciar de sección
        public DateOnly SessionDate { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string Status { get; set; } = null!;
    }

    [SwaggerSchema(Description = "Token QR dinámico para una sesión")]
    public class SessionQrTokenDto
    {
        [SwaggerSchema(Description = "Identificador único del token QR")]
        public int SessionQrTokenId { get; set; }
        [SwaggerSchema(Description = "Identificador de la sesión")]
        public int SessionId { get; set; }
        [SwaggerSchema(Description = "Token único para generar el QR")]
        public string Token { get; set; } = null!;
        [SwaggerSchema(Description = "Fecha y hora de creación del token")]
        public DateTime CreatedAt { get; set; }
        [SwaggerSchema(Description = "Fecha y hora de expiración del token")]
        public DateTime ExpiresAt { get; set; }
        [SwaggerSchema(Description = "Indica si el token ha expirado")]
        public bool IsExpired { get; set; }
        [SwaggerSchema(Description = "Indica si la sección es virtual (true) o presencial (false)")]
        public bool IsVirtual { get; set; }
    }

    [SwaggerSchema(Description = "Payload para marcar asistencia por QR")]
    public class AttendanceByQrDto
    {
        [Required]
        [SwaggerSchema(Description = "Token QR escaneado")]
        public string Token { get; set; } = null!;
    }

    [SwaggerSchema(Description = "Elemento de asistencia para marcado masivo")]
    public class BulkAttendanceItemDto
    {
        [Required]
        public int StudentId { get; set; }
        [Required]
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
    }

    [SwaggerSchema(Description = "Payload para marcado masivo de asistencias en una sesión")]
    public class BulkAttendanceDto
    {
        [Required]
        public int SessionId { get; set; }
        [Required]
        public List<BulkAttendanceItemDto> Items { get; set; } = new();
    }
}

