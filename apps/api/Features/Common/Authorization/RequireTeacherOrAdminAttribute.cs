using Microsoft.AspNetCore.Mvc;

namespace CiberCheck.Features.Common.Authorization;

public class RequireTeacherOrAdminAttribute : TypeFilterAttribute
{
    public RequireTeacherOrAdminAttribute() : base(typeof(TeacherOrAdminAuthorizationFilter))
    {
    }
}
