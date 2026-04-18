using FluentValidation;
using CiberCheck.Features.Otps.Dtos;

namespace CiberCheck.Features.Otp.Validators
{
    public class GenerateOtpDtoValidator : AbstractValidator<CreateOtpDto>
    {
        public GenerateOtpDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El correo es obligatorio.")
                .EmailAddress().WithMessage("El formato del correo no es válido.");
        }
    }
}
