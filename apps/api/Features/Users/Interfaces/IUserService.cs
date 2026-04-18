using System.Collections.Generic;
using System.Threading.Tasks;
using CiberCheck.Features.Users.Entities;

namespace CiberCheck.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateAsync(User entity);
        Task<bool> UpdateAsync(int id, User entity);
        Task<bool> DeleteAsync(int id);
        Task<bool> EmailExistsAsync(string email);
    }
}
