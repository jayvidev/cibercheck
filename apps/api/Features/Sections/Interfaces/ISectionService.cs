using System.Collections.Generic;
using System.Threading.Tasks;
using CiberCheck.Features.Sections.Entities;

namespace CiberCheck.Interfaces
{
    public interface ISectionService
    {
        Task<List<Section>> GetAllAsync();
        Task<Section?> GetByIdAsync(int id);
        Task<Section?> GetBySlugAsync(int courseId, string slug);
        Task<Section> CreateAsync(Section entity);
        Task<bool> UpdateAsync(int id, Section entity);
        Task<bool> DeleteAsync(int id);
    }
}
