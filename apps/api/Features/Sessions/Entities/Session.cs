using System;
using System.Collections.Generic;

using CiberCheck.Features.Attendance.Entities;
using AttendanceEntity = CiberCheck.Features.Attendance.Entities.Attendance;
using CiberCheck.Features.Sections.Entities;

namespace CiberCheck.Features.Sessions.Entities;

public partial class Session
{
    public int SessionId { get; set; }

    public int SectionId { get; set; }

    public int SessionNumber { get; set; }

    public DateOnly Date { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public string? Topic { get; set; }

    public virtual ICollection<AttendanceEntity> Attendances { get; set; } = new List<AttendanceEntity>();

    public virtual ICollection<SessionQrToken> QrTokens { get; set; } = new List<SessionQrToken>();

    public virtual Section Section { get; set; } = null!;
}
