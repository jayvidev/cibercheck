using System.Collections.Generic;
using CiberCheck.Features.Courses.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class CreateCourseDtoExample : IExamplesProvider<CreateCourseDto>
    {
        public CreateCourseDto GetExamples() => new()
        {
            Name = "Desarrollo de Aplicaciones Móviles I",
            Code = "DAM-I",
            Color = "#dc2626"
        };
    }

    public class UpdateCourseDtoExample : IExamplesProvider<UpdateCourseDto>
    {
        public UpdateCourseDto GetExamples() => new()
        {
            Name = "Desarrollo de Aplicaciones Móviles II",
            Code = "DAM-II",
            Color = "#2563eb"
        };
    }

    public class CourseDtoExample : IExamplesProvider<CourseDto>
    {
        public CourseDto GetExamples() => new()
        {
            CourseId = 1,
            Name = "Desarrollo de Aplicaciones Móviles I",
            Code = "DAM-I",
            Slug = "desarrollo-de-aplicaciones-moviles-i",
            Color = "#dc2626"
        };
    }

    public class CourseDtoListExample : IExamplesProvider<IEnumerable<CourseDto>>
    {
        public IEnumerable<CourseDto> GetExamples() => new List<CourseDto>
        {
            new() { CourseId = 1, Name = "Desarrollo de Aplicaciones Móviles I", Code = "DAM-I", Slug = "desarrollo-de-aplicaciones-moviles-i", Color = "#dc2626" },
            new() { CourseId = 2, Name = "Seguridad de Aplicaciones", Code = "SEG-APP", Slug = "seguridad-de-aplicaciones", Color = "#2563eb" }
        };
    }
}
