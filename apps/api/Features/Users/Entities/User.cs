using System;
using System.Collections.Generic;

using CiberCheck.Features.Attendance.Entities;
using AttendanceEntity = CiberCheck.Features.Attendance.Entities.Attendance;
using CiberCheck.Features.Sections.Entities;

namespace CiberCheck.Features.Users.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    // Optional profile image URL (publicly accessible path)
    public string? ProfileImageUrl { get; set; }

    public virtual ICollection<AttendanceEntity> Attendances { get; set; } = new List<AttendanceEntity>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual ICollection<Section> SectionsNavigation { get; set; } = new List<Section>();
}
