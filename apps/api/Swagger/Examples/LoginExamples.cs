using CiberCheck.Features.Users.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class LoginDtoExample : IExamplesProvider<LoginDto>
    {
        public LoginDto GetExamples()
        {
            return new LoginDto
            {
                Email = "jperez@cibertec.edu.pe",
                Password = "profe123"
            };
        }
    }

    public class LoginResponseDtoExample : IExamplesProvider<LoginResponseDto>
    {
        public LoginResponseDto GetExamples()
        {
            return new LoginResponseDto
            {
                Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InByb2Zlc29yIn0.xyz",
                User = new UserDto
                {
                    UserId = 1,
                    FirstName = "Juan",
                    LastName = "Pérez",
                    Email = "jperez@cibertec.edu.pe",
                    Role = "profesor"
                }
            };
        }
    }
}
