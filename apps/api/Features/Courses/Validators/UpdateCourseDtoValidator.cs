using FluentValidation;
using CiberCheck.Features.Courses.Dtos;

namespace CiberCheck.Features.Courses.Validators
{
    public class UpdateCourseDtoValidator : AbstractValidator<UpdateCourseDto>
    {
        public UpdateCourseDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(100);
            RuleFor(x => x.Code)
                .MaximumLength(20)
                .When(x => x.Code != null);
            RuleFor(x => x.Color)
                .NotEmpty()
                .Matches(@"^#[0-9A-Fa-f]{6}$")
                .WithMessage("El color debe ser un código hex válido (ej: #dc2626)");
        }
    }
}
