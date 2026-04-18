using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;
using CiberCheck.Features.Courses.Entities;
using CiberCheck.Features.Common.Helpers;
using System.Linq;

namespace CiberCheck.Services
{
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _db;

        public CourseService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<Course>> GetAllAsync()
            => await _db.Courses.AsNoTracking().ToListAsync();

        public async Task<Course?> GetByIdAsync(int id)
            => await _db.Courses.FindAsync(id);

        public async Task<Course?> GetBySlugAsync(string slug)
            => await _db.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Sessions)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Students)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Slug == slug);

        public async Task<Course> CreateAsync(Course entity)
        {
            var existingSlugs = await _db.Courses
                .Select(c => c.Slug)
                .ToListAsync();
            
            entity.Slug = SlugGenerator.GenerateUniqueSlug(entity.Name, existingSlugs);
            
            _db.Courses.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int id, Course entity)
        {
            var existing = await _db.Courses.FindAsync(id);
            if (existing == null) return false;
            
            if (existing.Name != entity.Name)
            {
                var existingSlugs = await _db.Courses
                    .Where(c => c.CourseId != id)
                    .Select(c => c.Slug)
                    .ToListAsync();
                
                entity.Slug = SlugGenerator.GenerateUniqueSlug(entity.Name, existingSlugs);
            }
            else
            {
                entity.Slug = existing.Slug;
            }
            
            entity.CourseId = id;
            _db.Entry(existing).State = EntityState.Detached;
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Courses.FindAsync(id);
            if (entity == null) return false;
            _db.Courses.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<Course>> GetCoursesByTeacherIdAsync(int teacherId)
        {
            return await _db.Courses
                .Include(c => c.Sections)
                .Where(c => c.Sections.Any(s => s.TeacherId == teacherId))
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
