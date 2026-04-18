using FluentValidation;
using CiberCheck.Features.Sessions.Dtos;

namespace CiberCheck.Features.Sessions.Validators
{
    public class UpdateSessionDtoValidator : AbstractValidator<UpdateSessionDto>
    {
        public UpdateSessionDtoValidator()
        {
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.Topic).MaximumLength(200).When(x => x.Topic != null);
        }
    }
}
