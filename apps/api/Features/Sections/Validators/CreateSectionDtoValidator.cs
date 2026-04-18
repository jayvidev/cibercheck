using FluentValidation;
using CiberCheck.Features.Sections.Dtos;

namespace CiberCheck.Features.Sections.Validators
{
    public class CreateSectionDtoValidator : AbstractValidator<CreateSectionDto>
    {
        public CreateSectionDtoValidator()
        {
            RuleFor(x => x.CourseId).GreaterThan(0);
            RuleFor(x => x.TeacherId).GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(50);
        }
    }
}
