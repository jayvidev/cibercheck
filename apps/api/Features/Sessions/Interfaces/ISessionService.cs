using System.Collections.Generic;
using System.Threading.Tasks;
using CiberCheck.Features.Sessions.Dtos;
using CiberCheck.Features.Sessions.Entities;

namespace CiberCheck.Interfaces
{
    public interface ISessionService
    {
        Task<List<Session>> GetAllAsync();
        Task<Session?> GetByIdAsync(int id);
        Task<Session> CreateAsync(Session entity);
        Task<bool> UpdateAsync(int id, Session entity);
        Task<bool> DeleteAsync(int id);
        Task<List<Session>> GetSessionsByCourseSectionAsync(int courseId, int sectionId);
        Task<List<StudentDailyCourseDto>> GetStudentCoursesByDateAsync(int studentId, System.DateOnly? date = null);
    }
}
