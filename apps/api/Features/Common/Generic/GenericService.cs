using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;

namespace CiberCheck.Services
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        private readonly ApplicationDbContext _db;
        private readonly DbSet<T> _set;

        public GenericService(ApplicationDbContext db)
        {
            _db = db;
            _set = _db.Set<T>();
        }

        public async Task<List<T>> GetAllAsync()
            => await _set.AsNoTracking().ToListAsync();

        public async Task<T?> GetByIdAsync(params object[] keyValues)
            => await _set.FindAsync(keyValues);

        public async Task<T> AddAsync(T entity)
        {
            _set.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(T entity)
        {
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(params object[] keyValues)
        {
            var entity = await _set.FindAsync(keyValues);
            if (entity == null) return false;
            _set.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
