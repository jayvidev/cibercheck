using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using CiberCheck.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CiberCheck.Features.Common.Authorization;

public class StudentAuthorizationFilter : IAsyncActionFilter
{
    private readonly ApplicationDbContext _db;

    public StudentAuthorizationFilter(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Usuario no autenticado" });
            return;
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null || user.Role != "estudiante")
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}