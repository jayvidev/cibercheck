using System;
using System.Collections.Generic;

using CiberCheck.Features.Courses.Entities;
using CiberCheck.Features.Sessions.Entities;
using CiberCheck.Features.Users.Entities;

namespace CiberCheck.Features.Sections.Entities;

public partial class Section
{
    public int SectionId { get; set; }

    public int CourseId { get; set; }

    public int TeacherId { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public bool IsVirtual { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual User Teacher { get; set; } = null!;

    public virtual ICollection<User> Students { get; set; } = new List<User>();
}
