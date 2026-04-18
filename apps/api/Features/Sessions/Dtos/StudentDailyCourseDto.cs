namespace CiberCheck.Features.Sessions.Dtos
{
    public class StudentDailyCourseDto
    {
        public string CourseName { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Topic { get; set; }
    }
}
