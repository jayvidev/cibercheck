using CiberCheck.Features.Courses.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class TeacherCourseDtoExample : IExamplesProvider<TeacherCourseDto>
    {
        public TeacherCourseDto GetExamples() => new()
        {
            Name = "Desarrollo de Aplicaciones Móviles I",
            Code = "DAM-I",
            CourseSlug = "desarrollo-de-aplicaciones-moviles-i",
            Color = "#dc2626",
            TotalSections = 2
        };
    }

    public class TeacherCourseDtoListExample : IExamplesProvider<IEnumerable<TeacherCourseDto>>
    {
        public IEnumerable<TeacherCourseDto> GetExamples() => new List<TeacherCourseDto>
        {
            new() { Name = "Desarrollo de Aplicaciones Móviles I", Code = "DAM-I", CourseSlug = "desarrollo-de-aplicaciones-moviles-i", Color = "#dc2626", TotalSections = 2 },
            new() { Name = "Lenguaje de Programación II", Code = "LP-II", CourseSlug = "lenguaje-de-programacion-ii", Color = "#2563eb", TotalSections = 1 },
            new() { Name = "Bases de Datos", Code = "BD", CourseSlug = "bases-de-datos", Color = "#059669", TotalSections = 3 }
        };
    }
}
