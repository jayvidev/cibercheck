using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CiberCheck.Data;
using CiberCheck.Interfaces;
using CiberCheck.Features.Attendance.Entities;
using CiberCheck.Features.Attendance.Dtos;

namespace CiberCheck.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _db;

        public AttendanceService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<Attendance>> GetAllAsync()
            => await _db.Attendances.AsNoTracking().ToListAsync();

        public async Task<Attendance?> GetByIdAsync(int studentId, int sessionId)
            => await _db.Attendances.FindAsync(studentId, sessionId);

        public async Task<Attendance> CreateAsync(Attendance entity)
        {
            _db.Attendances.Add(entity);
            await _db.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(int studentId, int sessionId, Attendance entity)
        {
            var exists = await _db.Attendances.AnyAsync(e => e.StudentId == studentId && e.SessionId == sessionId);
            if (!exists) return false;
            entity.StudentId = studentId;
            entity.SessionId = sessionId;
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int studentId, int sessionId)
        {
            var entity = await _db.Attendances.FindAsync(studentId, sessionId);
            if (entity == null) return false;
            _db.Attendances.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }

        //filtrado general
        public async Task<List<StudentAttendanceViewDto>> GetStudentHistoryAsync(int studentId)
        {
            return await _db.Sessions
                .Include(s => s.Section)
                    .ThenInclude(sec => sec.Course)
                .Include(s => s.Attendances)
                .Where(s => s.Attendances.Any(a => a.StudentId == studentId))
                .Select(s => new StudentAttendanceViewDto
                {
                    CourseName = s.Section.Course.Name,
                    SectionName = s.Section.Name,
                    SessionName = $"Sesión {s.SessionNumber}", // o usa otro campo si lo tienes
                    SessionDate = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Status = s.Attendances
                                .Where(a => a.StudentId == studentId)
                                .Select(a => a.Status)
                                .FirstOrDefault() ?? "ausente"
                })
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
        }

        //filtrado por fecha
        public async Task<List<StudentAttendanceViewDto>> GetHistoryByDateAsync(int studentId, DateOnly date)
        {
            var history = await GetStudentHistoryAsync(studentId);
            return history
                .Where(x => x.SessionDate == date)
                .ToList();
        }

        //filtrado por estado
        public async Task<List<StudentAttendanceViewDto>> GetHistoryByStatusAsync(int studentId, string status)
        {
            var history = await GetStudentHistoryAsync(studentId);
            return history
                .Where(x => x.Status.ToLower() == status.ToLower())
                .ToList();
        }
        //filtrado por fecha y curso
        public async Task<List<StudentAttendanceViewDto>> FilterHistoryAsync(
     int studentId, DateOnly? date, string? status)
        {
            var history = await GetStudentHistoryAsync(studentId);

            if (date.HasValue)
                history = history
                    .Where(x => x.SessionDate == date.Value)
                    .ToList();

            if (!string.IsNullOrEmpty(status))
                history = history
                    .Where(x => x.Status != null && x.Status.Equals(status, StringComparison.OrdinalIgnoreCase))
                    .ToList();

            return history;
        }

       
    }
}
