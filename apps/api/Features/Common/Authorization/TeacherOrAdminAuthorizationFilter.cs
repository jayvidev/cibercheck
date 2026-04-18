using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using CiberCheck.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CiberCheck.Features.Common.Authorization;

public class TeacherOrAdminAuthorizationFilter : IAsyncActionFilter
{
    private readonly ApplicationDbContext _db;

    public TeacherOrAdminAuthorizationFilter(ApplicationDbContext db)
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
        if (user == null)
        {
            context.Result = new ForbidResult();
            return;
        }

        var isAdmin = string.Equals(user.Role, "administrador", StringComparison.OrdinalIgnoreCase);
        var isTeacher = string.Equals(user.Role, "profesor", StringComparison.OrdinalIgnoreCase);

        if (!isAdmin && !isTeacher)
        {
            context.Result = new ForbidResult();
            return;
        }

        // Si es administrador, omite validaciones de propiedad de sección/curso
        if (isAdmin)
        {
            await next();
            return;
        }

        // Si es profesor, validar propiedad cuando se provee courseSlug o sectionId
        if (context.ActionArguments.TryGetValue("courseSlug", out var courseSlugObj) && courseSlugObj is string courseSlug)
        {
            var hasAccess = await _db.Sections
                .AnyAsync(s => s.Course.Slug == courseSlug && s.TeacherId == userId);

            if (!hasAccess)
            {
                context.Result = new ForbidResult();
                return;
            }
        }

        if (context.ActionArguments.TryGetValue("sectionId", out var sectionIdObj) && sectionIdObj is int sectionId)
        {
            var hasAccess = await _db.Sections
                .AnyAsync(s => s.SectionId == sectionId && s.TeacherId == userId);

            if (!hasAccess)
            {
                context.Result = new ForbidResult();
                return;
            }
        }

        await next();
    }
}
