using FluentValidation;
using CiberCheck.Features.Attendance.Dtos;

namespace CiberCheck.Features.Attendance.Validators
{
    public class CreateAttendanceDtoValidator : AbstractValidator<CreateAttendanceDto>
    {
        private static readonly string[] Allowed = new[] { "presente", "ausente", "tarde", "justificado" };

        public CreateAttendanceDtoValidator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.SessionId).GreaterThan(0);
            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(s => Allowed.Contains(s))
                .WithMessage($"Status must be one of: {string.Join(", ", Allowed)}");
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
        }
    }
}
