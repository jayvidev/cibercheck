using System;
using CiberCheck.Features.Sessions.Entities;

namespace CiberCheck.Features.Attendance.Entities;

public partial class SessionQrToken
{
    public int SessionQrTokenId { get; set; }

    public int SessionId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public bool IsExpired => DateTime.UtcNow > ExpiresAt;

    public virtual Session Session { get; set; } = null!;
}
