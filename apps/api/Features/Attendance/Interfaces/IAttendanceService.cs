using CiberCheck.Features.Attendance.Dtos;
using CiberCheck.Features.Attendance.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CiberCheck.Interfaces
{
    public interface IAttendanceService
    {
        Task<List<Attendance>> GetAllAsync();
        Task<Attendance?> GetByIdAsync(int studentId, int sessionId);
        Task<Attendance> CreateAsync(Attendance entity);
        Task<bool> UpdateAsync(int studentId, int sessionId, Attendance entity);
        Task<bool> DeleteAsync(int studentId, int sessionId);
        Task<List<StudentAttendanceViewDto>> GetStudentHistoryAsync(int studentId);
        
        Task<List<StudentAttendanceViewDto>> GetHistoryByDateAsync(int studentId, DateOnly date);
        Task<List<StudentAttendanceViewDto>> GetHistoryByStatusAsync(int studentId, string status);
        Task<List<StudentAttendanceViewDto>> FilterHistoryAsync(
    int studentId, DateOnly? date, string? status);


    }
}
