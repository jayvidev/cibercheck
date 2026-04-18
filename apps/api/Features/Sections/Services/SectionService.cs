using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;
using CiberCheck.Features.Sections.Entities;
using CiberCheck.Features.Common.Helpers;

namespace CiberCheck.Services
{
    public class SectionService : ISectionService
    {
        private readonly ApplicationDbContext _db;

        public SectionService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<Section>> GetAllAsync()
            => await _db.Sections.AsNoTracking().ToListAsync();

        public async Task<Section?> GetByIdAsync(int id)
            => await _db.Sections.FindAsync(id);

        public async Task<Section?> GetBySlugAsync(int courseId, string slug)
            => await _db.Sections
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.CourseId == courseId && s.Slug == slug);

        public async Task<Section> CreateAsync(Section entity)
        {
            // Auto-generar slug desde el nombre (único dentro del curso)
            var existingSlugs = await _db.Sections
                .Where(s => s.CourseId == entity.CourseId)
                .Select(s => s.Slug)
                .ToListAsync();
            
            entity.Slug = SlugGenerator.GenerateUniqueSlug(entity.Name, existingSlugs);
            
            _db.Sections.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int id, Section entity)
        {
            var existing = await _db.Sections.FindAsync(id);
            if (existing == null) return false;
            
            // Si el nombre cambió, regenerar slug
            if (existing.Name != entity.Name)
            {
                var existingSlugs = await _db.Sections
                    .Where(s => s.SectionId != id && s.CourseId == entity.CourseId)
                    .Select(s => s.Slug)
                    .ToListAsync();
                
                entity.Slug = SlugGenerator.GenerateUniqueSlug(entity.Name, existingSlugs);
            }
            else
            {
                entity.Slug = existing.Slug;
            }
            
            entity.SectionId = id;
            _db.Entry(existing).State = EntityState.Detached;
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Sections.FindAsync(id);
            if (entity == null) return false;
            _db.Sections.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
