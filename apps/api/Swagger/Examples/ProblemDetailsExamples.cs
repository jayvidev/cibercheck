using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class ProblemDetailsBadRequestExample : IExamplesProvider<ProblemDetails>
    {
        public ProblemDetails GetExamples() => new()
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Bad Request",
            Detail = "Validation failed for one or more fields.",
            Type = "https://httpstatuses.com/400"
        };
    }

    public class ProblemDetailsNotFoundExample : IExamplesProvider<ProblemDetails>
    {
        public ProblemDetails GetExamples() => new()
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Not Found",
            Detail = "The requested resource was not found.",
            Type = "https://httpstatuses.com/404"
        };
    }

    public class ProblemDetailsInternalServerErrorExample : IExamplesProvider<ProblemDetails>
    {
        public ProblemDetails GetExamples() => new()
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred.",
            Type = "https://httpstatuses.com/500"
        };
    }
}
