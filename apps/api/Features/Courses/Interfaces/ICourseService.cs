using System.Collections.Generic;
using System.Threading.Tasks;
using CiberCheck.Features.Courses.Entities;

namespace CiberCheck.Interfaces
{
    public interface ICourseService
    {
        Task<List<Course>> GetAllAsync();
        Task<Course?> GetByIdAsync(int id);
        Task<Course?> GetBySlugAsync(string slug);
        Task<Course> CreateAsync(Course entity);
        Task<bool> UpdateAsync(int id, Course entity);
        Task<bool> DeleteAsync(int id);
        Task<List<Course>> GetCoursesByTeacherIdAsync(int teacherId);
    }
}
