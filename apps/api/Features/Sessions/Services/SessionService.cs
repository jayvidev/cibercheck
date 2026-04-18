using CiberCheck.Data;
using CiberCheck.Features.Sessions.Dtos;
using CiberCheck.Features.Sessions.Entities;
using CiberCheck.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CiberCheck.Services
{
    public class SessionService : ISessionService
    {
        private readonly ApplicationDbContext _db;

        public SessionService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<Session>> GetAllAsync()
            => await _db.Sessions.AsNoTracking().ToListAsync();

        public async Task<Session?> GetByIdAsync(int id)
            => await _db.Sessions.FindAsync(id);

        public async Task<Session> CreateAsync(Session entity)
        {
            if (entity.SessionNumber == 0)
            {
                var maxSessionNumber = await _db.Sessions
                    .Where(s => s.SectionId == entity.SectionId)
                    .MaxAsync(s => (int?)s.SessionNumber) ?? 0;
                
                entity.SessionNumber = maxSessionNumber + 1;
            }
            
            _db.Sessions.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int id, Session entity)
        {
            var exists = await _db.Sessions.AnyAsync(e => e.SessionId == id);
            if (!exists) return false;
            entity.SessionId = id;
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Sessions.FindAsync(id);
            if (entity == null) return false;
            _db.Sessions.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Session>> GetSessionsByCourseSectionAsync(int courseId, int sectionId)
        {
            return await _db.Sessions
                .Include(s => s.Section)
                .Where(s => s.Section.CourseId == courseId && s.SectionId == sectionId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<StudentDailyCourseDto>> GetStudentCoursesByDateAsync(int studentId, DateOnly? date = null)
        {
            var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);

            var query = _db.Sessions
                .AsNoTracking()
                .Where(s => s.Date == targetDate && s.Section.Students.Any(u => u.UserId == studentId))
                .Select(s => new StudentDailyCourseDto
                {
                    CourseName = s.Section.Course.Name,
                    SectionName = s.Section.Name,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Topic = s.Topic
                })
                .OrderBy(s => s.StartTime);

            return await query.ToListAsync();
        }
    }
}
