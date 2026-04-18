using FluentValidation;
using CiberCheck.Features.Users.Dtos;

namespace CiberCheck.Features.Users.Validators
{
    public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
    {
        private static readonly string[] AllowedRoles = new[] { "profesor", "estudiante","administrador"};

        public UpdateUserDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .MaximumLength(50)
                .When(x => x.FirstName != null);

            RuleFor(x => x.LastName)
                .MaximumLength(50)
                .When(x => x.LastName != null);

            RuleFor(x => x.Role)
                .MaximumLength(20)
                .Must(r => r == null || AllowedRoles.Contains(r))
                .WithMessage($"Role must be one of: {string.Join(", ", AllowedRoles)}");

            RuleFor(x => x.ProfileImageUrl)
                .MaximumLength(512)
                .When(x => x.ProfileImageUrl != null);
        }
    }
}
