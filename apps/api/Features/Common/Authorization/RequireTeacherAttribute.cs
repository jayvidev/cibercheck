using Microsoft.AspNetCore.Mvc;

namespace CiberCheck.Features.Common.Authorization;

public class RequireTeacherAttribute : TypeFilterAttribute
{
    public RequireTeacherAttribute() : base(typeof(TeacherAuthorizationFilter))
    {
    }
}
