using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;
using CiberCheck.Features.Users.Entities;

namespace CiberCheck.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;

        public UserService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<User>> GetAllAsync()
            => await _db.Users.AsNoTracking().ToListAsync();

        public async Task<User?> GetByIdAsync(int id)
            => await _db.Users.FindAsync(id);

        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User> CreateAsync(User entity)
        {
            _db.Users.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int id, User entity)
        {
            var exists = await _db.Users.AnyAsync(e => e.UserId == id);
            if (!exists) return false;
            entity.UserId = id;
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _db.Users.FindAsync(id);
            if (entity == null) return false;
            _db.Users.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmailExistsAsync(string email)
            => await _db.Users.AsNoTracking().AnyAsync(u => u.Email == email);
    }
}
