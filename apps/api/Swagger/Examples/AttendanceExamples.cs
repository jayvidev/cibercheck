using System.Collections.Generic;
using CiberCheck.Features.Attendance.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class CreateAttendanceDtoExample : IExamplesProvider<CreateAttendanceDto>
    {
        public CreateAttendanceDto GetExamples() => new()
        {
            StudentId = 5,
            SessionId = 1,
            Status = "presente",
            Notes = null
        };
    }

    public class UpdateAttendanceDtoExample : IExamplesProvider<UpdateAttendanceDto>
    {
        public UpdateAttendanceDto GetExamples() => new()
        {
            Status = "ausente",
            Notes = "Enfermo"
        };
    }

    public class AttendanceDtoExample : IExamplesProvider<AttendanceDto>
    {
        public AttendanceDto GetExamples() => new()
        {
            StudentId = 5,
            SessionId = 1,
            Status = "presente",
            Notes = null
        };
    }

    public class AttendanceDtoListExample : IExamplesProvider<IEnumerable<AttendanceDto>>
    {
        public IEnumerable<AttendanceDto> GetExamples() => new List<AttendanceDto>
        {
            new() { StudentId = 5, SessionId = 1, Status = "presente", Notes = null },
            new() { StudentId = 6, SessionId = 1, Status = "ausente", Notes = "Enfermo" },
            new() { StudentId = 7, SessionId = 1, Status = "tarde", Notes = "Tráfico" }
        };
    }

    public class SessionAttendanceDtoExample : IExamplesProvider<SessionAttendanceDto>
    {
        public SessionAttendanceDto GetExamples() => new()
        {
            CourseSlug = "desarrollo-de-aplicaciones-moviles-i",
            CourseName = "Desarrollo de Aplicaciones Móviles I",
            CourseCode = "DAM-I",
            SectionSlug = "seccion-a",
            SectionName = "Sección A",
            Students = new List<StudentAttendanceDto>
            {
                new() { StudentId = 5, FirstName = "Ana", LastName = "López", Email = "i202507323@cibertec.edu.pe", Status = "presente", Notes = null },
                new() { StudentId = 6, FirstName = "Luis", LastName = "Martínez", Email = "i202507324@cibertec.edu.pe", Status = "ausente", Notes = "Enfermo" },
                new() { StudentId = 7, FirstName = "Carmen", LastName = "Sánchez", Email = "i202507325@cibertec.edu.pe", Status = "tarde", Notes = "Tráfico" },
                new() { StudentId = 8, FirstName = "Miguel", LastName = "Torres", Email = "i202507326@cibertec.edu.pe", Status = "presente", Notes = null },
                new() { StudentId = 9, FirstName = "Laura", LastName = "Ramírez", Email = "i202507327@cibertec.edu.pe", Status = "presente", Notes = null },
                new() { StudentId = 10, FirstName = "Pedro", LastName = "Flores", Email = "i202507328@cibertec.edu.pe", Status = "justificado", Notes = "Trámite personal" }
            }
        };
    }

    public class SessionQrTokenDtoExample : IExamplesProvider<SessionQrTokenDto>
    {
        public SessionQrTokenDto GetExamples() => new()
        {
            SessionQrTokenId = 1,
            SessionId = 5,
            Token = "A1B2C3D4E5F6G7H8",
            CreatedAt = System.DateTime.UtcNow,
            ExpiresAt = System.DateTime.UtcNow.AddSeconds(10),
            IsExpired = false
        };
    }

    public class AttendanceByQrDtoExample : IExamplesProvider<AttendanceByQrDto>
    {
        public AttendanceByQrDto GetExamples() => new()
        {
            Token = "A1B2C3D4E5F6G7H8"
        };
    }
}

