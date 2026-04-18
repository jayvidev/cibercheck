
﻿using Microsoft.AspNetCore.Mvc;

namespace CiberCheck.Features.Common.Authorization
{
    public class RequireStudentAttribute : TypeFilterAttribute
    {
        public RequireStudentAttribute()
            : base(typeof(StudentAuthorizationFilter))
        {
        }

    }
}
