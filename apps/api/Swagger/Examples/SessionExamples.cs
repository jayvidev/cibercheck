using System.Collections.Generic;
using CiberCheck.Features.Sessions.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class CreateSessionDtoExample : IExamplesProvider<CreateSessionDto>
    {
        public CreateSessionDto GetExamples() => new()
        {
            SectionId = 1,
            SessionNumber = 1,
            Date = new DateOnly(2025,10,14),
            StartTime = new TimeOnly(8,0),
            EndTime = new TimeOnly(10,0),
            Topic = "Introducción a Android Studio"
        };
    }

    public class UpdateSessionDtoExample : IExamplesProvider<UpdateSessionDto>
    {
        public UpdateSessionDto GetExamples() => new()
        {
            SessionNumber = 2,
            Date = new DateOnly(2025,10,21),
            StartTime = new TimeOnly(8,0),
            EndTime = new TimeOnly(10,0),
            Topic = "Componentes de UI en Android"
        };
    }

    public class SessionDtoExample : IExamplesProvider<SessionDto>
    {
        public SessionDto GetExamples() => new()
        {
            SessionId = 1,
            SectionId = 1,
            SessionNumber = 1,
            Date = new DateOnly(2025,10,14),
            StartTime = new TimeOnly(8,0),
            EndTime = new TimeOnly(10,0),
            Topic = "Introducción a Android Studio"
        };
    }

    public class SessionDtoListExample : IExamplesProvider<IEnumerable<SessionDto>>
    {
        public IEnumerable<SessionDto> GetExamples() => new List<SessionDto>
        {
            new() { SessionId = 1, SectionId = 1, SessionNumber = 1, Date = new DateOnly(2025,10,14), StartTime = new TimeOnly(8,0), EndTime = new TimeOnly(10,0), Topic = "Introducción a Android Studio" },
            new() { SessionId = 2, SectionId = 1, SessionNumber = 2, Date = new DateOnly(2025,10,21), StartTime = new TimeOnly(8,0), EndTime = new TimeOnly(10,0), Topic = "Componentes de UI en Android" }
        };
    }

    public class SessionWithStatsExample : IExamplesProvider<object>
    {
        public object GetExamples() => new List<object>
        {
            new
            {
                courseSlug = "desarrollo-de-aplicaciones-moviles-i",
                sectionSlug = "seccion-a",
                sessionNumber = 1,
                date = "2025-10-14",
                startTime = "08:00:00",
                endTime = "10:00:00",
                topic = "Introducción a Android Studio",
                attendanceStats = new
                {
                    presente = 3,
                    ausente = 1,
                    tarde = 1,
                    justificado = 1
                }
            },
            new
            {
                courseSlug = "desarrollo-de-aplicaciones-moviles-i",
                sectionSlug = "seccion-a",
                sessionNumber = 2,
                date = "2025-10-21",
                startTime = "08:00:00",
                endTime = "10:00:00",
                topic = "Componentes de UI en Android",
                attendanceStats = new
                {
                    presente = 5,
                    ausente = 0,
                    tarde = 1,
                    justificado = 0
                }
            }
        };
    }
}
