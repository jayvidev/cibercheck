using FluentValidation;
using CiberCheck.Features.Sections.Dtos;

namespace CiberCheck.Features.Sections.Validators
{
    public class UpdateSectionDtoValidator : AbstractValidator<UpdateSectionDto>
    {
        public UpdateSectionDtoValidator()
        {
            RuleFor(x => x.CourseId).GreaterThan(0);
            RuleFor(x => x.TeacherId).GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(50);
        }
    }
}
