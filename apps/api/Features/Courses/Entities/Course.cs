using System;
using System.Collections.Generic;

using CiberCheck.Features.Sections.Entities;

namespace CiberCheck.Features.Courses.Entities;

public partial class Course
{
    public int CourseId { get; set; }

    public string Name { get; set; } = null!;

    public string Code { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string Color { get; set; } = null!;

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();
}
