using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CiberCheck.Swagger.Filters
{
    // Adds common error responses to all operations to avoid repeating attributes.
    public class CommonErrorResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // 400 Bad Request
            if (!operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"] = new OpenApiResponse
                {
                    Description = "Bad Request",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = context.SchemaGenerator.GenerateSchema(typeof(ProblemDetails), context.SchemaRepository)
                        }
                    }
                };
            }

            // 404 Not Found
            if (!operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"] = new OpenApiResponse
                {
                    Description = "Not Found",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = context.SchemaGenerator.GenerateSchema(typeof(ProblemDetails), context.SchemaRepository)
                        }
                    }
                };
            }

            // 500 Internal Server Error
            if (!operation.Responses.ContainsKey("500"))
            {
                operation.Responses["500"] = new OpenApiResponse
                {
                    Description = "Internal Server Error",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = context.SchemaGenerator.GenerateSchema(typeof(ProblemDetails), context.SchemaRepository)
                        }
                    }
                };
            }
        }
    }
}
