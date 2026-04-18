using AutoMapper;
using CiberCheck.Features.Users.Dtos;
using CiberCheck.Features.Courses.Dtos;
using CiberCheck.Features.Sections.Dtos;
using CiberCheck.Features.Sessions.Dtos;
using CiberCheck.Features.Attendance.Dtos;
using CiberCheck.Features.Otps.Dtos;
using CiberCheck.Features.Users.Entities;
using CiberCheck.Features.Courses.Entities;
using CiberCheck.Features.Sections.Entities;
using CiberCheck.Features.Sessions.Entities;

using OtpEntity = CiberCheck.Features.Otps.Entities.Otp;
using AttendanceEntity = CiberCheck.Features.Attendance.Entities.Attendance;
using SessionQrTokenEntity = CiberCheck.Features.Attendance.Entities.SessionQrToken;

namespace CiberCheck.Features.Common.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>()
                .ForMember(d => d.PasswordHash, o => o.Ignore());
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Course
            CreateMap<Course, CourseDto>();
            CreateMap<CreateCourseDto, Course>();
            CreateMap<UpdateCourseDto, Course>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Section
            CreateMap<Section, SectionDto>()
                .ForMember(dest => dest.IsVirtual, opt => opt.MapFrom(src => src.IsVirtual));
            CreateMap<CreateSectionDto, Section>();
            CreateMap<UpdateSectionDto, Section>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Session
            CreateMap<Session, SessionDto>();
            CreateMap<CreateSessionDto, Session>();
            CreateMap<UpdateSessionDto, Session>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Attendance
            CreateMap<AttendanceEntity, AttendanceDto>();
            CreateMap<CreateAttendanceDto, AttendanceEntity>();
            CreateMap<UpdateAttendanceDto, AttendanceEntity>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Session QR Token
            CreateMap<SessionQrTokenEntity, SessionQrTokenDto>();

            // 🔹 OTP
            CreateMap<OtpEntity, OtpDto>();
            CreateMap<CreateOtpDto, OtpEntity>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        }
    }
}
