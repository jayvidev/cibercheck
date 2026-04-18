using CiberCheck.Features.Sessions.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class StudentDailyCourseListExample : IExamplesProvider<IEnumerable<StudentDailyCourseDto>>
    {
        public IEnumerable<StudentDailyCourseDto> GetExamples() => new List<StudentDailyCourseDto>
        {
            new()
            {
                CourseName = "Desarrollo de Aplicaciones Móviles I",
                SectionName = "Sección A",
                StartTime = new TimeOnly(8, 0),
                EndTime = new TimeOnly(10, 0),
                Topic = "Introducción a Android Studio"
            },
            new()
            {
                CourseName = "Seguridad de Aplicaciones",
                SectionName = "Sección B",
                StartTime = new TimeOnly(14, 0),
                EndTime = new TimeOnly(16, 0),
                Topic = "Autenticación y Autorización"
            }
        };
    }
}