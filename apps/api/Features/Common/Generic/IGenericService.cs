using System.Collections.Generic;
using System.Threading.Tasks;

namespace CiberCheck.Interfaces
{
    public interface IGenericService<T> where T : class
    {
        Task<List<T>> GetAllAsync();
        Task<T?> GetByIdAsync(params object[] keyValues);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task<bool> DeleteAsync(params object[] keyValues);
    }
}
