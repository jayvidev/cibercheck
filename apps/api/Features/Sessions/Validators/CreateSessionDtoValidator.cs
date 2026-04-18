using FluentValidation;
using CiberCheck.Features.Sessions.Dtos;

namespace CiberCheck.Features.Sessions.Validators
{
    public class CreateSessionDtoValidator : AbstractValidator<CreateSessionDto>
    {
        public CreateSessionDtoValidator()
        {
            RuleFor(x => x.SectionId).GreaterThan(0);
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.Topic).MaximumLength(200).When(x => x.Topic != null);
        }
    }
}
