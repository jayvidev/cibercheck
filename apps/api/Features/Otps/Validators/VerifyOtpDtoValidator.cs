using FluentValidation;
using CiberCheck.Features.Otps.Dtos;

namespace CiberCheck.Features.Otp.Validators
{
    public class VerifyOtpDtoValidator : AbstractValidator<VerifyOtpDto>
    {
        public VerifyOtpDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El correo es obligatorio.")
                .EmailAddress().WithMessage("El formato del correo no es válido.");

            RuleFor(x => x.Codigo)
                .NotEmpty().WithMessage("El código es obligatorio.")
                .Length(6).WithMessage("El código debe tener exactamente 6 dígitos.");
        }
    }
}
