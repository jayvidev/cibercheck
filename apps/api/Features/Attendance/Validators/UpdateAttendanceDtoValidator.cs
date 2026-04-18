using FluentValidation;
using CiberCheck.Features.Attendance.Dtos;

namespace CiberCheck.Features.Attendance.Validators
{
    public class UpdateAttendanceDtoValidator : AbstractValidator<UpdateAttendanceDto>
    {
        private static readonly string[] Allowed = new[] { "presente", "ausente", "tarde", "justificado" };

        public UpdateAttendanceDtoValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(s => Allowed.Contains(s))
                .WithMessage($"Status must be one of: {string.Join(", ", Allowed)}");
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }
}
